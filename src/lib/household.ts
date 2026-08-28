import type { SupabaseClient } from "@supabase/supabase-js";
import type { Household } from "@/lib/types";

export async function getHousehold(
  supabase: SupabaseClient,
  householdId: string,
): Promise<Household | null> {
  const { data } = await supabase
    .from("households")
    .select("id, name, monthly_income, needs_pct, wants_pct, savings_pct")
    .eq("id", householdId)
    .maybeSingle();
  return data ?? null;
}

export async function getHouseholdId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return data?.household_id ?? null;
}
