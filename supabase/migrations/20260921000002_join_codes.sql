-- Group join codes: shareable code + secure join RPC

alter table public.groups add column join_code text;

-- Backfill existing groups (client generates clean codes going forward)
update public.groups
set join_code = upper(substring(md5(random()::text) from 1 for 6))
where join_code is null;

alter table public.groups alter column join_code set not null;
alter table public.groups add constraint groups_join_code_unique unique (join_code);

-- Join by code: look up + insert-or-claim as the caller, all server-side
-- so groups stay unlistable (no public select needed to join).
create or replace function public.join_group(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  gid uuid;
  uemail text := auth.jwt() ->> 'email';
  uname text := coalesce(
    nullif(auth.jwt() -> 'user_metadata' ->> 'display_name', ''),
    nullif(split_part(coalesce(uemail, ''), '@', 1), ''),
    'Friend'
  );
begin
  select id into gid from public.groups where join_code = upper(trim(p_code));
  if gid is null then
    raise exception 'Invalid group code';
  end if;

  -- Already a member: idempotent return
  if exists (select 1 from public.group_members where group_id = gid and user_id = auth.uid()) then
    return gid;
  end if;

  -- Claim a matching email placeholder, else insert fresh
  if uemail is not null then
    update public.group_members
    set user_id = auth.uid(), name = uname
    where group_id = gid and user_id is null and email = uemail;
    if found then
      return gid;
    end if;
  end if;

  insert into public.group_members (group_id, user_id, name, avatar)
  values (gid, auth.uid(), uname, upper(left(uname, 1)));
  return gid;
end $$;

grant execute on function public.join_group(text) to authenticated;
