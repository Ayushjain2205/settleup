-- Atomic expense upsert: expense + splits in one roundtrip.
-- Invoker rights: RLS policies apply normally, no privilege escalation.
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
  p_expense_id uuid default null
)
returns uuid language plpgsql set search_path = public as $$
declare
  eid uuid;
  s jsonb;
begin
  if p_expense_id is null then
    insert into public.expenses (group_id, title, amount, currency, base_amount, category_id, paid_by, split_mode, expense_date, created_by)
    values (p_group_id, p_title, p_amount, p_currency, p_base_amount, p_category_id, p_paid_by, p_split_mode, p_expense_date, auth.uid())
    returning id into eid;
  else
    update public.expenses set
      title = p_title,
      amount = p_amount,
      currency = p_currency,
      base_amount = p_base_amount,
      category_id = p_category_id,
      paid_by = p_paid_by,
      split_mode = p_split_mode,
      expense_date = p_expense_date
    where id = p_expense_id and group_id = p_group_id;
    if not found then
      raise exception 'Expense not found';
    end if;
    eid := p_expense_id;
    delete from public.expense_splits where expense_id = eid;
  end if;

  for s in select * from jsonb_array_elements(p_splits) loop
    insert into public.expense_splits (expense_id, member_id, amount_owed)
    values (eid, (s ->> 'memberId')::uuid, (s ->> 'amountOwed')::numeric);
  end loop;

  return eid;
end $$;

grant execute on function public.save_expense(uuid, text, numeric, text, numeric, text, uuid, text, date, jsonb, uuid) to authenticated;
