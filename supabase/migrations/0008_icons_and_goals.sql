-- Category icons, plus a new goals table for savings goals (e.g. Travel).

alter table categories add column icon text not null default 'tag';

update categories set icon = 'shopping-cart' where name = 'Groceries';
update categories set icon = 'utensils' where name = 'Dining';
update categories set icon = 'car' where name = 'Transport';
update categories set icon = 'repeat' where name = 'Subscriptions';
update categories set icon = 'heart-pulse' where name = 'Health';
update categories set icon = 'shield' where name = 'Insurance';
update categories set icon = 'zap' where name = 'Utilities';
update categories set icon = 'clapperboard' where name = 'Entertainment';
update categories set icon = 'briefcase' where name = 'Business';

create table goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null,
  current_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table goals enable row level security;

create policy "members can manage goals" on goals
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));
