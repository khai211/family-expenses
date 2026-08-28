-- Family Expenses: initial schema
-- Run this once in Supabase Studio -> SQL Editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Household',
  created_at timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- Pre-authorized emails that auto-join a household on first sign-in.
create table household_invites (
  household_id uuid not null references households(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  primary key (household_id, email)
);

create table category_rules (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  merchant_pattern text not null,
  category text,
  clean_name text,
  created_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  added_by uuid not null references auth.users(id),
  date date not null,
  amount numeric(12, 2) not null,
  merchant_raw text,
  merchant_clean text,
  category text,
  note text,
  is_family boolean not null default true,
  source text not null default 'manual' check (source in ('manual', 'statement_import')),
  source_file text,
  created_at timestamptz not null default now()
);

create index transactions_household_date_idx on transactions (household_id, date desc);

create table budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  category text, -- null = overall household budget
  monthly_amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create unique index budgets_category_uidx on budgets (household_id, category) where category is not null;
create unique index budgets_overall_uidx on budgets (household_id) where category is null;

-- ---------------------------------------------------------------------------
-- Auto-join: when a pre-authorized email signs in for the first time,
-- link them to their household automatically.
-- ---------------------------------------------------------------------------

create or replace function handle_new_user_household_invite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into household_members (household_id, user_id)
  select household_id, new.id
  from household_invites
  where lower(email) = lower(new.email)
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user_household_invite();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

create or replace function is_household_member(hh uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from household_members
    where household_id = hh and user_id = auth.uid()
  );
$$;

alter table households enable row level security;
alter table household_members enable row level security;
alter table household_invites enable row level security;
alter table category_rules enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;

create policy "members can read their household" on households
  for select using (is_household_member(id));

create policy "members can read their memberships" on household_members
  for select using (user_id = auth.uid());

create policy "members can read their household's invites" on household_invites
  for select using (is_household_member(household_id));

create policy "members can manage category rules" on category_rules
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "members can manage transactions" on transactions
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "members can manage budgets" on budgets
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

insert into households (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Our Household');

insert into household_invites (household_id, email) values
  ('00000000-0000-0000-0000-000000000001', 'khailin@gmail.com');

insert into category_rules (household_id, merchant_pattern, category, clean_name) values
  ('00000000-0000-0000-0000-000000000001', 'Netflix', 'Subscriptions', 'Netflix'),
  ('00000000-0000-0000-0000-000000000001', 'Vivifi', 'Subscriptions', 'Vivifi'),
  ('00000000-0000-0000-0000-000000000001', 'Google One', 'Subscriptions', 'Google One'),
  ('00000000-0000-0000-0000-000000000001', 'Amazon Prime', 'Subscriptions', 'Amazon Prime'),
  ('00000000-0000-0000-0000-000000000001', 'Apple.com', 'Subscriptions', 'Apple'),
  ('00000000-0000-0000-0000-000000000001', 'StarHub', 'Subscriptions', 'StarHub'),

  ('00000000-0000-0000-0000-000000000001', 'NTUC', 'Groceries', 'NTUC FairPrice'),
  ('00000000-0000-0000-0000-000000000001', 'FairPrice', 'Groceries', 'NTUC FairPrice'),
  ('00000000-0000-0000-0000-000000000001', 'Cold Storage', 'Groceries', 'Cold Storage'),
  ('00000000-0000-0000-0000-000000000001', 'Don Don Donki', 'Groceries', 'Don Don Donki'),
  ('00000000-0000-0000-0000-000000000001', 'Sheng Siong', 'Groceries', 'Sheng Siong'),
  ('00000000-0000-0000-0000-000000000001', 'Giant', 'Groceries', 'Giant'),
  ('00000000-0000-0000-0000-000000000001', 'Nespresso', 'Groceries', 'Nespresso'),
  ('00000000-0000-0000-0000-000000000001', 'SP Method Home', 'Groceries', 'SP Method Home'),

  ('00000000-0000-0000-0000-000000000001', 'Guardian', 'Health', 'Guardian'),
  ('00000000-0000-0000-0000-000000000001', 'Watsons', 'Health', 'Watsons'),
  ('00000000-0000-0000-0000-000000000001', 'Raffles Clinic', 'Health', 'Raffles Clinic'),
  ('00000000-0000-0000-0000-000000000001', 'Raffles Medical', 'Health', 'Raffles Medical'),
  ('00000000-0000-0000-0000-000000000001', 'Polyclinic', 'Health', 'Polyclinic'),
  ('00000000-0000-0000-0000-000000000001', 'Unity', 'Health', 'Unity Pharmacy'),
  ('00000000-0000-0000-0000-000000000001', 'iHerb', 'Health', 'iHerb'),

  ('00000000-0000-0000-0000-000000000001', 'Pizza Hut', 'Dining', 'Pizza Hut'),

  ('00000000-0000-0000-0000-000000000001', 'SimplyGo', 'Transport', 'SimplyGo'),
  ('00000000-0000-0000-0000-000000000001', 'Grab', 'Transport', 'Grab'),
  ('00000000-0000-0000-0000-000000000001', 'Gojek', 'Transport', 'Gojek'),

  ('00000000-0000-0000-0000-000000000001', 'Prudential', 'Insurance', 'Prudential'),
  ('00000000-0000-0000-0000-000000000001', 'Great Eastern', 'Insurance', 'Great Eastern'),
  ('00000000-0000-0000-0000-000000000001', 'Etiqa', 'Insurance', 'Etiqa'),

  ('00000000-0000-0000-0000-000000000001', 'SP Group', 'Utilities', 'SP Group'),
  ('00000000-0000-0000-0000-000000000001', 'SPL AUTO TOPUP', 'Utilities', 'SP Group'),
  ('00000000-0000-0000-0000-000000000001', 'SPL-eServices', 'Utilities', 'SP Group');
