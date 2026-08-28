-- Re-create the storage.objects policies from 0004 defensively, in case
-- the earlier CREATE POLICY statements didn't actually take (the bucket
-- row from 0004 also silently failed to persist, suggesting the SQL
-- editor session may not have applied storage-schema statements that run).

drop policy if exists "members can read their household's uploads" on storage.objects;
drop policy if exists "members can write their household's uploads" on storage.objects;

create policy "members can read their household's uploads"
  on storage.objects for select
  using (
    bucket_id = 'uploads'
    and is_household_member((storage.foldername(name))[1]::uuid)
  );

create policy "members can write their household's uploads"
  on storage.objects for insert
  with check (
    bucket_id = 'uploads'
    and is_household_member((storage.foldername(name))[1]::uuid)
  );

select policyname, cmd from pg_policies
where schemaname = 'storage' and tablename = 'objects';
