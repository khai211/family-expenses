"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatSGD } from "@/lib/currency";
import type { BudgetBuckets } from "@/lib/budget-buckets";

const BUCKET_COLORS = {
  needs: "#3B82F6",
  wants: "#F97316",
  savings: "#0D9488",
} as const;

export function BudgetSection({
  buckets,
  income,
}: {
  buckets: BudgetBuckets;
  income: number | null;
}) {
  const rows = [
    { key: "needs" as const, label: "Needs", spent: buckets.needsSpent, target: buckets.needsTarget },
    { key: "wants" as const, label: "Wants", spent: buckets.wantsSpent, target: buckets.wantsTarget },
    { key: "savings" as const, label: "Savings", spent: buckets.savingsContributed, target: buckets.savingsTarget },
  ];
  const total = rows.reduce((a, r) => a + r.spent, 0);

  if (!income) {
    return (
      <p className="text-sm text-muted">
        Set your monthly income in Settings to see your 50/30/20 budget.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: 200, height: 200 }}>
        {total > 0 ? (
          <PieChart width={200} height={200}>
            <Pie
              data={rows}
              dataKey="spent"
              nameKey="label"
              innerRadius={66}
              outerRadius={98}
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {rows.map((r) => (
                <Cell key={r.key} fill={BUCKET_COLORS[r.key]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatSGD(Number(value))}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        ) : (
          <svg width={200} height={200}>
            <circle cx={100} cy={100} r={82} fill="none" stroke="var(--border)" strokeWidth={16} />
          </svg>
        )}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-money text-xl font-semibold text-foreground">
            {formatSGD(total)}
          </span>
          <span className="mt-0.5 text-xs text-muted">Total this month</span>
        </div>
      </div>

      <div className="w-full min-w-0 space-y-3 sm:max-w-[220px]">
        {rows.map((r) => (
          <div key={r.key}>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: BUCKET_COLORS[r.key] }}
                />
                {r.label}
              </span>
              <span className="font-money ml-2 text-xs text-muted">
                {formatSGD(r.spent)} / {formatSGD(r.target)}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${r.target > 0 ? Math.min(100, (r.spent / r.target) * 100) : 0}%`,
                  background: BUCKET_COLORS[r.key],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
