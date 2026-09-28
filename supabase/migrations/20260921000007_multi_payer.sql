-- Multi-payer support: per-expense payer breakdown (base currency amounts)
create table public.expense_payers (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  member_id uuid not null references public.group_members(id) on delete cascade,
  amount_paid numeric not null check (amount_paid > 0),
  primary key (expense_id, member_id)
);

alter table public.expense_payers enable row level security;

create policy "payers_all" on public.expense_payers for all
  using (
    exists (select 1 from public.expenses where id = expense_id and public.is_group_member(group_id))
  )
  with check (
    exists (select 1 from public.expenses where id = expense_id and public.is_group_member(group_id))
  );

-- Backfill single-payer history so reads can uniformly use the table
insert into public.expense_payers (expense_id, member_id, amount_paid)
select id, paid_by, base_amount from public.expenses
on conflict do nothing;

-- Updated save_expense: accepts optional multi-payer breakdown.
-- p_payers: jsonb array of {memberId, amountPaid (base currency)}.
-- When present and non-empty, paid_by is set to the first payer for legacy readers.
-- When null/empty, falls back to single p_paid_by (and writes one payer row).
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
  p_payers jsonb default null
)
returns uuid language plpgsql set search_path = public as $$
declare
  eid uuid;
  s jsonb;
  p jsonb;
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

  return eid;
end $$;

grant execute on function public.save_expense(uuid, text, numeric, text, numeric, text, uuid, text, date, jsonb, uuid, jsonb) to authenticated;
grant execute on function public.save_expense(uuid, text, numeric, text, numeric, text, uuid, text, date, jsonb, uuid) to authenticated;

create index if not exists idx_expense_payers_expense on public.expense_payers(expense_id);

-- Keep payer legs in sync when a group's fixed rate is revalued.
create or replace function public.revalue_group(p_group_id uuid, p_rate numeric)
returns void language plpgsql set search_path = public as $$
declare
  grp record;
  exp record;
  sp record;
  new_base numeric;
  factor numeric;
  running numeric;
  total numeric;
  ids uuid[];
  i int;
  p_running numeric;
  p_ids uuid[];
  p_count int;
begin
  if p_rate is null or p_rate <= 0 then
    raise exception 'Invalid rate';
  end if;

  select spend_currency, base_currency into grp
  from public.groups where id = p_group_id;
  if not found then
    raise exception 'Group not found';
  end if;

  update public.groups set fixed_fx_rate = p_rate where id = p_group_id;

  for exp in
    select id, amount, base_amount from public.expenses
    where group_id = p_group_id and currency = grp.spend_currency
  loop
    if exp.base_amount <= 0 then
      continue;
    end if;
    new_base := round(exp.amount * p_rate, 2);
    factor := new_base / exp.base_amount;

    select array_agg(s.member_id order by s.member_id), count(*), coalesce(sum(s.amount_owed), 0)
      into ids, i, total
      from public.expense_splits s where s.expense_id = exp.id;
    i := 0;
    running := 0;
    for sp in
      select member_id, amount_owed from public.expense_splits
      where expense_id = exp.id order by member_id
    loop
      i := i + 1;
      if i < array_length(ids, 1) then
        update public.expense_splits
        set amount_owed = round(sp.amount_owed * factor, 2)
        where expense_id = exp.id and member_id = sp.member_id;
        running := running + round(sp.amount_owed * factor, 2);
      else
        update public.expense_splits
        set amount_owed = round(new_base - running, 2)
        where expense_id = exp.id and member_id = sp.member_id;
      end if;
    end loop;

    -- Scale payer legs by the same factor, pin remainder to last payer
    select array_agg(member_id order by member_id), count(*)
      into p_ids, p_count
      from public.expense_payers where expense_id = exp.id;
    if p_count > 0 then
      i := 0;
      p_running := 0;
      for sp in
        select member_id, amount_paid from public.expense_payers
        where expense_id = exp.id order by member_id
      loop
        i := i + 1;
        if i < array_length(p_ids, 1) then
          update public.expense_payers
          set amount_paid = round(sp.amount_paid * factor, 2)
          where expense_id = exp.id and member_id = sp.member_id;
          p_running := p_running + round(sp.amount_paid * factor, 2);
        else
          update public.expense_payers
          set amount_paid = round(new_base - p_running, 2)
          where expense_id = exp.id and member_id = sp.member_id;
        end if;
      end loop;
    end if;

    update public.expenses set base_amount = new_base where id = exp.id;
  end loop;
end $$;

grant execute on function public.revalue_group(uuid, numeric) to authenticated;
