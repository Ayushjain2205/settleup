-- Member invites: email column + claim policies

alter table public.group_members add column email text;

-- Let email-invitees see the group (so they can open + claim it)
drop policy "groups_select" on public.groups;
create policy "groups_select" on public.groups for select
  using (
    created_by = auth.uid()
    or public.is_group_member(id)
    or exists (
      select 1 from public.group_members
      where group_id = id
        and user_id is null
        and email = auth.jwt() ->> 'email'
    )
  );

-- Let invitees see their own placeholder row
drop policy "members_select" on public.group_members;
create policy "members_select" on public.group_members for select
  using (
    public.is_group_member(group_id)
    or (user_id is null and email = auth.jwt() ->> 'email')
  );

-- Let invitees claim their row (and only to themselves)
drop policy "members_update" on public.group_members;
create policy "members_update" on public.group_members for update
  using (
    public.is_group_member(group_id)
    or (user_id is null and email = auth.jwt() ->> 'email')
  )
  with check (
    public.is_group_member(group_id)
    or (user_id = auth.uid() and email = auth.jwt() ->> 'email')
  );
