import { NextRequest, NextResponse } from "next/server";
import { loadAgentPrompt, loadContextSheet, modelConfigured } from "@/lib/agent-docs";
import {
  ASSIST_AGENTS,
  buildAssistMessages,
  fallbackAssist,
  parseAssistResponse,
  resolveAssistModel,
  type AssistCategory,
  type AssistDocs,
  type AssistTier,
} from "@/lib/product-assist";

export const dynamic = "force-dynamic";

const MODEL_TIMEOUT_MS = 25000;
const CATEGORIES: AssistCategory[] = ["corte", "salsa", "paquete"];

function loadDocs(): AssistDocs | null {
  const cgmo = loadAgentPrompt("cgmo");
  const cro = loadAgentPrompt("cro");
  if (!cgmo || !cro) {
    console.error("[product-assist] agent docs missing (cgmo/cro)");
    return null;
  }
  return { cgmo, cro, context: loadContextSheet() };
}

async function callModel(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  tier: AssistTier
): Promise<string> {
  // Muse reasons on every call and bills reasoning from the same budget;
  // Wonder reasons far longer than Spark, so each tier gets its own cap.
  const maxTokens = tier === "wonder" ? 8000 : 2000;
  const timeoutMs = tier === "wonder" ? 90000 : MODEL_TIMEOUT_MS;
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`model HTTP ${res.status}`);
  const payload = (await res.json()) as {
    choices?: { message?: { content?: string | null }; finish_reason?: string }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(
      `model returned no content (finish_reason=${payload.choices?.[0]?.finish_reason ?? "?"})`
    );
  }
  return content;
}

/**
 * POST /api/ai/product-assist
 * Body: { name: string, category: "corte" | "salsa" | "paquete", tier?: "spark" | "wonder" }
 * The model, instructed by the CGMO (copy) and CRO (pricing) agents,
 * writes a professional description and suggests a price. Always answers:
 * `{ source: "model" | "fallback", agents, tier, model, description,
 * priceMXN, priceRationale }`. The API key never leaves the server.
 */
export async function POST(req: NextRequest) {
  let body: { name?: unknown; category?: unknown; tier?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = body.category as AssistCategory;
  const tier: AssistTier = body.tier === "wonder" ? "wonder" : "spark";
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "name must be 2-120 characters" }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "category must be corte, salsa or paquete" }, { status: 400 });
  }

  const docs = loadDocs();
  const baseUrl = process.env.META_MODEL_BASE_URL;
  const apiKey = process.env.META_MODEL_API_KEY;
  const model = resolveAssistModel(tier, {
    spark: process.env.META_MODEL_NAME,
    wonder: process.env.META_MODEL_WONDER_NAME,
  });
  const cfg = modelConfigured();

  if (docs && baseUrl && apiKey) {
    try {
      const messages = buildAssistMessages({ name, category }, docs);
      const content = await callModel(baseUrl, apiKey, model, messages, tier);
      const parsed = parseAssistResponse(content);
      if (!parsed) throw new Error("model output failed guardrails");
      // Audit trail (server log only): prompt sizes + output, no PII beyond the product name.
      console.log(
        `[product-assist] model ok agents=${ASSIST_AGENTS.join(",")} tier=${tier} model=${model} ` +
          `promptChars=${messages.reduce((n, m) => n + m.content.length, 0)} ` +
          `price=${parsed.priceMXN}`
      );
      return NextResponse.json({
        source: "model",
        agents: [...ASSIST_AGENTS],
        tier,
        model,
        ...parsed,
      });
    } catch (err) {
      console.error("[product-assist] model call failed, using fallback", err);
    }
  } else {
    console.log(
      "[product-assist] model not configured " +
        `(docs=${docs ? "yes" : "no"} base=${cfg.base ? "yes" : "no"} ` +
        `key=${cfg.key ? "yes" : "no"}), using fallback`
    );
  }
  return NextResponse.json({
    source: "fallback",
    agents: [...ASSIST_AGENTS],
    tier,
    model: null,
    ...fallbackAssist({ name, category }),
  });
}
