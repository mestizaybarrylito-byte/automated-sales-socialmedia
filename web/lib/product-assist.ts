/**
 * Product assist core: AI-generated professional descriptions and suggested
 * prices for the CRM catalog, driven by the repo's own agents (CGMO owns
 * copy, CRO owns pricing) through an OpenAI-compatible model endpoint.
 *
 * Pure functions only (no fs/fetch) so `npm test` covers them; the thin
 * server route in app/api/ai/product-assist loads the agent files and
 * performs the HTTP call. When the model is unavailable the rule-based
 * fallback keeps the flow working — the UI must never hard-fail.
 */

export type AssistCategory = "corte" | "salsa" | "paquete";

export interface AssistInput {
  name: string;
  category: AssistCategory;
}

export interface AssistResult {
  description: string;
  priceMXN: number;
  priceRationale: string;
}

export interface AssistDocs {
  /** agents_orig/cgmo/SYSTEM_PROMPT.md */
  cgmo: string;
  /** agents_orig/cro/SYSTEM_PROMPT.md */
  cro: string;
  /** context/BUSINESS_CONTEXT_SHEET.md */
  context: string;
}

export interface AssistMessage {
  role: "system" | "user";
  content: string;
}

/** The agents consulted by the assist flow, in order. */
export const ASSIST_AGENTS = ["cgmo", "cro"] as const;

export const DEFAULT_SPARK_MODEL = "muse-spark-1.3";
export const DEFAULT_WONDER_MODEL = "muse-wonder-1.0";

export type AssistTier = "spark" | "wonder";

/** Resolve the chat model for a tier (env override or documented default). */
export function resolveAssistModel(
  tier: AssistTier,
  names: { spark?: string; wonder?: string } = {}
): string {
  if (tier === "wonder") return names.wonder || DEFAULT_WONDER_MODEL;
  return names.spark || DEFAULT_SPARK_MODEL;
}

const CONTRACT = `You must respond with a single JSON object and nothing else, using exactly these keys:
{"description": string, "priceMXN": number, "priceRationale": string}
- "description": professional Spanish catalog copy (2-3 sentences, 40-400 characters) for the cut/product. Premium artisanal tone, no emojis, no delivery promises beyond the Thursday weekly batch.
- "priceMXN": suggested price in whole Mexican pesos (integer between 1 and 250000), consistent with a premium artisanal butcher catalog.
- "priceRationale": one short sentence in Spanish justifying the price (cut quality, batch model, margin).`;

const USER_TEMPLATE = (input: AssistInput) =>
  `New catalog product to list:\n- Name: ${input.name}\n- Category: ${input.category} (corte = meat cut, salsa = homemade sauce, paquete = bundle)\nAct as the CGMO for "description" and as the CRO for "priceMXN" and "priceRationale".`;

/** Guardrail: keep prompts bounded no matter how large the agent files grow. */
export function truncateDoc(doc: string, maxChars = 6000): string {
  if (doc.length <= maxChars) return doc;
  return doc.slice(0, maxChars) + "\n[…truncated]";
}

/** Chat messages for the model: agent roles + business context + JSON contract. */
export function buildAssistMessages(input: AssistInput, docs: AssistDocs): AssistMessage[] {
  const system = [
    "You are the product-listing assistant of a premium artisanal meat e-commerce.",
    "Follow the CGMO system prompt for all marketing copy and the CRO system prompt for all pricing decisions.",
    "--- CGMO SYSTEM PROMPT ---",
    truncateDoc(docs.cgmo),
    "--- CRO SYSTEM PROMPT ---",
    truncateDoc(docs.cro),
    "--- BUSINESS CONTEXT ---",
    truncateDoc(docs.context, 4000),
    "--- OUTPUT ---",
    CONTRACT,
  ].join("\n");
  return [
    { role: "system", content: system },
    { role: "user", content: USER_TEMPLATE(input) },
  ];
}

/** Extract the first {...} JSON block from raw model output. */
function extractJson(text: string): unknown | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Validate model output into an AssistResult. Returns null when the output
 * is missing, malformed, or outside the guardrails — the caller must fall
 * back to `fallbackAssist` instead of surfacing it.
 */
export function parseAssistResponse(text: string): AssistResult | null {
  const parsed = extractJson(text) as Partial<AssistResult> | null;
  if (!parsed || typeof parsed !== "object") return null;
  const description = typeof parsed.description === "string" ? parsed.description.trim() : "";
  const rationale = typeof parsed.priceRationale === "string" ? parsed.priceRationale.trim() : "";
  const price =
    typeof parsed.priceMXN === "number" && Number.isFinite(parsed.priceMXN)
      ? Math.round(parsed.priceMXN)
      : NaN;
  if (description.length < 20 || description.length > 800) return null;
  if (!Number.isInteger(price) || price < 1 || price > 250000) return null;
  if (rationale.length > 300) return null;
  return { description, priceMXN: price, priceRationale: rationale };
}

const FALLBACK_BASELINES: Record<AssistCategory, { priceMXN: number; kind: string }> = {
  corte: { priceMXN: 449, kind: "corte premium" },
  salsa: { priceMXN: 99, kind: "salsa artesanal" },
  paquete: { priceMXN: 899, kind: "paquete para compartir" },
};

/**
 * Rule-based fallback: professional template copy plus a category baseline
 * price. Used when the model is unconfigured, unreachable, or returns
 * invalid output — the CRM flow always completes.
 */
export function fallbackAssist(input: AssistInput): AssistResult {
  const baseline = FALLBACK_BASELINES[input.category] ?? FALLBACK_BASELINES.corte;
  const name = input.name.trim();
  return {
    description:
      `${name}: ${baseline.kind} de selección artesanal, preparado en lote semanal para garantizar frescura. ` +
      `Pedidos consolidados con entrega los jueves; precio de lista sujeto a confirmación por lote.`,
    priceMXN: baseline.priceMXN,
    priceRationale: `Precio base sugerido para la categoría ${input.category}.`,
  };
}
