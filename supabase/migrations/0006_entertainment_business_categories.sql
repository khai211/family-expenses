-- New categories: Entertainment (Shaw Theatres) and Business (ACRA).

insert into category_rules (household_id, merchant_pattern, category, clean_name) values
  ('00000000-0000-0000-0000-000000000001', 'Shaw Theatres', 'Entertainment', 'Shaw Theatres'),
  ('00000000-0000-0000-0000-000000000001', 'ACRA', 'Business', 'ACRA');

-- Retroactively categorize any already-imported transactions matching these.
update transactions
set category = 'Entertainment', merchant_clean = 'Shaw Theatres'
where household_id = '00000000-0000-0000-0000-000000000001'
  and category is null
  and merchant_raw ilike '%Shaw Theatres%';

update transactions
set category = 'Business', merchant_clean = 'ACRA'
where household_id = '00000000-0000-0000-0000-000000000001'
  and category is null
  and merchant_raw ilike '%ACRA%';
