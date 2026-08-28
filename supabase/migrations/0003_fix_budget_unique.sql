-- The partial unique indexes for budgets can't be used as an ON CONFLICT
-- target for upserts. Replace them with a single constraint that treats
-- NULL category (the overall budget) as one distinct value.

drop index if exists budgets_category_uidx;
drop index if exists budgets_overall_uidx;

alter table budgets
  add constraint budgets_household_category_uidx
  unique nulls not distinct (household_id, category);
