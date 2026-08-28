import type { CategoryRule } from "@/lib/types";

export function matchCategory(
  rules: CategoryRule[],
  merchantRaw: string,
): { category: string | null; clean_name: string | null } {
  const lower = merchantRaw.toLowerCase();
  const match = rules.find((r) => lower.includes(r.merchant_pattern.toLowerCase()));
  return {
    category: match?.category ?? null,
    clean_name: match?.clean_name ?? null,
  };
}
