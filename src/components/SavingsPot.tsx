import Link from "next/link";
import { formatSGD } from "@/lib/currency";
import { PiggyBankIcon } from "@/components/PiggyBankIcon";
import type { Goal } from "@/lib/types";

export function SavingsPot({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">
          No savings pots yet — add one from Settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {goals.map((g) => (
        <PotCard key={g.id} goal={g} />
      ))}
    </div>
  );
}

function formatTargetDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PotCard({ goal }: { goal: Goal }) {
  const pct = goal.target_amount > 0
    ? Math.min(1, goal.current_amount / goal.target_amount)
    : 0;

  return (
    <div className="w-full max-w-[240px] flex-1 min-w-[200px] overflow-hidden rounded-2xl border border-border bg-surface">
      <div
        className="relative flex items-center justify-center overflow-hidden py-8"
        style={{
          background: "linear-gradient(180deg, #FFE8B8 0%, #FDBA55 60%, #F59E0B 100%)",
        }}
      >
        <PiggyBankIcon size={56} className="text-white/90" />
      </div>

      <div className="p-4">
        <p className="text-sm font-medium text-foreground">{goal.name}</p>
        <p className="font-money mt-1 text-2xl font-semibold text-foreground">
          {formatSGD(goal.current_amount)}
        </p>

        <div className="relative mt-4 h-1.5 w-full rounded-full bg-border">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${pct * 100}%`, background: "#F59E0B" }}
          />
          {[0, 0.5, 1].map((mark) => (
            <span
              key={mark}
              className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2"
              style={{
                left: `${mark * 100}%`,
                background: pct >= mark ? "#F59E0B" : "var(--surface)",
                borderColor: pct >= mark ? "#F59E0B" : "var(--border)",
              }}
            />
          ))}
        </div>

        <p className="mt-2 text-xs text-muted">
          Goal: {formatSGD(goal.target_amount)}
          {goal.target_date ? ` by ${formatTargetDate(goal.target_date)}` : ""}
        </p>

        <Link
          href="/settings"
          className="mt-3 block rounded-full border border-border bg-surface py-1.5 text-center text-xs font-medium text-foreground hover:bg-black/[0.02]"
        >
          Add Money
        </Link>
      </div>
    </div>
  );
}
