"use client";

import { useRouter } from "next/navigation";
import { monthLabel, shiftMonth } from "@/lib/month";

export function MonthSwitcher({ month }: { month: string }) {
  const router = useRouter();

  function goTo(m: string) {
    router.push(`/?month=${m}`);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => goTo(shiftMonth(month, -1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:text-foreground"
        aria-label="Previous month"
      >
        ‹
      </button>
      <label className="relative min-w-[9rem] text-center text-sm font-medium text-foreground">
        {monthLabel(month)}
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && goTo(e.target.value)}
          aria-label="Jump to month"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <button
        type="button"
        onClick={() => goTo(shiftMonth(month, 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:text-foreground"
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  );
}
