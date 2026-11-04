/**
 * Campaign image core (Muse Image): prompt recipes and response parsing
 * for AI-generated food creatives. Pure functions — covered by `npm test`.
 * The thin server route performs the HTTP call; art direction follows the
 * campaign-artist agent (agents_orig/campaign-artist).
 */

export const DEFAULT_IMAGE_MODEL = "muse-image-1.0";

/** Per-style visual fragments (see the food-art-direction skill). */
export const STYLE_IMAGE_FRAGMENTS: Record<string, string> = {
  anime: "clean cel shading, bold outlines, warm palette",
  watercolor: "soft watercolor washes, paper texture, warm palette",
  "8bit": "retro 8-bit pixel art, warm palette",
  illustrated: "rich editorial illustration, warm palette",
  glowy: "soft cinematic glow, warm rim light",
};

const DEFAULT_FRAGMENT = "high-contrast professional food photography, warm palette";

const NEGATIVES =
  "No text, no logos, no people, single hero dish, no cold-dominant or neon scenes.";

export interface ImagePromptInput {
  productName: string;
  category?: string;
  trend?: string;
  narrative?: string;
  styleId?: string;
}

/** One-paragraph prompt recipe plus negative constraints (≤600 chars). */
export function buildImagePrompt(input: ImagePromptInput): string {
  const fragment = (input.styleId && STYLE_IMAGE_FRAGMENTS[input.styleId]) || DEFAULT_FRAGMENT;
  const parts = [
    `${input.productName}${input.category ? ` (${input.category})` : ""}, hero dish centered`,
    "rustic dark-wood table, warm directional side light, shallow depth of field",
    fragment,
  ];
  if (input.trend) parts.push(`evoking ${truncate(input.trend, 80)}`);
  if (input.narrative) parts.push(truncate(input.narrative, 120));
  const recipe = truncate(parts.join("; ") + ".", 480);
  return `${recipe} ${NEGATIVES}`;
}

function truncate(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max).trimEnd() + "…";
}

export interface ParsedImage {
  base64: string;
  editId: string;
}

/**
 * Extract the generated image from a /v1/responses payload. Returns null
 * when no finished image_generation_call with a result is present.
 */
export function parseImageResponse(payload: unknown): ParsedImage | null {
  if (!payload || typeof payload !== "object") return null;
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const { type, result, id } = item as { type?: unknown; result?: unknown; id?: unknown };
    if (type !== "image_generation_call") continue;
    if (typeof result !== "string" || result.length < 100) continue;
    if (typeof id !== "string" || id.length === 0) continue;
    return { base64: result, editId: id };
  }
  return null;
}

/** Detect webp/png/jpeg from magic bytes; defaults to webp (Muse Image output). */
export function sniffImageMime(base64: string): "image/webp" | "image/png" | "image/jpeg" {
  try {
    const bytes = Buffer.from(base64.slice(0, 24), "base64");
    if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF") return "image/webp";
    if (
      bytes.length >= 4 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    ) {
      return "image/png";
    }
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  } catch {
    /* fall through to default */
  }
  return "image/webp";
}
