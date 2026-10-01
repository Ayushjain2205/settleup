import { NextResponse } from "next/server";

// Allow Pro deployments room for two upstream attempts; Hobby caps at its
// own limit regardless. Without this, Vercel may kill the function at 10s.
export const maxDuration = 30;
export const runtime = "nodejs";

const DEFAULT_MODELS = [
  "google/gemini-3.8-flash",
  "google/gemini-3.6-flash",
];

function modelFleet(): string[] {
  const models = (process.env.OPENROUTER_MODELS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return models.length > 0 ? [...new Set(models)] : DEFAULT_MODELS;
}

function geminiModel(): string {
  return (process.env.GEMINI_MODEL || "").trim() || "gemini-3.8-flash";
}

// Total upstream budget: direct Gemini is usually 3-6s, OpenRouter slower.
const FLEET_BUDGET_MS = 25000;
const GEMINI_TIMEOUT_MS = 20000;
const OPENROUTER_TIMEOUT_MS = 15000;

const SYSTEM_PROMPT = `Read this receipt. Amounts are in the receipt's own currency — return them as printed, no conversion.
Return ONLY a JSON object with this exact shape:
{"merchant": "string", "total": number, "date": "YYYY-MM-DD or empty string", "items": [{"name": "string", "amount": number}], "adjustments": [{"label": "string", "amount": number (negative for discounts)}]}
Tax, tip, and service charge go in adjustments (positive). Discounts go in adjustments (negative).`;

function isRetryable(status: number | undefined): boolean {
  return status === 429 || (status !== undefined && status >= 500);
}

function isAbort(e: unknown): boolean {
  return e instanceof DOMException ? e.name === "AbortError" : (e as Error)?.name === "AbortError";
}

function stripFences(text: string): string {
  const t = text.trim();
  if (t.startsWith("```")) {
    return t.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return t;
}

function shape(parsed: unknown) {
  const p = (parsed || {}) as Record<string, unknown>;
  return {
    merchant: String(p.merchant || ""),
    total: Number(p.total) || 0,
    date: (p.date as string) || null,
    items: Array.isArray(p.items) ? p.items : [],
    adjustments: Array.isArray(p.adjustments) ? p.adjustments : [],
  };
}

/** Direct Google AI Studio call — one hop instead of OpenRouter routing. */
async function scanWithGemini(bytes: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              parts: [
                { inline_data: { mime_type: "image/jpeg", data: bytes } },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            maxOutputTokens: 1024,
            temperature: 0,
          },
        }),
      }
    );
    if (!res.ok) {
      const snippet = (await res.text().catch(() => "")).slice(0, 200);
      const err = new Error(`Gemini ${res.status} ${snippet}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    const body = await res.json();
    const text: string =
      body?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "{}";
    return shape(JSON.parse(stripFences(text)));
  } finally {
    clearTimeout(timeout);
  }
}

async function scanWithOpenRouter(model: string, bytes: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);
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
        max_tokens: 1024,
        temperature: 0,
      }),
    });
    if (!res.ok) {
      const snippet = (await res.text().catch(() => "")).slice(0, 200);
      const err = new Error(`OpenRouter ${model} ${res.status} ${snippet}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    const body = await res.json();
    const text: string = body?.choices?.[0]?.message?.content || "{}";
    return shape(JSON.parse(stripFences(text)));
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
  if (!hasGemini && !hasOpenRouter) {
    return NextResponse.json({ error: "Receipt scanning is not configured" }, { status: 503 });
  }

  let blob: Blob;
  try {
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large — try a smaller photo" }, { status: 413 });
    }
    blob = file;
  } catch {
    return NextResponse.json({ error: "Could not read upload" }, { status: 400 });
  }

  const bytes = Buffer.from(await blob.arrayBuffer()).toString("base64");
  const started = Date.now();
  let lastError: unknown = null;
  let attempts = 0;

  // Primary: direct Gemini (fastest path, no broker hop).
  if (hasGemini) {
    attempts++;
    try {
      return NextResponse.json(await scanWithGemini(bytes));
    } catch (e) {
      lastError = e;
      const status = (e as { status?: number })?.status;
      console.error("scan-receipt:gemini-failed", geminiModel(), status ?? (isAbort(e) ? "timeout" : "error"), (e as Error)?.message?.slice(0, 200));
      if (status !== undefined && !isRetryable(status)) {
        return NextResponse.json({ error: "Could not read receipt — enter it manually" }, { status: 422 });
      }
    }
  }

  // Fallback: OpenRouter fleet while budget remains.
  if (hasOpenRouter) {
    for (const model of modelFleet()) {
      if (Date.now() - started > FLEET_BUDGET_MS) break;
      attempts++;
      try {
        return NextResponse.json(await scanWithOpenRouter(model, bytes));
      } catch (e) {
        lastError = e;
        const status = (e as { status?: number })?.status;
        console.error("scan-receipt:openrouter-failed", model, status ?? (isAbort(e) ? "timeout" : "error"), (e as Error)?.message?.slice(0, 200));
        if (status !== undefined && !isRetryable(status)) {
          return NextResponse.json({ error: "Could not read receipt — enter it manually" }, { status: 422 });
        }
      }
    }
  }

  console.error(
    "scan-receipt:exhausted",
    `attempts=${attempts}`,
    (lastError as { status?: number })?.status ?? (isAbort(lastError) ? "timeout" : "error"),
    (lastError as Error)?.message?.slice(0, 300)
  );
  return NextResponse.json({ error: "Receipt service is busy — try again in a bit" }, { status: 503 });
}
