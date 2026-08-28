"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { monthLabel, monthKey, parseMonth, shiftMonth } from "@/lib/month";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function MonthSwitcher({ month }: { month: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => parseMonth(month).year);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function goTo(m: string) {
    router.push(`/?month=${m}`);
  }

  function toggleOpen() {
    setPickerYear(parseMonth(month).year);
    setOpen((v) => !v);
  }

  const { year: selectedYear, month: selectedMonthNum } = parseMonth(month);

  return (
    <div ref={containerRef} className="relative flex items-center gap-3">
      <button
        type="button"
        onClick={() => goTo(shiftMonth(month, -1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:text-foreground"
        aria-label="Previous month"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        className="min-w-[9rem] text-center text-sm font-medium text-foreground hover:text-foreground/80"
      >
        {monthLabel(month)}
      </button>
      <button
        type="button"
        onClick={() => goTo(shiftMonth(month, 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:text-foreground"
        aria-label="Next month"
      >
        ›
      </button>

      {open && (
        <div className="absolute top-full right-0 z-10 mt-2 w-56 rounded-xl border border-border bg-surface p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPickerYear((y) => y - 1)}
              aria-label="Previous year"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-foreground"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-foreground">{pickerYear}</span>
            <button
              type="button"
              onClick={() => setPickerYear((y) => y + 1)}
              aria-label="Next year"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-foreground"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {MONTH_NAMES.map((name, i) => {
              const isSelected = pickerYear === selectedYear && i + 1 === selectedMonthNum;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    goTo(monthKey(pickerYear, i + 1));
                    setOpen(false);
                  }}
                  className={`rounded-lg py-1.5 text-xs font-medium ${
                    isSelected
                      ? "bg-foreground text-surface"
                      : "text-muted hover:bg-border/50 hover:text-foreground"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
