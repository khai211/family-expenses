-- Rebuild budgeting around income + the 50/30/20 (needs/wants/savings) rule
-- instead of disconnected flat category caps.

alter table households add column monthly_income numeric(12, 2);
alter table households add column needs_pct numeric(5, 2) not null default 50;
alter table households add column wants_pct numeric(5, 2) not null default 30;
alter table households add column savings_pct numeric(5, 2) not null default 20;

create policy "members can update their household" on households
  for update using (is_household_member(id)) with check (is_household_member(id));

alter table categories add column bucket text check (bucket in ('needs', 'wants', 'savings'));

update categories set bucket = 'needs'
where name in ('Groceries', 'Transport', 'Health', 'Insurance', 'Utilities', 'Business');
update categories set bucket = 'wants'
where name in ('Dining', 'Subscriptions', 'Entertainment');

-- Log each change in a goal's saved amount so monthly savings contributions
-- (the "savings" bucket's actual spend) can be computed accurately.
create table goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

alter table goal_contributions enable row level security;

create policy "members can manage goal contributions" on goal_contributions
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));
