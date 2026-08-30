import { createClient } from "@/lib/supabase/server";
import { getHouseholdId, getHousehold } from "@/lib/household";
import { getDashboardData, getMostRecentMonthWithData } from "@/lib/dashboard-data";
import { getCategories, buildColorMap, buildIconMap } from "@/lib/category-data";
import { getBudgetBuckets } from "@/lib/budget-buckets";
import { MonthSwitcher } from "@/components/MonthSwitcher";
import { BudgetSection } from "@/components/BudgetSection";
import { CategoryDonut } from "@/components/CategoryDonut";
import { RecentTransactions } from "@/components/RecentTransactions";
import { TrendChart } from "@/components/TrendChart";
import { SavingsPot } from "@/components/SavingsPot";
import type { Goal } from "@/lib/types";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // middleware redirects to /auth/login
  }

  const householdId = await getHouseholdId(supabase);

  if (!householdId) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-lg font-medium text-foreground">
          You&apos;re signed in, but not linked to a household yet.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Ask whoever set up Family Expenses to add {user.email} to
          household_invites.
        </p>
      </main>
    );
  }

  const params = await searchParams;
  const month = params.month ?? (await getMostRecentMonthWithData(supabase, householdId));

  const [data, categories, goalsRes, household] = await Promise.all([
    getDashboardData(supabase, householdId, user.id, month),
    getCategories(supabase, householdId),
    supabase
      .from("goals")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    getHousehold(supabase, householdId),
  ]);
  const colorMap = buildColorMap(categories);
  const iconMap = buildIconMap(categories);
  const goals: Goal[] = goalsRes.data ?? [];
  const buckets = await getBudgetBuckets(
    supabase,
    householdId,
    month,
    data.categoryTotals,
    categories,
    household,
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-lg font-medium text-foreground">Family Expenses</h1>
        <div className="flex items-center gap-4">
          <Link href="/settings" className="text-sm text-muted underline">
            Settings
          </Link>
          <MonthSwitcher month={month} />
        </div>
      </header>

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-sm font-medium text-foreground">
            Monthly Spendings
          </h2>
          <CategoryDonut
            categoryTotals={data.categoryTotals}
            colorMap={colorMap}
            iconMap={iconMap}
          />
        </section>

        {data.personalCategoryTotals.length > 0 && (
          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-medium text-foreground">
              My Personal Spending
            </h2>
            <CategoryDonut
              categoryTotals={data.personalCategoryTotals}
              colorMap={colorMap}
              iconMap={iconMap}
            />
          </section>
        )}

        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-sm font-medium text-foreground">
            Transaction History
          </h2>
          <RecentTransactions
            transactions={data.visibleTransactions}
            members={data.members}
            currentUserId={user.id}
            categories={categories}
            colorMap={colorMap}
            iconMap={iconMap}
          />
        </section>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-medium text-foreground">
              Monthly Budget
            </h2>
            <BudgetSection buckets={buckets} income={household?.monthly_income ?? null} />
          </section>

          <section>
            <h2 className="mb-4 text-sm font-medium text-foreground">
              Savings Pot
            </h2>
            <SavingsPot goals={goals} />
          </section>
        </div>

        <section className="rounded-xl border border-border bg-surface p-6">
          <TrendChart data={data.trendHistory} />
        </section>
      </div>
    </main>
  );
}
