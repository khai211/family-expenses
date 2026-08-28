"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addTransaction } from "@/app/actions";
import { scanReceipt } from "@/app/import/actions";
import { currentMonthKey } from "@/lib/month";
import type { CategoryRow } from "@/lib/category-data";

export function AddExpenseForm({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]?.name ?? "");
  const [note, setNote] = useState("");
  const [merchant, setMerchant] = useState("");
  const [isFamily, setIsFamily] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [receiptSource, setReceiptSource] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) return;

    setSaving(true);
    await addTransaction({
      date,
      amount: parsed,
      category,
      note: note || null,
      is_family: isFamily,
      merchant_clean: merchant || null,
      merchant_raw: merchant || null,
      source: receiptSource ? "receipt_scan" : "manual",
      source_file: receiptSource,
    });
    setAmount("");
    setNote("");
    setMerchant("");
    setReceiptSource(null);
    setSaving(false);

    if (date.slice(0, 7) !== currentMonthKey()) {
      router.push(`/?month=${date.slice(0, 7)}`);
    }
  }

  async function handleReceiptFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await scanReceipt(formData);
      setDate(result.date);
      setAmount(String(result.amount));
      setMerchant(result.merchant);
      if (result.category) setCategory(result.category);
      setReceiptSource(result.sourceFile);
    } catch {
      // leave the form as-is; user can enter details manually
    } finally {
      setScanning(false);
      e.target.value = "";
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <Field label="Date">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-border px-2 py-1.5 text-sm"
        />
      </Field>
      <Field label="Amount (S$)">
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="font-money w-28 rounded border border-border px-2 py-1.5 text-sm"
        />
      </Field>
      <Field label="Category">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-border px-2 py-1.5 text-sm"
        >
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Note">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional"
          className="w-40 rounded border border-border px-2 py-1.5 text-sm"
        />
      </Field>
      <label className="flex items-center gap-1.5 pb-1.5 text-sm text-foreground">
        <input
          type="checkbox"
          checked={isFamily}
          onChange={(e) => setIsFamily(e.target.checked)}
        />
        Family expense
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-secondary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Adding…" : "Add expense"}
      </button>
      <label className="pb-1.5 text-sm text-muted underline cursor-pointer">
        {scanning ? "Scanning…" : merchant ? `Scanned: ${merchant}` : "Scan receipt"}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={scanning}
          onChange={handleReceiptFile}
        />
      </label>
      <Link href="/import" className="pb-1.5 text-sm text-muted underline">
        Import statement
      </Link>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      {children}
    </label>
  );
}
