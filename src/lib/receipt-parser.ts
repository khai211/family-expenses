import { createAnthropicClient, STATEMENT_PARSE_MODEL } from "@/lib/anthropic";
import { extractJson } from "@/lib/json-extract";

export type ParsedReceipt = {
  date: string;
  merchant: string;
  amount: number;
};

const PROMPT = `This is a photo of a receipt. Extract:
- "date": in YYYY-MM-DD format (use your best guess if the year is missing, assuming the current year)
- "merchant": the store/merchant name as it appears on the receipt
- "amount": the total amount paid, as a positive number with no currency symbol

Respond with ONLY a single JSON object with these three fields, no other text, no markdown code fences.`;

export async function parseReceiptImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif",
): Promise<ParsedReceipt> {
  const client = createAnthropicClient();

  const response = await client.messages.create({
    model: STATEMENT_PARSE_MODEL,
    max_tokens: 1024,
    thinking: { type: "disabled" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from receipt parser");
  }

  return extractJson(textBlock.text) as ParsedReceipt;
}
