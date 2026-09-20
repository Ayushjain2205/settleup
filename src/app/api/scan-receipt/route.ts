import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SCHEMA = {
  type: "object",
  properties: {
    merchant: { type: "string" },
    total: { type: "number" },
    date: { type: "string", description: "Receipt date as YYYY-MM-DD, or empty string if unreadable" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          amount: { type: "number" },
        },
        required: ["name", "amount"],
      },
    },
    adjustments: {
      type: "array",
      description: "Tax, tip, service charge (positive) and discounts (negative)",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          amount: { type: "number", description: "Negative for discounts" },
        },
        required: ["label", "amount"],
      },
    },
  },
  required: ["merchant", "total", "items", "adjustments"],
} as const;

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Receipt scanning is not configured" }, { status: 503 });
  }

  let blob: Blob;
  try {
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }
    blob = file;
  } catch {
    return NextResponse.json({ error: "Could not read upload" }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const bytes = Buffer.from(await blob.arrayBuffer()).toString("base64");
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Read this receipt. Amounts are in the receipt's own currency — return them as printed, no conversion. Return ONLY JSON matching the schema.",
            },
            { inlineData: { mimeType: "image/jpeg", data: bytes } },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
      },
    });

    const parsed = JSON.parse(res.text || "{}");
    return NextResponse.json({
      merchant: String(parsed.merchant || ""),
      total: Number(parsed.total) || 0,
      date: parsed.date || null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      adjustments: Array.isArray(parsed.adjustments) ? parsed.adjustments : [],
    });
  } catch {
    return NextResponse.json({ error: "Could not read receipt — enter it manually" }, { status: 422 });
  }
}
