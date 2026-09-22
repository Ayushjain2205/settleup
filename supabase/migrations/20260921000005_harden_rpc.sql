-- Harden join_group: reject anon callers (anon + null user_id would
-- otherwise let anyone spam placeholder members into any coded group).
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
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

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

-- Defense in depth: anon has no business calling it at all.
-- (Revoking from PUBLIC would also strip authenticated — don't.)
revoke execute on function public.join_group(text) from anon;
