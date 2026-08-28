export type BudgetStatus = "good" | "warn" | "over";

export function budgetStatus(spent: number, budget: number): BudgetStatus {
  if (budget <= 0) return "good";
  const pct = spent / budget;
  if (pct > 1) return "over";
  if (pct >= 0.8) return "warn";
  return "good";
}

export function budgetStatusColor(status: BudgetStatus): string {
  return `var(--status-${status})`;
}
