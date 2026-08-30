"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatSGD } from "@/lib/currency";
import { categoryColor } from "@/lib/categories";
import { parseStatement, confirmImport, type ReviewRow } from "@/app/import/actions";
import { buildColorMap, type CategoryRow } from "@/lib/category-data";
import { FamilyToggle } from "@/components/FamilyToggle";

type Row = ReviewRow & { include: boolean };

export function ImportFlow({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const colorMap = buildColorMap(categories);
  const [status, setStatus] = useState<"idle" | "parsing" | "review" | "saving" | "done">(
    "idle",
  );
  const [rows, setRows] = useState<Row[]>([]);
  const [sourceFile, setSourceFile] = useState("");
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("parsing");
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await parseStatement(formData);
      setRows(result.rows.map((r) => ({ ...r, include: !r.is_duplicate })));
      setSourceFile(result.sourceFile);
      setStatus("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse statement");
      setStatus("idle");
    }
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  async function handleConfirm() {
    setStatus("saving");
    const toInsert = rows.filter((r) => r.include);
    try {
      await confirmImport(toInsert, sourceFile);
      setStatus("done");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save transactions");
      setStatus("review");
    }
  }

  if (status === "idle" || status === "parsing") {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-sm text-muted hover:border-foreground/30">
          {status === "parsing" ? "Parsing statement…" : "Click to choose a PDF"}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={status === "parsing"}
            onChange={handleFile}
          />
        </label>
        {error && (
          <p className="mt-3 text-sm text-[color:var(--status-over)]">{error}</p>
        )}
      </div>
    );
  }

  const includedCount = rows.filter((r) => r.include).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Found {rows.length} debit transactions. {includedCount} selected to import.
      </p>

      <div className="max-h-[480px] space-y-1 overflow-y-auto rounded-xl border border-border bg-surface p-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`rounded-lg px-2 py-2 text-sm ${
              row.is_duplicate ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={row.include}
                onChange={(e) => updateRow(i, { include: e.target.checked })}
                className="mt-1 shrink-0"
              />
              <span className="w-24 shrink-0 pt-0.5 text-muted">{row.date}</span>
              <span className="min-w-0 flex-1 break-words text-foreground">
                {row.merchant_clean || row.merchant_raw}
              </span>
              <span className="font-money w-20 shrink-0 pt-0.5 text-right text-foreground">
                {formatSGD(row.amount)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2 pl-6">
              <select
                value={row.category ?? ""}
                onChange={(e) => updateRow(i, { category: e.target.value || null })}
                className="rounded border border-border px-1.5 py-1 text-xs"
                style={
                  row.category
                    ? { color: categoryColor(row.category, colorMap) }
                    : undefined
                }
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <FamilyToggle
                isFamily={row.is_family}
                onToggle={() => updateRow(i, { is_family: !row.is_family })}
              />
              {row.is_duplicate && (
                <span className="text-[11px] text-muted">Already imported</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-[color:var(--status-over)]">{error}</p>}

      <button
        onClick={handleConfirm}
        disabled={status === "saving" || includedCount === 0}
        className="rounded-lg bg-brand-secondary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : `Import ${includedCount} transactions`}
      </button>
    </div>
  );
}
