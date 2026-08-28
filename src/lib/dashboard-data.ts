import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction } from "@/lib/types";
import { monthRange, shiftMonth, currentMonthKey } from "@/lib/month";

export type Member = { user_id: string; email: string | null };

export type DashboardData = {
  month: string;
  currentUserId: string;
  members: Member[];
  visibleTransactions: Transaction[]; // family + own-personal, this month
  totalFamilySpend: number;
  categoryTotals: { category: string; amount: number }[];
  last6Months: { month: string; amount: number }[];
};

export async function getMostRecentMonthWithData(
  supabase: SupabaseClient,
  householdId: string,
): Promise<string> {
  const { data } = await supabase
    .from("transactions")
    .select("date")
    .eq("household_id", householdId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.date) return currentMonthKey();
  return (data.date as string).slice(0, 7);
}

export async function getDashboardData(
  supabase: SupabaseClient,
  householdId: string,
  userId: string,
  month: string,
): Promise<DashboardData> {
  const { start, end } = monthRange(month);
  const sixMonthStart = monthRange(shiftMonth(month, -5)).start;

  const [membersRes, visibleRes, trendRes] = await Promise.all([
    supabase
      .from("household_members")
      .select("user_id, email")
      .eq("household_id", householdId),
    supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .gte("date", start)
      .lt("date", end)
      .or(`is_family.eq.true,added_by.eq.${userId}`)
      .order("date", { ascending: false }),
    supabase
      .from("transactions")
      .select("date, amount, category")
      .eq("household_id", householdId)
      .eq("is_family", true)
      .gte("date", sixMonthStart)
      .lt("date", end),
  ]);

  const members: Member[] = membersRes.data ?? [];
  const visibleTransactions: Transaction[] = visibleRes.data ?? [];
  const trendRows = trendRes.data ?? [];

  const thisMonthFamily = trendRows.filter((r) => r.date.slice(0, 7) === month);
  const totalFamilySpend = sum(thisMonthFamily.map((r) => r.amount));

  const categoryMap = new Map<string, number>();
  for (const row of thisMonthFamily) {
    const cat = row.category ?? "Uncategorized";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + Number(row.amount));
  }
  const categoryTotals = Array.from(categoryMap, ([category, amount]) => ({
    category,
    amount,
  })).sort((a, b) => b.amount - a.amount);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const m = shiftMonth(month, i - 5);
    return {
      month: m,
      amount: sum(
        trendRows.filter((r) => r.date.slice(0, 7) === m).map((r) => r.amount),
      ),
    };
  });

  return {
    month,
    currentUserId: userId,
    members,
    visibleTransactions,
    totalFamilySpend,
    categoryTotals,
    last6Months,
  };
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + Number(b), 0);
}
