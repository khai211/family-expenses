"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import { formatSGD } from "@/lib/currency";
import { monthLabel, parseMonth } from "@/lib/month";

const WINDOW_SIZE = 6;

function shortMonth(month: string): string {
  return monthLabel(month).split(" ")[0].slice(0, 3);
}

function rangeLabel(months: { month: string }[]): string {
  const first = months[0].month;
  const last = months[months.length - 1].month;
  const firstYear = parseMonth(first).year;
  const lastYear = parseMonth(last).year;
  const firstLabel = firstYear === lastYear ? shortMonth(first) : `${shortMonth(first)} ${firstYear}`;
  return `${firstLabel} - ${shortMonth(last)} ${lastYear}`;
}

export function TrendChart({
  data,
}: {
  data: { month: string; amount: number }[]; // oldest first
}) {
  const [showAmounts, setShowAmounts] = useState(false);
  const [offset, setOffset] = useState(0); // months back from the most recent window

  const windowStart = data.length - WINDOW_SIZE - offset;
  const visible = data.slice(windowStart, windowStart + WINDOW_SIZE);
  const canPanOlder = windowStart > 0;
  const canPanNewer = offset > 0;

  const chartData = visible.map((d) => ({
    ...d,
    label: shortMonth(d.month),
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">6 Months Summary</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOffset((v) => v + 1)}
            disabled={!canPanOlder}
            aria-label="Show earlier months"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:text-foreground disabled:opacity-30 disabled:hover:text-muted"
          >
            ‹
          </button>
          <span className="min-w-[8rem] text-center text-sm font-medium text-foreground">
            {rangeLabel(visible)}
          </span>
          <button
            type="button"
            onClick={() => setOffset((v) => v - 1)}
            disabled={!canPanNewer}
            aria-label="Show later months"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:text-foreground disabled:opacity-30 disabled:hover:text-muted"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => setShowAmounts((v) => !v)}
            aria-label="Show amounts"
            aria-pressed={showAmounts}
            className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
            style={{ background: showAmounts ? "#22C55E" : "#CBD5E1" }}
          >
            <span
              className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow transition-transform ${
                showAmounts ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
              style={{ color: showAmounts ? "#22C55E" : "#94A3B8" }}
            >
              $
            </span>
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 32, right: 32, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="trendLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            padding={{ left: 24, right: 24 }}
            tick={{ fontSize: 12, fill: "var(--muted)" }}
            tickMargin={12}
          />
          <YAxis hide domain={[0, (max: number) => max * 1.25]} />
          <Tooltip
            formatter={(value) => formatSGD(Number(value))}
            cursor={{ stroke: "var(--border)" }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="url(#trendLineGradient)"
            strokeWidth={3}
            dot={{ r: 5, fill: "var(--surface)", stroke: "#3B82F6", strokeWidth: 2 }}
            activeDot={{ r: 7, fill: "#3B82F6", stroke: "var(--surface)", strokeWidth: 2 }}
          >
            {showAmounts && (
              <LabelList
                dataKey="amount"
                position="top"
                offset={14}
                formatter={(value) => formatSGD(Number(value))}
                style={{ fontSize: 11, fontWeight: 700, fill: "var(--foreground)" }}
              />
            )}
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
