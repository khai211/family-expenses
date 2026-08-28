"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatSGD } from "@/lib/currency";
import { categoryColor } from "@/lib/categories";
import { IconOrb } from "@/components/IconOrb";

export function CategoryDonut({
  categoryTotals,
  colorMap,
  iconMap,
}: {
  categoryTotals: { category: string; amount: number }[];
  colorMap: Record<string, string>;
  iconMap: Record<string, string>;
}) {
  const total = categoryTotals.reduce((a, c) => a + c.amount, 0);

  if (categoryTotals.length === 0) {
    return <p className="text-sm text-muted">No spending yet this month.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: 240, height: 240 }}>
        <PieChart width={240} height={240}>
          <Pie
            data={categoryTotals}
            dataKey="amount"
            nameKey="category"
            innerRadius={82}
            outerRadius={118}
            paddingAngle={1.5}
            stroke="var(--surface)"
            strokeWidth={2}
          >
            {categoryTotals.map((c) => (
              <Cell key={c.category} fill={categoryColor(c.category, colorMap)} />
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-money text-2xl font-semibold text-foreground">
            {formatSGD(total)}
          </span>
          <span className="mt-0.5 text-xs text-muted">Total spent</span>
        </div>
      </div>
      <ul className="grid w-full min-w-0 grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
        {categoryTotals.map((c) => (
          <li key={c.category} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5 text-foreground">
              <IconOrb
                icon={iconMap[c.category]}
                color={categoryColor(c.category, colorMap)}
                size={18}
              />
              <span className="truncate">{c.category}</span>
            </span>
            <span className="font-money shrink-0 text-muted">
              {((c.amount / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
