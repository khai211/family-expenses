export const CATEGORIES = [
  "Groceries",
  "Dining",
  "Transport",
  "Subscriptions",
  "Health",
  "Insurance",
  "Utilities",
  "Entertainment",
  "Business",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category | "Uncategorized", string> = {
  Groceries: "#22C55E",
  Dining: "#F97316",
  Transport: "#3B82F6",
  Subscriptions: "#A855F7",
  Health: "#14B8A6",
  Insurance: "#EF4444",
  Utilities: "#EAB308",
  Entertainment: "#EC4899",
  Business: "#6366F1",
  Uncategorized: "#A8A29E",
};

export function categoryColor(
  category: string | null | undefined,
  colorMap?: Record<string, string>,
): string {
  const fallback = CATEGORY_COLORS.Uncategorized;
  if (!category) return colorMap?.Uncategorized ?? fallback;
  return colorMap?.[category] ?? CATEGORY_COLORS[category as Category] ?? fallback;
}
