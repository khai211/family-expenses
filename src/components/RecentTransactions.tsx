"use client";

import { useState } from "react";
import { formatSGD } from "@/lib/currency";
import { categoryColor } from "@/lib/categories";
import {
  deleteTransaction,
  toggleFamily,
  updateTransaction,
} from "@/app/actions";
import { IconOrb } from "@/components/IconOrb";
import { FamilyToggle } from "@/components/FamilyToggle";
import type { Transaction } from "@/lib/types";
import type { Member } from "@/lib/dashboard-data";
import type { CategoryRow } from "@/lib/category-data";

type View = "recent" | "top" | "family" | "personal";

export function RecentTransactions({
  transactions,
  members,
  currentUserId,
  categories,
  colorMap,
  iconMap,
}: {
  transactions: Transaction[];
  members: Member[];
  currentUserId: string;
  categories: CategoryRow[];
  colorMap: Record<string, string>;
  iconMap: Record<string, string>;
}) {
  const [view, setView] = useState<View>("recent");
  const [editingId, setEditingId] = useState<string | null>(null);

  const memberName = (userId: string) => {
    if (userId === currentUserId) return "You";
    const m = members.find((m) => m.user_id === userId);
    return m?.email?.split("@")[0] ?? "Partner";
  };

  const filtered =
    view === "personal"
      ? transactions.filter((t) => !t.is_family)
      : view === "family"
        ? transactions.filter((t) => t.is_family)
        : transactions;
  const sorted =
    view === "top" ? [...filtered].sort((a, b) => b.amount - a.amount) : filtered;

  return (
    <div>
      <div className="mb-3 flex gap-1">
        {([
          ["recent", "Recent"],
          ["top", "Top spend"],
          ["family", "Family"],
          ["personal", "Personal"],
        ] as [View, string][]).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-3 py-1 text-xs ${
              view === v
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">
            No transactions.
          </p>
        )}
        {sorted.map((t) =>
          editingId === t.id ? (
            <EditRow
              key={t.id}
              txn={t}
              onDone={() => setEditingId(null)}
              categories={categories}
            />
          ) : (
            <Row
              key={t.id}
              txn={t}
              addedByLabel={memberName(t.added_by)}
              onEdit={() => setEditingId(t.id)}
              colorMap={colorMap}
              iconMap={iconMap}
            />
          ),
        )}
      </div>
    </div>
  );
}

function Row({
  txn,
  addedByLabel,
  onEdit,
  colorMap,
  iconMap,
}: {
  txn: Transaction;
  addedByLabel: string;
  onEdit: () => void;
  colorMap: Record<string, string>;
  iconMap: Record<string, string>;
}) {
  const [busy, setBusy] = useState(false);
  const color = categoryColor(txn.category, colorMap);

  return (
    <div className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-black/[0.02]">
      <IconOrb icon={iconMap[txn.category ?? "Uncategorized"]} color={color} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-foreground">
            {txn.merchant_clean || txn.merchant_raw || txn.note || "Expense"}
          </span>
          {txn.category ? (
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
              style={{ background: color }}
            >
              {txn.category}
            </span>
          ) : (
            <span className="rounded-full bg-[color:var(--color-uncategorized)] px-1.5 py-0.5 text-[10px] font-medium text-white">
              needs a category
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {txn.date} · added by {addedByLabel}
          {txn.note && txn.merchant_clean ? ` · ${txn.note}` : ""}
        </p>
      </div>

      <FamilyToggle
        isFamily={txn.is_family}
        disabled={busy}
        onToggle={async () => {
          setBusy(true);
          await toggleFamily(txn.id, !txn.is_family);
          setBusy(false);
        }}
      />

      <span className="font-money w-24 shrink-0 text-right text-sm text-foreground">
        {formatSGD(txn.amount)}
      </span>

      <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">
        <button onClick={onEdit} className="text-xs text-muted underline">
          Edit
        </button>
        <button
          onClick={() => deleteTransaction(txn.id)}
          className="text-xs text-muted underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function EditRow({
  txn,
  onDone,
  categories,
}: {
  txn: Transaction;
  onDone: () => void;
  categories: CategoryRow[];
}) {
  const [date, setDate] = useState(txn.date);
  const [amount, setAmount] = useState(String(txn.amount));
  const [category, setCategory] = useState(txn.category ?? "");
  const [note, setNote] = useState(txn.note ?? "");
  const [isFamily, setIsFamily] = useState(txn.is_family);

  async function save() {
    await updateTransaction(txn.id, {
      date,
      amount: Number(amount),
      category: category || null,
      note: note || null,
      is_family: isFamily,
    });
    onDone();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-2 py-2 text-sm">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded border border-border px-1.5 py-1 text-xs"
      />
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="font-money w-24 rounded border border-border px-1.5 py-1 text-xs"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded border border-border px-1.5 py-1 text-xs"
      >
        <option value="">Uncategorized</option>
        {categories.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note"
        className="min-w-0 flex-1 rounded border border-border px-1.5 py-1 text-xs"
      />
      <label className="flex items-center gap-1.5 text-xs text-foreground">
        <input
          type="checkbox"
          checked={isFamily}
          onChange={(e) => setIsFamily(e.target.checked)}
        />
        Family expense
      </label>
      <button onClick={save} className="text-xs text-foreground underline">
        Save
      </button>
      <button onClick={onDone} className="text-xs text-muted underline">
        Cancel
      </button>
    </div>
  );
}
