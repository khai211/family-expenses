import { createAnthropicClient, STATEMENT_PARSE_MODEL } from "@/lib/anthropic";
import { extractJson } from "@/lib/json-extract";

export type ParsedStatementRow = {
  date: string;
  description: string;
  amount: number;
  direction: "debit" | "credit";
};

const PROMPT = `This is a bank/credit card statement. Extract every individual transaction line as a JSON array. For each transaction return:
- "date": in YYYY-MM-DD format
- "description": the merchant/description text exactly as it appears
- "amount": a positive number (the transaction amount, no currency symbol)
- "direction": "debit" for money spent/charged, "credit" for payments, refunds, or money received

Respond with ONLY the JSON array, no other text, no markdown code fences.`;

export async function parseStatementPdf(
  pdfBase64: string,
): Promise<ParsedStatementRow[]> {
  const client = createAnthropicClient();

  const response = await client.messages.create({
    model: STATEMENT_PARSE_MODEL,
    max_tokens: 8000,
    thinking: { type: "disabled" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from statement parser");
  }

  const parsed = extractJson(textBlock.text);
  if (!Array.isArray(parsed)) {
    throw new Error("Statement parser did not return a JSON array");
  }
  return parsed as ParsedStatementRow[];
}
