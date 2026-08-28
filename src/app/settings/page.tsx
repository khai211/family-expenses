import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdId, getHousehold } from "@/lib/household";
import { getCategories } from "@/lib/category-data";
import { CategorySettings } from "@/components/CategorySettings";
import { GoalsSection } from "@/components/GoalsSection";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { BudgetSettings } from "@/components/BudgetSettings";
import type { Goal } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const householdId = await getHouseholdId(supabase);
  if (!householdId) return null;

  const [categories, rulesRes, goalsRes, household] = await Promise.all([
    getCategories(supabase, householdId),
    supabase
      .from("category_rules")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    supabase
      .from("goals")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    getHousehold(supabase, householdId),
  ]);
  const goals: Goal[] = goalsRes.data ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted">
            Add expenses, manage categories, and set up savings pots.
          </p>
        </div>
        <Link href="/" className="text-sm text-muted underline">
          ← Dashboard
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-medium text-foreground">Add an expense</h2>
        <AddExpenseForm categories={categories} />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-medium text-foreground">Budget (50/30/20)</h2>
        <BudgetSettings household={household} categories={categories} />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-medium text-foreground">Savings pots</h2>
        <GoalsSection goals={goals} />
      </section>

      <CategorySettings categories={categories} rules={rulesRes.data ?? []} />
    </main>
  );
}
