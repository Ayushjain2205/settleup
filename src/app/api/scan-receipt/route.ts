import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
];

function modelFleet(): string[] {
  const models = (process.env.GEMINI_MODELS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const legacy of [process.env.GEMINI_MODEL, process.env.GEMINI_FALLBACK_MODEL]) {
    if (legacy && !models.includes(legacy)) {
      if (legacy === process.env.GEMINI_MODEL) models.unshift(legacy);
      else models.push(legacy);
    }
  }
  return models.length > 0 ? [...new Set(models)] : DEFAULT_MODELS;
}

// Hobby functions die at 10s — fail fast across the fleet instead of
// long backoffs. Total budget for model calls: ~8s.
const FLEET_BUDGET_MS = 8000;

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

function isRetryable(e: unknown): boolean {
  const status = (e as { status?: number })?.status;
  return status === 429 || status === 503;
}

async function scanWith(model: string, bytes: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const res = await ai.models.generateContent({
    model,
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
  return JSON.parse(res.text || "{}");
}

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

  const bytes = Buffer.from(await blob.arrayBuffer()).toString("base64");
  const started = Date.now();
  let lastError: unknown = null;

  for (const model of modelFleet()) {
    if (Date.now() - started > FLEET_BUDGET_MS) break;
    try {
      const parsed = await scanWith(model, bytes);
      return NextResponse.json({
        merchant: String(parsed.merchant || ""),
        total: Number(parsed.total) || 0,
        date: parsed.date || null,
        items: Array.isArray(parsed.items) ? parsed.items : [],
        adjustments: Array.isArray(parsed.adjustments) ? parsed.adjustments : [],
      });
    } catch (e) {
      lastError = e;
      if (!isRetryable(e)) {
        console.error("scan-receipt:non-retryable", model, (e as { status?: number })?.status, (e as Error)?.message);
        return NextResponse.json({ error: "Could not read receipt — enter it manually" }, { status: 422 });
      }
    }
  }

  console.error(
    "scan-receipt:exhausted",
    (lastError as { status?: number })?.status,
    (lastError as Error)?.message?.slice(0, 300)
  );
  return NextResponse.json({ error: "Receipt service is busy — try again in a bit" }, { status: 503 });
}
