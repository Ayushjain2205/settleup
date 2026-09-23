-- Revalue a group's spend-currency history when the fixed rate changes.
-- Expenses entered in base currency are untouched. Splits scale
-- proportionally with the remainder pinned to the last row so books balance.
-- Invoker rights: RLS policies apply normally.
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
    -- i reused below as counter; reset
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

    update public.expenses set base_amount = new_base where id = exp.id;
  end loop;
end $$;

grant execute on function public.revalue_group(uuid, numeric) to authenticated;
