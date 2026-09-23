import { NextResponse } from "next/server";

const DEFAULT_MODELS = [
  "google/gemini-3.6-flash",
  "google/gemini-3.8-flash",
];

function modelFleet(): string[] {
  const models = (process.env.OPENROUTER_MODELS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return models.length > 0 ? [...new Set(models)] : DEFAULT_MODELS;
}

// Hobby functions die at 10s — fail fast across the fleet.
const FLEET_BUDGET_MS = 8000;

const SYSTEM_PROMPT = `Read this receipt. Amounts are in the receipt's own currency — return them as printed, no conversion.
Return ONLY a JSON object with this exact shape:
{"merchant": "string", "total": number, "date": "YYYY-MM-DD or empty string", "items": [{"name": "string", "amount": number}], "adjustments": [{"label": "string", "amount": number (negative for discounts)}]}
Tax, tip, and service charge go in adjustments (positive). Discounts go in adjustments (negative).`;

function isRetryable(status: number | undefined): boolean {
  return status === 429 || (status !== undefined && status >= 500);
}

function stripFences(text: string): string {
  const t = text.trim();
  if (t.startsWith("```")) {
    return t.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return t;
}

async function scanWith(model: string, bytes: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://settleup-eb.vercel.app",
        "X-Title": "SettleUp",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: SYSTEM_PROMPT },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${bytes}` } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const err = new Error(`OpenRouter ${res.status}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    const body = await res.json();
    const text: string = body?.choices?.[0]?.message?.content || "{}";
    return JSON.parse(stripFences(text));
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
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
      const status = (e as { status?: number })?.status;
      if (status !== undefined && !isRetryable(status)) {
        console.error("scan-receipt:non-retryable", model, status, (e as Error)?.message);
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
