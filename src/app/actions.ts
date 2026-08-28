"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdId } from "@/lib/household";
import { getCategories, nextPaletteColor } from "@/lib/category-data";
import { nextCategoryIcon } from "@/lib/category-icons";

export async function addTransaction(input: {
  date: string;
  amount: number;
  category: string | null;
  note: string | null;
  is_family: boolean;
  merchant_clean?: string | null;
  merchant_raw?: string | null;
  source?: "manual" | "receipt_scan";
  source_file?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const householdId = await getHouseholdId(supabase);
  if (!householdId) throw new Error("No household");

  const { error } = await supabase.from("transactions").insert({
    household_id: householdId,
    added_by: user.id,
    date: input.date,
    amount: input.amount,
    category: input.category,
    note: input.note,
    is_family: input.is_family,
    merchant_clean: input.merchant_clean ?? null,
    merchant_raw: input.merchant_raw ?? null,
    source: input.source ?? "manual",
    source_file: input.source_file ?? null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function updateTransaction(
  id: string,
  input: Partial<{
    date: string;
    amount: number;
    category: string | null;
    merchant_clean: string | null;
    note: string | null;
    is_family: boolean;
  }>,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .update(input)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function toggleFamily(id: string, is_family: boolean) {
  await updateTransaction(id, { is_family });
}

export async function updateHouseholdSettings(input: {
  monthly_income: number | null;
  needs_pct: number;
  wants_pct: number;
  savings_pct: number;
}) {
  const supabase = await createClient();
  const householdId = await getHouseholdId(supabase);
  if (!householdId) throw new Error("No household");

  const { error } = await supabase
    .from("households")
    .update(input)
    .eq("id", householdId);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/");
}

export async function updateCategoryBucket(
  name: string,
  bucket: "needs" | "wants" | "savings" | null,
) {
  const supabase = await createClient();
  const householdId = await getHouseholdId(supabase);
  if (!householdId) throw new Error("No household");

  const { error } = await supabase
    .from("categories")
    .update({ bucket })
    .eq("household_id", householdId)
    .eq("name", name);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/");
}

export async function upsertCategoryRule(input: {
  id?: string;
  merchant_pattern: string;
  category: string | null;
  clean_name: string | null;
}) {
  const supabase = await createClient();
  const householdId = await getHouseholdId(supabase);
  if (!householdId) throw new Error("No household");

  const { error } = await supabase.from("category_rules").upsert({
    id: input.id,
    household_id: householdId,
    merchant_pattern: input.merchant_pattern,
    category: input.category,
    clean_name: input.clean_name,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function deleteCategoryRule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("category_rules").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function addCategory(name: string) {
  const supabase = await createClient();
  const householdId = await getHouseholdId(supabase);
  if (!householdId) throw new Error("No household");

  const existing = await getCategories(supabase, householdId);
  const color = nextPaletteColor(existing);
  const icon = nextCategoryIcon(name, existing);

  const { error } = await supabase
    .from("categories")
    .insert({ household_id: householdId, name, color, icon });
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/import");
}

export async function addGoal(
  name: string,
  targetAmount: number,
  targetDate: string | null,
) {
  const supabase = await createClient();
  const householdId = await getHouseholdId(supabase);
  if (!householdId) throw new Error("No household");

  const { error } = await supabase.from("goals").insert({
    household_id: householdId,
    name,
    target_amount: targetAmount,
    target_date: targetDate,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function updateGoal(
  id: string,
  input: Partial<{
    current_amount: number;
    target_amount: number;
    name: string;
    target_date: string | null;
  }>,
) {
  const supabase = await createClient();

  if (input.current_amount !== undefined) {
    const { data: existing } = await supabase
      .from("goals")
      .select("household_id, current_amount")
      .eq("id", id)
      .maybeSingle();

    const delta = input.current_amount - Number(existing?.current_amount ?? 0);
    if (existing && delta !== 0) {
      await supabase.from("goal_contributions").insert({
        goal_id: id,
        household_id: existing.household_id,
        amount: delta,
      });
    }
  }

  const { error } = await supabase.from("goals").update(input).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}
