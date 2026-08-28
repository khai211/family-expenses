-- Categories become a proper household-editable table instead of a fixed
-- list in code, so new categories (like Entertainment, Business) can be
-- added from the settings page without a code change.

create table categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now(),
  unique (household_id, name)
);

alter table categories enable row level security;

create policy "members can manage categories" on categories
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

insert into categories (household_id, name, color) values
  ('00000000-0000-0000-0000-000000000001', 'Groceries', '#22C55E'),
  ('00000000-0000-0000-0000-000000000001', 'Dining', '#F97316'),
  ('00000000-0000-0000-0000-000000000001', 'Transport', '#3B82F6'),
  ('00000000-0000-0000-0000-000000000001', 'Subscriptions', '#A855F7'),
  ('00000000-0000-0000-0000-000000000001', 'Health', '#14B8A6'),
  ('00000000-0000-0000-0000-000000000001', 'Insurance', '#EF4444'),
  ('00000000-0000-0000-0000-000000000001', 'Utilities', '#EAB308'),
  ('00000000-0000-0000-0000-000000000001', 'Entertainment', '#EC4899'),
  ('00000000-0000-0000-0000-000000000001', 'Business', '#6366F1');
