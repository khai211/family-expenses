import Link from "next/link";
import { monthLabel, shiftMonth } from "@/lib/month";

export function MonthSwitcher({ month }: { month: string }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/?month=${shiftMonth(month, -1)}`}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:text-foreground"
        aria-label="Previous month"
      >
        ‹
      </Link>
      <span className="min-w-[9rem] text-center text-sm font-medium text-foreground">
        {monthLabel(month)}
      </span>
      <Link
        href={`/?month=${shiftMonth(month, 1)}`}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:text-foreground"
        aria-label="Next month"
      >
        ›
      </Link>
    </div>
  );
}
