-- SettleUp initial schema: groups, members, expenses, splits, settlements + RLS

-- Groups (trips)
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'trip',
  base_currency text not null default 'INR',
  spend_currency text not null default 'INR',
  fx_mode text not null default 'fixed',
  fixed_fx_rate numeric not null default 1,
  simplify_debts boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Members: app users or placeholder (user_id null until they join)
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id),
  name text not null,
  avatar text not null default '?',
  upi_id text,
  created_at timestamptz not null default now()
);

-- Expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  amount numeric not null check (amount > 0),
  currency text not null,
  base_amount numeric not null,
  category_id text not null default 'other',
  paid_by uuid not null references public.group_members(id),
  split_mode text not null default 'equal',
  expense_date date not null default current_date,
  receipt_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Per-member split rows (amount_owed in base currency)
create table public.expense_splits (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  member_id uuid not null references public.group_members(id) on delete cascade,
  amount_owed numeric not null,
  share_value numeric,
  primary key (expense_id, member_id)
);

-- Settlements between members
create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  from_member uuid not null references public.group_members(id),
  to_member uuid not null references public.group_members(id),
  amount numeric not null check (amount > 0),
  currency text not null,
  status text not null default 'pending',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  check (from_member != to_member)
);

-- Membership helper (security definer to avoid RLS recursion)
create or replace function public.is_group_member(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

-- RLS on
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;
alter table public.settlements enable row level security;

-- Groups: creator + members can read/write
create policy "groups_select" on public.groups for select
  using (created_by = auth.uid() or public.is_group_member(id));
create policy "groups_insert" on public.groups for insert
  with check (created_by = auth.uid());
create policy "groups_update" on public.groups for update
  using (created_by = auth.uid() or public.is_group_member(id));
create policy "groups_delete" on public.groups for delete
  using (created_by = auth.uid());

-- Members: members read; members + group creator add/update
create policy "members_select" on public.group_members for select
  using (public.is_group_member(group_id));
create policy "members_insert" on public.group_members for insert
  with check (
    public.is_group_member(group_id)
    or exists (select 1 from public.groups where id = group_id and created_by = auth.uid())
  );
create policy "members_update" on public.group_members for update
  using (public.is_group_member(group_id));
create policy "members_delete" on public.group_members for delete
  using (public.is_group_member(group_id));

-- Expenses: members only
create policy "expenses_select" on public.expenses for select
  using (public.is_group_member(group_id));
create policy "expenses_insert" on public.expenses for insert
  with check (public.is_group_member(group_id));
create policy "expenses_update" on public.expenses for update
  using (public.is_group_member(group_id));
create policy "expenses_delete" on public.expenses for delete
  using (public.is_group_member(group_id));

-- Splits: members of the parent expense's group
create policy "splits_all" on public.expense_splits for all
  using (
    exists (select 1 from public.expenses where id = expense_id and public.is_group_member(group_id))
  )
  with check (
    exists (select 1 from public.expenses where id = expense_id and public.is_group_member(group_id))
  );

-- Settlements: members only
create policy "settlements_select" on public.settlements for select
  using (public.is_group_member(group_id));
create policy "settlements_insert" on public.settlements for insert
  with check (public.is_group_member(group_id));
create policy "settlements_update" on public.settlements for update
  using (public.is_group_member(group_id));
create policy "settlements_delete" on public.settlements for delete
  using (public.is_group_member(group_id));
