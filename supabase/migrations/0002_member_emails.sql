-- Store each member's email on household_members so the UI can show
-- "added by" without needing access to the auth schema, and let members
-- see their household's full roster (not just their own row).

alter table household_members add column email text;

update household_members hm
set email = u.email
from auth.users u
where u.id = hm.user_id and hm.email is null;

create or replace function handle_new_user_household_invite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into household_members (household_id, user_id, email)
  select household_id, new.id, new.email
  from household_invites
  where lower(email) = lower(new.email)
  on conflict do nothing;
  return new;
end;
$$;

drop policy "members can read their memberships" on household_members;

create policy "members can read their household's roster" on household_members
  for select using (is_household_member(household_id));
