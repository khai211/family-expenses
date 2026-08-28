"use client";

import { useState } from "react";
import { updateHouseholdSettings, updateCategoryBucket } from "@/app/actions";
import type { Household, Bucket } from "@/lib/types";
import type { CategoryRow } from "@/lib/category-data";

const BUCKET_LABELS: Record<Bucket, string> = {
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
};

export function BudgetSettings({
  household,
  categories,
}: {
  household: Household | null;
  categories: CategoryRow[];
}) {
  const [income, setIncome] = useState(String(household?.monthly_income ?? ""));
  const [needsPct, setNeedsPct] = useState(String(household?.needs_pct ?? 50));
  const [wantsPct, setWantsPct] = useState(String(household?.wants_pct ?? 30));
  const [savingsPct, setSavingsPct] = useState(String(household?.savings_pct ?? 20));
  const [saving, setSaving] = useState(false);

  const pctSum = Number(needsPct) + Number(wantsPct) + Number(savingsPct);

  async function save() {
    const parsedIncome = income ? Number(income) : null;
    setSaving(true);
    await updateHouseholdSettings({
      monthly_income: parsedIncome,
      needs_pct: Number(needsPct),
      wants_pct: Number(wantsPct),
      savings_pct: Number(savingsPct),
    });
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Monthly income (S$)
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="e.g. 6000"
              className="font-money w-32 rounded border border-border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Needs %
            <input
              type="number"
              value={needsPct}
              onChange={(e) => setNeedsPct(e.target.value)}
              className="w-20 rounded border border-border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Wants %
            <input
              type="number"
              value={wantsPct}
              onChange={(e) => setWantsPct(e.target.value)}
              className="w-20 rounded border border-border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Savings %
            <input
              type="number"
              value={savingsPct}
              onChange={(e) => setSavingsPct(e.target.value)}
              className="w-20 rounded border border-border px-2 py-1.5 text-sm"
            />
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-brand-secondary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        {pctSum !== 100 && (
          <p className="mt-2 text-xs text-[color:var(--status-warn)]">
            Percentages add up to {pctSum}%, not 100% — that&apos;s okay, but worth checking.
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs text-muted">
          Assign each category to a bucket so spending counts toward Needs, Wants, or Savings.
        </p>
        <div className="space-y-1.5">
          {categories.map((c) => (
            <div key={c.name} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-foreground">{c.name}</span>
              <select
                value={c.bucket ?? ""}
                onChange={(e) =>
                  updateCategoryBucket(c.name, (e.target.value || null) as Bucket | null)
                }
                className="rounded border border-border bg-surface px-1.5 py-1 text-xs"
              >
                <option value="">Unassigned</option>
                {(Object.keys(BUCKET_LABELS) as Bucket[]).map((b) => (
                  <option key={b} value={b}>
                    {BUCKET_LABELS[b]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
