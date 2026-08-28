export type Transaction = {
  id: string;
  household_id: string;
  added_by: string;
  date: string; // YYYY-MM-DD
  amount: number;
  merchant_raw: string | null;
  merchant_clean: string | null;
  category: string | null;
  note: string | null;
  is_family: boolean;
  source: "manual" | "statement_import";
  source_file: string | null;
  created_at: string;
};

export type Budget = {
  id: string;
  household_id: string;
  category: string | null; // null = overall
  monthly_amount: number;
};

export type CategoryRule = {
  id: string;
  household_id: string;
  merchant_pattern: string;
  category: string | null;
  clean_name: string | null;
};

export type Goal = {
  id: string;
  household_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
};

export type HouseholdMember = {
  user_id: string;
  email: string | null;
};

export type Bucket = "needs" | "wants" | "savings";

export type Household = {
  id: string;
  name: string;
  monthly_income: number | null;
  needs_pct: number;
  wants_pct: number;
  savings_pct: number;
};
