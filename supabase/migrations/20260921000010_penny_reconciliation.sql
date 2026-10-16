-- Penny-dust hardening: make the ledger zero-sum by construction.
--
-- Root cause of the "0.01 still pending" bug: equal splits round each share
-- to cents (1300/3 -> 433.33 x3 = 1299.99), leaving a phantom 0.01 credit
-- that recorded settlements can never clear. The client now distributes
-- leftover pennies (largest-remainder), but any client can be bypassed, so
-- the RPC reconciles authoritatively too. Tolerance is dust-only (at most a
-- penny per leg); larger gaps are genuine partial splits and are left alone.

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
  p_expense_id uuid default null::uuid,
  p_payers jsonb default null::jsonb,
  p_items jsonb default null::jsonb
)
returns uuid language plpgsql set search_path to 'public' as $$
declare
  eid uuid;
  s jsonb;
  p jsonb;
  it jsonb;
  idx int := 0;
  sm uuid[];
  v_first_paid uuid;
  v_payer_count int := 0;
  v_split_n int := 0;
  v_split_sum numeric := 0;
  v_split_diff numeric := 0;
  v_fix_idx int := 0;
  v_i int;
  v_payer_sum numeric := 0;
  v_payer_diff numeric := 0;
begin
  -- Canonical 2-decimal total before comparing legs.
  p_base_amount := round(p_base_amount, 2);

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

  -- Authoritative penny reconciliation: dust-only (<= 1p per leg).
  if p_splits is not null and jsonb_typeof(p_splits) = 'array' then
    v_split_n := jsonb_array_length(p_splits);
    if v_split_n > 0 then
      select coalesce(sum((x ->> 'amountOwed')::numeric), 0)
        into v_split_sum
        from jsonb_array_elements(p_splits) x;
      v_split_diff := round(p_base_amount - v_split_sum, 2);
      if v_split_diff <> 0 and abs(v_split_diff) <= v_split_n * 0.01 then
        -- Prefer the payer's own leg so existing settlements keep matching.
        v_fix_idx := 0;
        for v_i in 0..v_split_n - 1 loop
          if ((p_splits -> v_i ->> 'memberId')::uuid = v_first_paid) then
            v_fix_idx := v_i;
            exit;
          end if;
        end loop;
        p_splits := jsonb_set(
          p_splits,
          array[v_fix_idx::text, 'amountOwed'],
          to_jsonb(round(((p_splits -> v_fix_idx ->> 'amountOwed')::numeric + v_split_diff), 2))
        );
      end if;
    end if;
  end if;

  -- Same dust guard for multi-payer legs.
  if v_payer_count > 0 then
    select coalesce(sum((x ->> 'amountPaid')::numeric), 0)
      into v_payer_sum
      from jsonb_array_elements(p_payers) x;
    v_payer_diff := round(p_base_amount - v_payer_sum, 2);
    if v_payer_diff <> 0 and abs(v_payer_diff) <= v_payer_count * 0.01 then
      p_payers := jsonb_set(
        p_payers,
        array['0', 'amountPaid'],
        to_jsonb(round(((p_payers -> 0 ->> 'amountPaid')::numeric + v_payer_diff), 2))
      );
    end if;
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
    values (eid, (s ->> 'memberId')::uuid, round((s ->> 'amountOwed')::numeric, 2));
  end loop;

  if v_payer_count > 0 then
    for p in select * from jsonb_array_elements(p_payers) loop
      insert into public.expense_payers (expense_id, member_id, amount_paid)
      values (eid, (p ->> 'memberId')::uuid, round((p ->> 'amountPaid')::numeric, 2));
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

-- One-time repair for dust written before the guards existed: per expense,
-- if splits are off from base by dust-only (<= 1p per split), fold the diff
-- into the payer's own split (else the first split). Idempotent.
do $$
declare
  r record;
  v_diff numeric;
  v_n int;
  v_target uuid;
begin
  for r in
    select e.id, e.base_amount, e.paid_by, count(s.*) as n,
           coalesce(sum(s.amount_owed), 0) as total
    from public.expenses e
    left join public.expense_splits s on s.expense_id = e.id
    group by e.id
  loop
    v_n := greatest(r.n, 0);
    if v_n = 0 then continue; end if;
    v_diff := round(r.base_amount - r.total, 2);
    if v_diff <> 0 and abs(v_diff) <= v_n * 0.01 then
      select s.member_id into v_target
      from public.expense_splits s
      where s.expense_id = r.id and s.member_id = r.paid_by
      limit 1;
      if v_target is null then
        select s.member_id into v_target
        from public.expense_splits s
        where s.expense_id = r.id
        order by s.member_id
        limit 1;
      end if;
      update public.expense_splits
      set amount_owed = round(amount_owed + v_diff, 2)
      where expense_id = r.id and member_id = v_target;
    end if;
  end loop;
end $$;

-- Monitoring view: at scale, alert when any row appears here.
-- Healthy ledger => zero rows.
create or replace view public.expense_ledger_health as
select e.id as expense_id, e.group_id, e.title,
       e.base_amount,
       coalesce(s.total, 0) as splits_total,
       round(e.base_amount - coalesce(s.total, 0), 2) as splits_diff,
       coalesce(p.total, 0) as payers_total,
       round(e.base_amount - coalesce(p.total, 0), 2) as payers_diff
from public.expenses e
left join (select expense_id, sum(amount_owed) as total
           from public.expense_splits group by expense_id) s on s.expense_id = e.id
left join (select expense_id, sum(amount_paid) as total
           from public.expense_payers group by expense_id) p on p.expense_id = e.id
where abs(round(e.base_amount - coalesce(s.total, 0), 2)) > 0.001
   or abs(round(e.base_amount - coalesce(p.total, 0), 2)) > 0.001;
