"use server";

import { createClient } from "@/lib/supabase/server";
import { getHouseholdId } from "@/lib/household";
import { parseStatementPdf } from "@/lib/statement-parser";
import { parseReceiptImage } from "@/lib/receipt-parser";
import { matchCategory } from "@/lib/category-match";
import { revalidatePath } from "next/cache";

export type ReviewRow = {
  date: string;
  merchant_raw: string;
  merchant_clean: string | null;
  category: string | null;
  amount: number;
  is_family: boolean;
  is_duplicate: boolean;
};

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  file: File,
): Promise<string> {
  const path = `${householdId}/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("uploads")
    .upload(path, buffer, { contentType: file.type });
  if (error) throw new Error(error.message);
  return path;
}

export async function parseStatement(
  formData: FormData,
): Promise<{ rows: ReviewRow[]; sourceFile: string }> {
  const supabase = await createClient();
  const householdId = await getHouseholdId(supabase);
  if (!householdId) throw new Error("No household");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const sourceFile = await uploadFile(supabase, householdId, file);

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await parseStatementPdf(buffer.toString("base64"));
  const debits = parsed.filter((row) => row.direction === "debit");

  const { data: rules } = await supabase
    .from("category_rules")
    .select("*")
    .eq("household_id", householdId);

  const dates = debits.map((r) => r.date).sort();
  const { data: existing } = await supabase
    .from("transactions")
    .select("date, amount, merchant_raw")
    .eq("household_id", householdId)
    .gte("date", dates[0] ?? "1970-01-01")
    .lte("date", dates[dates.length - 1] ?? "9999-12-31");

  const rows: ReviewRow[] = debits.map((row) => {
    const { category, clean_name } = matchCategory(rules ?? [], row.description);
    const is_duplicate = (existing ?? []).some(
      (e) =>
        e.date === row.date &&
        Number(e.amount) === row.amount &&
        e.merchant_raw === row.description,
    );
    return {
      date: row.date,
      merchant_raw: row.description,
      merchant_clean: clean_name,
      category,
      amount: row.amount,
      is_family: true,
      is_duplicate,
    };
  });

  return { rows, sourceFile };
}

export async function confirmImport(rows: ReviewRow[], sourceFile: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const householdId = await getHouseholdId(supabase);
  if (!householdId) throw new Error("No household");

  const inserts = rows.map((row) => ({
    household_id: householdId,
    added_by: user.id,
    date: row.date,
    amount: row.amount,
    merchant_raw: row.merchant_raw,
    merchant_clean: row.merchant_clean,
    category: row.category,
    is_family: row.is_family,
    source: "statement_import" as const,
    source_file: sourceFile,
  }));

  if (inserts.length > 0) {
    const { error } = await supabase.from("transactions").insert(inserts);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function scanReceipt(formData: FormData): Promise<{
  date: string;
  merchant: string;
  amount: number;
  category: string | null;
  sourceFile: string;
}> {
  const supabase = await createClient();
  const householdId = await getHouseholdId(supabase);
  if (!householdId) throw new Error("No household");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const sourceFile = await uploadFile(supabase, householdId, file);

  const buffer = Buffer.from(await file.arrayBuffer());
  const mediaType = (file.type || "image/jpeg") as
    | "image/jpeg"
    | "image/png"
    | "image/webp"
    | "image/gif";
  const parsed = await parseReceiptImage(buffer.toString("base64"), mediaType);

  const { data: rules } = await supabase
    .from("category_rules")
    .select("*")
    .eq("household_id", householdId);
  const { category } = matchCategory(rules ?? [], parsed.merchant);

  return { ...parsed, category, sourceFile };
}
