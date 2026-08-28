"use client";

import { useState } from "react";
import { formatSGD } from "@/lib/currency";
import { addGoal, deleteGoal, updateGoal } from "@/app/actions";
import type { Goal } from "@/lib/types";

export function GoalsSection({ goals }: { goals: Goal[] }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(target);
    if (!name.trim() || Number.isNaN(parsed) || parsed <= 0) return;
    setSaving(true);
    await addGoal(name.trim(), parsed, targetDate || null);
    setName("");
    setTarget("");
    setTargetDate("");
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {goals.map((g) => (
          <GoalRow key={g.id} goal={g} />
        ))}
        {goals.length === 0 && (
          <p className="text-sm text-muted">No savings pots yet.</p>
        )}
      </ul>
      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pot name (e.g. Travel)"
          className="min-w-0 flex-1 rounded border border-border bg-surface px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target amount"
          className="font-money w-32 rounded border border-border bg-surface px-2 py-1.5 text-sm"
        />
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          title="Target date (optional)"
          className="rounded border border-border bg-surface px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-secondary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add pot"}
        </button>
      </form>
    </div>
  );
}

function GoalRow({ goal }: { goal: Goal }) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(String(goal.current_amount));
  const [target, setTarget] = useState(String(goal.target_amount));
  const [date, setDate] = useState(goal.target_date ?? "");

  async function save() {
    const parsedCurrent = Number(current);
    const parsedTarget = Number(target);
    if (
      !Number.isNaN(parsedCurrent) &&
      parsedCurrent >= 0 &&
      !Number.isNaN(parsedTarget) &&
      parsedTarget > 0
    ) {
      await updateGoal(goal.id, {
        current_amount: parsedCurrent,
        target_amount: parsedTarget,
        target_date: date || null,
      });
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="rounded-lg border border-border bg-surface p-2">
        <p className="mb-2 text-sm text-foreground">{goal.name}</p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-muted">
            Saved
            <input
              autoFocus
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="font-money w-20 rounded border border-border px-1.5 py-0.5 text-xs"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-muted">
            Target
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="font-money w-20 rounded border border-border px-1.5 py-0.5 text-xs"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-muted">
            By
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border border-border px-1.5 py-0.5 text-xs"
            />
          </label>
          <button onClick={save} className="text-xs text-foreground underline">
            Save
          </button>
          <button onClick={() => setEditing(false)} className="text-xs text-muted underline">
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className="text-foreground">{goal.name}</span>
      <span className="flex items-center gap-2">
        <button onClick={() => setEditing(true)} className="font-money text-muted">
          {formatSGD(goal.current_amount)} / {formatSGD(goal.target_amount)}
        </button>
        <button
          onClick={() => deleteGoal(goal.id)}
          className="text-xs text-muted underline"
        >
          Delete
        </button>
      </span>
    </li>
  );
}
