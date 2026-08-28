import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryRow } from "@/lib/category-data";
import type { Household } from "@/lib/types";
import { monthRange } from "@/lib/month";

export type BudgetBuckets = {
  needsSpent: number;
  wantsSpent: number;
  savingsContributed: number;
  needsTarget: number;
  wantsTarget: number;
  savingsTarget: number;
};

export async function getBudgetBuckets(
  supabase: SupabaseClient,
  householdId: string,
  month: string,
  categoryTotals: { category: string; amount: number }[],
  categories: CategoryRow[],
  household: Household | null,
): Promise<BudgetBuckets> {
  const { start, end } = monthRange(month);
  const { data: contributions } = await supabase
    .from("goal_contributions")
    .select("amount")
    .eq("household_id", householdId)
    .gte("created_at", start)
    .lt("created_at", end);

  const savingsContributed = (contributions ?? [])
    .map((c) => Number(c.amount))
    .filter((a) => a > 0)
    .reduce((a, b) => a + b, 0);

  const bucketOf = new Map(categories.map((c) => [c.name, c.bucket]));
  let needsSpent = 0;
  let wantsSpent = 0;
  for (const c of categoryTotals) {
    const bucket = bucketOf.get(c.category);
    if (bucket === "needs") needsSpent += c.amount;
    else if (bucket === "wants") wantsSpent += c.amount;
  }

  const income = household?.monthly_income ?? 0;
  return {
    needsSpent,
    wantsSpent,
    savingsContributed,
    needsTarget: (income * (household?.needs_pct ?? 50)) / 100,
    wantsTarget: (income * (household?.wants_pct ?? 30)) / 100,
    savingsTarget: (income * (household?.savings_pct ?? 20)) / 100,
  };
}
