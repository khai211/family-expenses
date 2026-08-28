import type { SupabaseClient } from "@supabase/supabase-js";
import { CATEGORY_COLORS } from "@/lib/categories";
import type { Bucket } from "@/lib/types";

export type CategoryRow = {
  name: string;
  color: string;
  icon: string;
  bucket: Bucket | null;
};

export async function getCategories(
  supabase: SupabaseClient,
  householdId: string,
): Promise<CategoryRow[]> {
  const { data } = await supabase
    .from("categories")
    .select("name, color, icon, bucket")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export function buildColorMap(categories: CategoryRow[]): Record<string, string> {
  const map: Record<string, string> = { Uncategorized: CATEGORY_COLORS.Uncategorized };
  for (const c of categories) map[c.name] = c.color;
  return map;
}

export function buildIconMap(categories: CategoryRow[]): Record<string, string> {
  const map: Record<string, string> = { Uncategorized: "tag" };
  for (const c of categories) map[c.name] = c.icon;
  return map;
}

const PALETTE = [
  "#22C55E",
  "#F97316",
  "#3B82F6",
  "#A855F7",
  "#14B8A6",
  "#EF4444",
  "#EAB308",
  "#EC4899",
  "#6366F1",
  "#06B6D4",
  "#84CC16",
  "#F43F5E",
  "#8B5CF6",
  "#F59E0B",
  "#10B981",
];

export function nextPaletteColor(existing: CategoryRow[]): string {
  const used = new Set(existing.map((c) => c.color));
  return PALETTE.find((c) => !used.has(c)) ?? PALETTE[existing.length % PALETTE.length];
}
