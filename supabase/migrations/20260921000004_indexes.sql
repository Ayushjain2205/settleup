-- FK + lookup indexes (Supabase auto-indexes PKs/unique only).
-- Trivial tables today; this is future-proofing join + filter paths.
create index if not exists group_members_group_id_idx on public.group_members (group_id);
create index if not exists group_members_user_id_idx on public.group_members (user_id);
create index if not exists expenses_group_id_idx on public.expenses (group_id);
create index if not exists expenses_date_idx on public.expenses (group_id, expense_date desc);
create index if not exists expense_splits_expense_id_idx on public.expense_splits (expense_id);
create index if not exists expense_splits_member_id_idx on public.expense_splits (member_id);
create index if not exists settlements_group_id_idx on public.settlements (group_id);
