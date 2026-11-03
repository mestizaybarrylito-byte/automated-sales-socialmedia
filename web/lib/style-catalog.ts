/**
 * Dynamic style catalog loader.
 *
 * The wizard renders whatever catalog this module resolves: a JSON document
 * published at NEXT_PUBLIC_STYLE_CATALOG_URL, or the bundled PHOTO_STYLES
 * when no URL is configured, the fetch fails, or the document is invalid.
 * Publishing new styles is a content change — no code edit, no rebuild.
 *
 * Accepted document shape (both forms):
 *   { "styles": [ { "id", "name", "filter", "tint", "effect", ... } ] }
 *   [ { "id", "name", "filter", "tint", "effect", ... } ]
 *
 * Required per entry: id, name, filter (non-empty strings), effect
 * ({ kind } with a kind the renderer in lib/campaign-art.ts supports, plus
 * its numeric/string params). Optional: category (one of STYLE_CATEGORIES,
 * defaults to "styles"), tint (string or null), frame ("tarot"), and any
 * shade/accent/text color override. Invalid entries are dropped; an empty
 * result falls back to the bundle. Covered by `npm test`.
 */
import {
  PHOTO_STYLES,
  STYLE_CATEGORIES,
  completeStyle,
  type PhotoStyle,
  type StyleCategory,
  type StyleSeed,
} from "./photo-styles";

const MAX_ENTRIES = 200;
const FETCH_TIMEOUT_MS = 8000;

interface EffectSpec {
  nums: string[];
  strs: string[];
}

const EFFECT_PARAMS: Record<string, EffectSpec> = {
  none: { nums: [], strs: [] },
  sharpen: { nums: ["amount"], strs: [] },
  anime: { nums: ["levels", "edge"], strs: [] },
  surreal: { nums: ["warp", "hue"], strs: [] },
  fantasy: { nums: ["glow"], strs: [] },
  pop: { nums: ["levels"], strs: [] },
  watercolor: { nums: ["soft", "grain"], strs: [] },
  pixel: { nums: ["size", "levels"], strs: [] },
  threshold: { nums: ["level"], strs: [] },
  emboss: { nums: [], strs: [] },
  mosaic: { nums: ["size"], strs: [] },
  solarize: { nums: [], strs: [] },
  duotone: { nums: [], strs: ["dark", "light"] },
  thermal: { nums: [], strs: [] },
  neon: { nums: ["edge"], strs: ["color"] },
  grain: { nums: ["amount"], strs: [] },
  soft: { nums: ["radius"], strs: [] },
  halftone: { nums: ["size"], strs: [] },
  tiltshift: { nums: ["blur", "band"], strs: [] },
  doodle: { nums: ["count"], strs: [] },
};

const COLOR_KEYS = [
  "shadeTop",
  "shadeMid",
  "shadeBottom",
  "accent",
  "titleColor",
  "hashtagColor",
  "bodyColor",
  "footerColor",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function parseEffect(value: unknown): StyleSeed["effect"] | null {
  if (!isRecord(value) || typeof value.kind !== "string") return null;
  const spec = EFFECT_PARAMS[value.kind];
  if (!spec) return null;
  const params: Record<string, number | string> = {};
  for (const key of spec.nums) {
    const v = value[key];
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    params[key] = v;
  }
  for (const key of spec.strs) {
    const v = value[key];
    if (typeof v !== "string" || v.length === 0) return null;
    params[key] = v;
  }
  return { kind: value.kind, ...params } as StyleSeed["effect"];
}

function parseEntry(value: unknown): PhotoStyle | null {
  if (!isRecord(value)) return null;
  if (!nonEmptyString(value.id) || !nonEmptyString(value.name)) return null;
  if (typeof value.filter !== "string") return null;
  if (value.tint !== null && value.tint !== undefined && typeof value.tint !== "string") {
    return null;
  }
  const effect = parseEffect(value.effect);
  if (!effect) return null;
  if (value.frame !== undefined && value.frame !== "tarot") return null;
  let category: StyleCategory = "styles";
  if (value.category !== undefined) {
    if (typeof value.category !== "string") return null;
    if (!(STYLE_CATEGORIES as string[]).includes(value.category)) return null;
    category = value.category as StyleCategory;
  }
  const seed: StyleSeed = {
    id: value.id,
    name: value.name,
    category,
    filter: value.filter,
    tint: value.tint ?? null,
    effect,
  };
  if (value.frame === "tarot") seed.frame = "tarot";
  for (const key of COLOR_KEYS) {
    const v = value[key];
    if (v === undefined) continue;
    if (typeof v !== "string") return null;
    seed[key] = v;
  }
  return completeStyle(seed);
}

/**
 * Validates a published catalog document. Returns the completed styles, or
 * null when the document is unusable (the caller falls back to the bundle).
 */
export function parseStyleCatalog(value: unknown): PhotoStyle[] | null {
  const list = isRecord(value) && !Array.isArray(value) ? value.styles : value;
  if (!Array.isArray(list) || list.length === 0 || list.length > MAX_ENTRIES) {
    return null;
  }
  const seen = new Set<string>();
  const styles: PhotoStyle[] = [];
  for (const entry of list) {
    const style = parseEntry(entry);
    if (!style || seen.has(style.id)) continue;
    seen.add(style.id);
    styles.push(style);
  }
  return styles.length > 0 ? styles : null;
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`catalog HTTP ${res.status}`);
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveCatalog(): Promise<PhotoStyle[]> {
  const url = process.env.NEXT_PUBLIC_STYLE_CATALOG_URL;
  if (!url) return PHOTO_STYLES;
  try {
    return parseStyleCatalog(await fetchJson(url)) ?? PHOTO_STYLES;
  } catch {
    return PHOTO_STYLES;
  }
}

let cached: Promise<PhotoStyle[]> | null = null;

/** Resolves the active catalog once per session (remote or bundled). */
export function loadPhotoStyles(): Promise<PhotoStyle[]> {
  if (!cached) cached = resolveCatalog();
  return cached;
}

/** Test-only: clears the memoized catalog so each case starts fresh. */
export function resetStyleCatalogCache(): void {
  cached = null;
}
