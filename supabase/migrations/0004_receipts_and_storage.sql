-- Allow a third transaction source for receipt-photo imports, and add
-- private storage for uploaded statements/receipts, scoped by household.

alter table transactions drop constraint transactions_source_check;
alter table transactions add constraint transactions_source_check
  check (source in ('manual', 'statement_import', 'receipt_scan'));

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

-- Objects are stored as uploads/{household_id}/{filename}; a member may
-- read/write only under their own household's folder.
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
