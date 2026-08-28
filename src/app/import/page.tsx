import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdId } from "@/lib/household";
import { getCategories } from "@/lib/category-data";
import { ImportFlow } from "@/components/ImportFlow";

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const householdId = await getHouseholdId(supabase);
  if (!householdId) return null;

  const categories = await getCategories(supabase, householdId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-lg font-medium text-foreground">
          Import a bank statement
        </h1>
        <Link href="/" className="text-sm text-muted underline">
          ← Dashboard
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        Upload a statement PDF. We&apos;ll parse it, match categories, skip
        anything already imported, and let you review before saving.
      </p>

      <div className="mt-8">
        <ImportFlow categories={categories} />
      </div>
    </main>
  );
}
