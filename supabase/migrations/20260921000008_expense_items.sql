-- Persist itemized lines (items + tax/charge adjustments) per expense so the
-- edit screen can show the original breakdown, not just per-member totals.
-- Amounts are stored in the expense's entered currency, matching the form.
create table public.expense_items (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  name text not null default '',
  amount numeric not null default 0,
  kind text not null default 'item' check (kind in ('item', 'adjustment')),
  auto boolean not null default false,
  position int not null default 0,
  split_among uuid[] not null default '{}'
);

alter table public.expense_items enable row level security;

create policy "items_all" on public.expense_items for all
  using (
    exists (select 1 from public.expenses where id = expense_id and public.is_group_member(group_id))
  )
  with check (
    exists (select 1 from public.expenses where id = expense_id and public.is_group_member(group_id))
  );

create index if not exists idx_expense_items_expense on public.expense_items(expense_id);

-- save_expense gains p_items: jsonb array of
-- {name, amount (entered-currency), kind, auto, splitAmong: [uuid]}.
-- Stored only for itemized mode; other modes clear the lines.
create or replace function public.save_expense(
  p_group_id uuid,
  p_title text,
  p_amount numeric,
  p_currency text,
  p_base_amount numeric,
  p_category_id text,
  p_paid_by uuid,
  p_split_mode text,
  p_expense_date date,
  p_splits jsonb,
  p_expense_id uuid default null,
  p_payers jsonb default null,
  p_items jsonb default null
)
returns uuid language plpgsql set search_path = public as $$
declare
  eid uuid;
  s jsonb;
  p jsonb;
  it jsonb;
  idx int := 0;
  sm uuid[];
  v_first_paid uuid;
  v_payer_count int := 0;
begin
  if p_payers is not null and jsonb_typeof(p_payers) = 'array' then
    v_payer_count := jsonb_array_length(p_payers);
  end if;

  if v_payer_count > 0 then
    v_first_paid := ((p_payers -> 0) ->> 'memberId')::uuid;
  else
    v_first_paid := p_paid_by;
  end if;

  if v_first_paid is null then
    raise exception 'Payer is required';
  end if;

  if p_expense_id is null then
    insert into public.expenses (group_id, title, amount, currency, base_amount, category_id, paid_by, split_mode, expense_date, created_by)
    values (p_group_id, p_title, p_amount, p_currency, p_base_amount, p_category_id, v_first_paid, p_split_mode, p_expense_date, auth.uid())
    returning id into eid;
  else
    update public.expenses set
      title = p_title,
      amount = p_amount,
      currency = p_currency,
      base_amount = p_base_amount,
      category_id = p_category_id,
      paid_by = v_first_paid,
      split_mode = p_split_mode,
      expense_date = p_expense_date
    where id = p_expense_id and group_id = p_group_id;
    if not found then
      raise exception 'Expense not found';
    end if;
    eid := p_expense_id;
    delete from public.expense_splits where expense_id = eid;
    delete from public.expense_payers where expense_id = eid;
    delete from public.expense_items where expense_id = eid;
  end if;

  for s in select * from jsonb_array_elements(p_splits) loop
    insert into public.expense_splits (expense_id, member_id, amount_owed)
    values (eid, (s ->> 'memberId')::uuid, (s ->> 'amountOwed')::numeric);
  end loop;

  if v_payer_count > 0 then
    for p in select * from jsonb_array_elements(p_payers) loop
      insert into public.expense_payers (expense_id, member_id, amount_paid)
      values (eid, (p ->> 'memberId')::uuid, (p ->> 'amountPaid')::numeric);
    end loop;
  else
    insert into public.expense_payers (expense_id, member_id, amount_paid)
    values (eid, p_paid_by, p_base_amount);
  end if;

  if p_items is not null and jsonb_typeof(p_items) = 'array' then
    for it in select * from jsonb_array_elements(p_items) loop
      select coalesce(array_agg(x::uuid), '{}') into sm
      from jsonb_array_elements_text(coalesce(it -> 'splitAmong', '[]'::jsonb)) x;
      insert into public.expense_items (expense_id, name, amount, kind, auto, position, split_among)
      values (
        eid,
        coalesce(it ->> 'name', ''),
        coalesce((nullif(it ->> 'amount', ''))::numeric, 0),
        coalesce(it ->> 'kind', 'item'),
        coalesce((it ->> 'auto')::boolean, false),
        idx,
        sm
      );
      idx := idx + 1;
    end loop;
  end if;

  return eid;
end $$;

grant execute on function public.save_expense(uuid, text, numeric, text, numeric, text, uuid, text, date, jsonb, uuid, jsonb, jsonb) to authenticated;
grant execute on function public.save_expense(uuid, text, numeric, text, numeric, text, uuid, text, date, jsonb, uuid, jsonb) to authenticated;
grant execute on function public.save_expense(uuid, text, numeric, text, numeric, text, uuid, text, date, jsonb, uuid) to authenticated;
