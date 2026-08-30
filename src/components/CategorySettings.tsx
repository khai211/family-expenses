"use client";

import { useState } from "react";
import type { CategoryRow } from "@/lib/category-data";
import type { CategoryRule } from "@/lib/types";
import {
  addCategory,
  updateCategory,
  deleteCategory,
  upsertCategoryRule,
  deleteCategoryRule,
} from "@/app/actions";
import { IconOrb } from "@/components/IconOrb";

export function CategorySettings({
  categories,
  rules,
}: {
  categories: CategoryRow[];
  rules: CategoryRule[];
}) {
  return (
    <div className="space-y-10">
      <CategoryList categories={categories} />
      <RuleList categories={categories} rules={rules} />
    </div>
  );
}

function CategoryList({ categories }: { categories: CategoryRow[] }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await addCategory(name.trim());
    setName("");
    setSaving(false);
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-foreground">Categories</h2>
      <ul className="space-y-2">
        {categories.map((c) => (
          <CategoryItem key={c.name} category={c} />
        ))}
      </ul>
      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded border border-border bg-surface px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-secondary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add category"}
        </button>
      </form>
    </section>
  );
}

function CategoryItem({ category }: { category: CategoryRow }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await updateCategory(category.name, trimmed);
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="flex items-center gap-2 text-sm">
        <IconOrb icon={category.icon} color={category.color} size={24} />
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm"
        />
        <button
          onClick={save}
          disabled={saving}
          className="text-xs text-foreground underline disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => {
            setName(category.name);
            setEditing(false);
          }}
          className="text-xs text-muted underline"
        >
          Cancel
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 text-sm">
      <IconOrb icon={category.icon} color={category.color} size={24} />
      <span className="flex-1 text-foreground">{category.name}</span>
      <button onClick={() => setEditing(true)} className="text-xs text-muted underline">
        Edit
      </button>
      <button
        onClick={() => deleteCategory(category.name)}
        className="text-xs text-muted underline"
      >
        Delete
      </button>
    </li>
  );
}

function RuleList({
  categories,
  rules,
}: {
  categories: CategoryRow[];
  rules: CategoryRule[];
}) {
  return (
    <section>
      <h2 className="mb-1 text-sm font-medium text-foreground">
        Merchant category rules
      </h2>
      <p className="mb-3 text-xs text-muted">
        When a statement or receipt merchant contains this text
        (case-insensitive), it&apos;s assigned this category automatically.
      </p>
      <div className="space-y-1">
        {rules.map((rule) => (
          <RuleRow key={rule.id} rule={rule} categories={categories} />
        ))}
      </div>
      <RuleRow categories={categories} isNew />
    </section>
  );
}

function RuleRow({
  rule,
  categories,
  isNew,
}: {
  rule?: CategoryRule;
  categories: CategoryRow[];
  isNew?: boolean;
}) {
  const [pattern, setPattern] = useState(rule?.merchant_pattern ?? "");
  const [category, setCategory] = useState(rule?.category ?? "");
  const [cleanName, setCleanName] = useState(rule?.clean_name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!pattern.trim()) return;
    setSaving(true);
    await upsertCategoryRule({
      id: rule?.id,
      merchant_pattern: pattern.trim(),
      category: category || null,
      clean_name: cleanName.trim() || null,
    });
    if (isNew) {
      setPattern("");
      setCategory("");
      setCleanName("");
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-2 py-2 text-sm">
      <input
        type="text"
        value={pattern}
        onChange={(e) => setPattern(e.target.value)}
        placeholder="Merchant pattern (e.g. Grab)"
        className="min-w-0 flex-1 rounded border border-border px-1.5 py-1 text-xs"
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
        value={cleanName}
        onChange={(e) => setCleanName(e.target.value)}
        placeholder="Display name"
        className="w-32 rounded border border-border px-1.5 py-1 text-xs"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-xs text-foreground underline disabled:opacity-50"
      >
        {saving ? "Saving…" : isNew ? "Add" : "Save"}
      </button>
      {!isNew && rule && (
        <button
          onClick={() => deleteCategoryRule(rule.id)}
          className="text-xs text-muted underline"
        >
          Delete
        </button>
      )}
    </div>
  );
}
