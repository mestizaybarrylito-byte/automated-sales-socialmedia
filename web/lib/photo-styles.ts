/**
 * Predefined photo styles ("meta styles") for campaign art.
 *
 * The catalog is pure data consumed by the parametric renderer in
 * lib/campaign-art.ts — no per-style code. Entries 1-5 are Meta's documented
 * AI Restyle presets (anime, watercolor, 8-bit, illustrated, glowy); the rest
 * extend Meta's published Restyle categories (Styles, Moods, Lighting,
 * Colors, Backdrops), since Meta publishes neither a 50-item list nor a
 * public styles API. The active catalog can be replaced at runtime with a
 * published JSON document (see lib/style-catalog.ts). Style and category
 * names are universal proper nouns; the thumbnails show the real look.
 * Pure data — covered by `npm test`.
 */

export type ArtEffect =
  | { kind: "none" }
  | { kind: "sharpen"; amount: number }
  | { kind: "anime"; levels: number; edge: number }
  | { kind: "surreal"; warp: number; hue: number }
  | { kind: "fantasy"; glow: number }
  | { kind: "pop"; levels: number }
  | { kind: "watercolor"; soft: number; grain: number }
  | { kind: "pixel"; size: number; levels: number }
  | { kind: "threshold"; level: number }
  | { kind: "emboss" }
  | { kind: "mosaic"; size: number }
  | { kind: "solarize" }
  | { kind: "duotone"; dark: string; light: string }
  | { kind: "thermal" }
  | { kind: "neon"; edge: number; color: string }
  | { kind: "grain"; amount: number }
  | { kind: "soft"; radius: number }
  | { kind: "halftone"; size: number }
  | { kind: "tiltshift"; blur: number; band: number }
  | { kind: "doodle"; count: number };

export type StyleCategory =
  | "featured"
  | "styles"
  | "moods"
  | "lighting"
  | "colors"
  | "backdrops";

export const STYLE_CATEGORIES: StyleCategory[] = [
  "featured",
  "styles",
  "moods",
  "lighting",
  "colors",
  "backdrops",
];

export const CATEGORY_NAMES: Record<StyleCategory, string> = {
  featured: "Featured",
  styles: "Styles",
  moods: "Moods",
  lighting: "Lighting",
  colors: "Colors",
  backdrops: "Backdrops",
};

export interface PhotoStyle {
  id: string;
  name: string;
  category: StyleCategory;
  /** Applied as ctx.filter over the product photo (ignored where unsupported). */
  filter: string;
  /** rgba wash over the photo; null for none. */
  tint: string | null;
  effect: ArtEffect;
  /** Optional ornamental frame drawn over the finished piece. */
  frame?: "tarot";
  shadeTop: string;
  shadeMid: string;
  shadeBottom: string;
  accent: string;
  titleColor: string;
  hashtagColor: string;
  bodyColor: string;
  footerColor: string;
}

const BODY = "rgba(247,242,234,0.95)";
const FOOTER = "rgba(247,242,234,0.85)";
const TOP = "rgba(18,19,20,0)";
const MID = "rgba(18,19,20,0.55)";
const BOTTOM = "rgba(18,19,20,0.88)";
const MID_LIGHT = "rgba(18,19,20,0.45)";
const BOTTOM_LIGHT = "rgba(18,19,20,0.8)";
const TITLE = "#f7f2ea";
const TITLE_BRIGHT = "#faf5f0";
const TAG = "#e5cfb8";
const TAG_BRIGHT = "#f3e8dc";
const ACCENT = "#9a5f3b";
const EMBER = "#c2410c";

export interface StyleSeed extends Omit<PhotoStyle, "shadeTop" | "shadeMid" | "shadeBottom" | "accent" | "titleColor" | "hashtagColor" | "bodyColor" | "footerColor" | "category"> {
  category?: StyleCategory;
  shadeTop?: string;
  shadeMid?: string;
  shadeBottom?: string;
  accent?: string;
  titleColor?: string;
  hashtagColor?: string;
  bodyColor?: string;
  footerColor?: string;
}

/** Fills catalog defaults so bundled and remote seeds share one shape. */
export function completeStyle(seed: StyleSeed): PhotoStyle {
  return {
    category: "styles",
    shadeTop: TOP,
    shadeMid: MID,
    shadeBottom: BOTTOM,
    accent: ACCENT,
    titleColor: TITLE,
    hashtagColor: TAG,
    bodyColor: BODY,
    footerColor: FOOTER,
    ...seed,
  };
}

const SEEDS: StyleSeed[] = [
  // Featured — Meta's documented Restyle presets, most recent first.
  {
    id: "anime",
    name: "Anime",
    category: "featured",
    filter: "saturate(1.4) contrast(1.05)",
    tint: null,
    effect: { kind: "anime", levels: 5, edge: 80 },
    accent: EMBER,
    titleColor: TITLE_BRIGHT,
    hashtagColor: TAG_BRIGHT,
  },
  {
    id: "watercolor",
    name: "Watercolor",
    category: "featured",
    filter: "saturate(1.15) brightness(1.08)",
    tint: "rgba(245,240,230,0.18)",
    effect: { kind: "watercolor", soft: 3, grain: 6 },
    shadeMid: MID_LIGHT,
    shadeBottom: BOTTOM_LIGHT,
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "8bit",
    name: "8-Bit Pixel",
    category: "featured",
    filter: "saturate(1.5) contrast(1.1)",
    tint: null,
    effect: { kind: "pixel", size: 10, levels: 4 },
  },
  {
    id: "illustrated",
    name: "Illustrated",
    category: "featured",
    filter: "saturate(1.25) contrast(1.05)",
    tint: "rgba(255,230,200,0.06)",
    effect: { kind: "anime", levels: 6, edge: 110 },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "glowy",
    name: "Glowy",
    category: "featured",
    filter: "saturate(1.3) brightness(1.08)",
    tint: null,
    effect: { kind: "fantasy", glow: 0.55 },
    titleColor: TITLE_BRIGHT,
    hashtagColor: TAG_BRIGHT,
  },
  // Styles.
  {
    id: "render3d",
    name: "3D Avatar",
    category: "styles",
    filter: "saturate(1.6) contrast(1.12) brightness(1.04)",
    tint: "rgba(150,200,255,0.08)",
    effect: { kind: "soft", radius: 3 },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "sketch",
    name: "Pencil Sketch",
    category: "styles",
    filter: "grayscale(0.9) brightness(1.35) contrast(1.1)",
    tint: "rgba(245,242,235,0.25)",
    effect: { kind: "anime", levels: 4, edge: 140 },
    shadeMid: MID_LIGHT,
    shadeBottom: BOTTOM_LIGHT,
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "oilpaint",
    name: "Oil Painting",
    category: "styles",
    filter: "saturate(1.5) contrast(1.1)",
    tint: null,
    effect: { kind: "watercolor", soft: 5, grain: 4 },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "acrylic",
    name: "Acrylic",
    category: "styles",
    filter: "saturate(1.6) contrast(1.2)",
    tint: null,
    effect: { kind: "pop", levels: 6 },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "popart",
    name: "Pop Art",
    category: "styles",
    filter: "saturate(2) contrast(1.4)",
    tint: null,
    effect: { kind: "halftone", size: 6 },
    titleColor: TITLE_BRIGHT,
    hashtagColor: TAG_BRIGHT,
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    category: "styles",
    filter: "saturate(1.5) contrast(1.2) hue-rotate(-15deg)",
    tint: "rgba(20,10,40,0.25)",
    effect: { kind: "neon", edge: 60, color: "#ff2fb3" },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "vintage",
    name: "Vintage Film",
    category: "styles",
    filter: "sepia(0.45) contrast(0.95) brightness(1.02)",
    tint: "rgba(210,180,140,0.15)",
    effect: { kind: "grain", amount: 12 },
  },
  {
    id: "clay",
    name: "Claymation",
    category: "styles",
    filter: "saturate(1.3) brightness(1.05)",
    tint: "rgba(255,220,190,0.12)",
    effect: { kind: "soft", radius: 2 },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "felt",
    name: "Felt Art",
    category: "styles",
    filter: "saturate(0.9) brightness(1.04)",
    tint: "rgba(230,200,180,0.18)",
    effect: { kind: "grain", amount: 16 },
  },
  {
    id: "graffiti",
    name: "Street Graffiti",
    category: "styles",
    filter: "saturate(1.9) contrast(1.3)",
    tint: null,
    effect: { kind: "pop", levels: 5 },
    titleColor: TITLE_BRIGHT,
    hashtagColor: TAG_BRIGHT,
  },
  {
    id: "mosaicart",
    name: "Mosaic Tile",
    category: "styles",
    filter: "saturate(1.2)",
    tint: null,
    effect: { kind: "mosaic", size: 14 },
  },
  {
    id: "stainedglass",
    name: "Stained Glass",
    category: "styles",
    filter: "saturate(1.7) contrast(1.15)",
    tint: "rgba(40,20,80,0.12)",
    effect: { kind: "anime", levels: 4, edge: 60 },
    titleColor: TITLE_BRIGHT,
    hashtagColor: TAG_BRIGHT,
  },
  {
    id: "tarot",
    name: "Tarot Card",
    category: "styles",
    filter: "sepia(0.35) contrast(1.05)",
    tint: "rgba(60,40,20,0.12)",
    effect: { kind: "anime", levels: 6, edge: 130 },
    frame: "tarot",
  },
  {
    id: "marble",
    name: "Marble Statue",
    category: "styles",
    filter: "grayscale(0.85) brightness(1.15) contrast(1.05)",
    tint: "rgba(230,230,235,0.12)",
    effect: { kind: "emboss" },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "doodle",
    name: "Doodle Photo",
    category: "styles",
    filter: "saturate(1.3) contrast(1.08)",
    tint: null,
    effect: { kind: "doodle", count: 9 },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "tarotletter",
    name: "Tarot Letter",
    category: "styles",
    filter: "sepia(0.5) contrast(1.2)",
    tint: "rgba(50,30,15,0.1)",
    effect: { kind: "pop", levels: 4 },
    frame: "tarot",
  },
  {
    id: "aerial",
    name: "Aerial View",
    category: "styles",
    filter: "saturate(1.5) contrast(1.12)",
    tint: null,
    effect: { kind: "tiltshift", blur: 6, band: 0.38 },
    titleColor: TITLE_BRIGHT,
  },
  // Moods.
  {
    id: "dreamy",
    name: "Dreamy Haze",
    category: "moods",
    filter: "saturate(0.85) brightness(1.12)",
    tint: "rgba(240,230,245,0.2)",
    effect: { kind: "soft", radius: 4 },
    shadeMid: MID_LIGHT,
    shadeBottom: BOTTOM_LIGHT,
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "dramatic",
    name: "Dramatic Noir",
    category: "moods",
    filter: "contrast(1.5) brightness(0.9) saturate(0.7)",
    tint: null,
    effect: { kind: "fantasy", glow: 0.25 },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "serene",
    name: "Serene Pastel",
    category: "moods",
    filter: "saturate(0.7) brightness(1.15)",
    tint: "rgba(220,235,240,0.18)",
    effect: { kind: "soft", radius: 3 },
    shadeMid: MID_LIGHT,
    shadeBottom: BOTTOM_LIGHT,
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "nostalgic",
    name: "Nostalgic Fade",
    category: "moods",
    filter: "sepia(0.3) contrast(0.9) brightness(1.05)",
    tint: "rgba(220,200,180,0.15)",
    effect: { kind: "grain", amount: 8 },
  },
  {
    id: "electric",
    name: "Electric Pulse",
    category: "moods",
    filter: "saturate(1.7) contrast(1.25)",
    tint: "rgba(0,40,60,0.15)",
    effect: { kind: "neon", edge: 70, color: "#22d3ee" },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "melancholy",
    name: "Melancholy Blue",
    category: "moods",
    filter: "saturate(0.6) brightness(0.95)",
    tint: null,
    effect: { kind: "duotone", dark: "#1e293b", light: "#bfdbfe" },
  },
  {
    id: "joyful",
    name: "Joyful Burst",
    category: "moods",
    filter: "saturate(1.6) brightness(1.1)",
    tint: "rgba(255,200,120,0.12)",
    effect: { kind: "fantasy", glow: 0.5 },
    titleColor: TITLE_BRIGHT,
    hashtagColor: TAG_BRIGHT,
  },
  {
    id: "mysterious",
    name: "Mysterious Fog",
    category: "moods",
    filter: "saturate(0.5) brightness(1.02) contrast(0.9)",
    tint: "rgba(180,190,200,0.22)",
    effect: { kind: "soft", radius: 5 },
    shadeMid: MID_LIGHT,
    shadeBottom: BOTTOM_LIGHT,
    titleColor: TITLE_BRIGHT,
  },
  // Lighting.
  {
    id: "ethereal",
    name: "Ethereal Light",
    category: "lighting",
    filter: "saturate(1.1) brightness(1.18)",
    tint: "rgba(255,250,240,0.15)",
    effect: { kind: "fantasy", glow: 0.4 },
    shadeMid: MID_LIGHT,
    shadeBottom: BOTTOM_LIGHT,
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "golden",
    name: "Golden Hour",
    category: "lighting",
    filter: "saturate(1.3) sepia(0.25)",
    tint: "rgba(255,170,60,0.15)",
    effect: { kind: "soft", radius: 2 },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "neonight",
    name: "Neon Night",
    category: "lighting",
    filter: "saturate(1.4) contrast(1.2) brightness(0.92)",
    tint: "rgba(10,10,40,0.3)",
    effect: { kind: "neon", edge: 80, color: "#ff4dff" },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "studio",
    name: "Studio Glow",
    category: "lighting",
    filter: "brightness(1.12) contrast(1.05)",
    tint: null,
    effect: { kind: "soft", radius: 1.5 },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "moonlit",
    name: "Moonlit Night",
    category: "lighting",
    filter: "brightness(0.85) saturate(0.7)",
    tint: null,
    effect: { kind: "duotone", dark: "#0b1026", light: "#c9d6f2" },
  },
  {
    id: "candlelit",
    name: "Candlelit Warmth",
    category: "lighting",
    filter: "sepia(0.35) brightness(0.98)",
    tint: "rgba(255,150,50,0.18)",
    effect: { kind: "fantasy", glow: 0.3 },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "spotlight",
    name: "Spotlight",
    category: "lighting",
    filter: "contrast(1.3)",
    tint: null,
    effect: { kind: "fantasy", glow: 0.2 },
    titleColor: TITLE_BRIGHT,
  },
  // Colors.
  {
    id: "cooltones",
    name: "Cool Tones",
    category: "colors",
    filter: "saturate(1.05)",
    tint: "rgba(80,140,200,0.18)",
    effect: { kind: "none" },
  },
  {
    id: "pinktones",
    name: "Pink Tones",
    category: "colors",
    filter: "saturate(1.2)",
    tint: "rgba(255,150,200,0.2)",
    effect: { kind: "none" },
  },
  {
    id: "warmember",
    name: "Warm Ember",
    category: "colors",
    filter: "saturate(1.25) sepia(0.2)",
    tint: "rgba(200,90,30,0.15)",
    effect: { kind: "none" },
    accent: EMBER,
  },
  {
    id: "monoink",
    name: "Mono Ink",
    category: "colors",
    filter: "grayscale(1) contrast(1.15)",
    tint: null,
    effect: { kind: "none" },
  },
  {
    id: "sepia",
    name: "Sepia Memory",
    category: "colors",
    filter: "sepia(0.9) contrast(1.02)",
    tint: null,
    effect: { kind: "grain", amount: 6 },
  },
  {
    id: "tealorange",
    name: "Teal & Orange",
    category: "colors",
    filter: "saturate(1.2) contrast(1.1)",
    tint: null,
    effect: { kind: "duotone", dark: "#0e3a45", light: "#f59e42" },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "forestgreens",
    name: "Forest Greens",
    category: "colors",
    filter: "saturate(1.1)",
    tint: null,
    effect: { kind: "duotone", dark: "#0d2818", light: "#b7e4c7" },
  },
  {
    id: "sunsetfade",
    name: "Sunset Fade",
    category: "colors",
    filter: "saturate(1.3)",
    tint: null,
    effect: { kind: "duotone", dark: "#3b1d5e", light: "#fbbf24" },
    titleColor: TITLE_BRIGHT,
  },
  // Backdrops.
  {
    id: "beach",
    name: "Beach Day",
    category: "backdrops",
    filter: "saturate(1.35) brightness(1.12)",
    tint: "rgba(255,240,200,0.14)",
    effect: { kind: "soft", radius: 1 },
    shadeMid: MID_LIGHT,
    shadeBottom: BOTTOM_LIGHT,
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "city",
    name: "City Lights",
    category: "backdrops",
    filter: "contrast(1.2) saturate(1.3)",
    tint: "rgba(20,30,60,0.18)",
    effect: { kind: "grain", amount: 5 },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "sunsetfield",
    name: "Sunset Field",
    category: "backdrops",
    filter: "saturate(1.4) sepia(0.3)",
    tint: "rgba(255,140,40,0.16)",
    effect: { kind: "none" },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "forestmist",
    name: "Forest Mist",
    category: "backdrops",
    filter: "saturate(0.95)",
    tint: "rgba(120,160,130,0.2)",
    effect: { kind: "soft", radius: 4 },
  },
  {
    id: "desert",
    name: "Desert Dune",
    category: "backdrops",
    filter: "sepia(0.5) saturate(1.2) brightness(1.05)",
    tint: "rgba(230,180,110,0.12)",
    effect: { kind: "none" },
    shadeMid: MID_LIGHT,
    shadeBottom: BOTTOM_LIGHT,
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "galaxy",
    name: "Galaxy Night",
    category: "backdrops",
    filter: "saturate(1.3) brightness(0.9) contrast(1.15)",
    tint: "rgba(20,10,50,0.2)",
    effect: { kind: "neon", edge: 120, color: "#a78bfa" },
    titleColor: TITLE_BRIGHT,
  },
  {
    id: "ocean",
    name: "Ocean Deep",
    category: "backdrops",
    filter: "saturate(1.1) brightness(0.95)",
    tint: null,
    effect: { kind: "duotone", dark: "#082f49", light: "#7dd3fc" },
  },
  {
    id: "aurora",
    name: "Aurora Sky",
    category: "backdrops",
    filter: "saturate(1.4) hue-rotate(-20deg)",
    tint: "rgba(40,120,120,0.15)",
    effect: { kind: "fantasy", glow: 0.35 },
    titleColor: TITLE_BRIGHT,
    hashtagColor: TAG_BRIGHT,
  },
];

export const PHOTO_STYLES: PhotoStyle[] = SEEDS.map(completeStyle);

export const DEFAULT_STYLE_ID = PHOTO_STYLES[0].id;

export function getPhotoStyle(id: string): PhotoStyle {
  return PHOTO_STYLES.find((s) => s.id === id) ?? PHOTO_STYLES[0];
}

/** Looks up a style in a dynamic catalog, falling back to its first entry. */
export function getPhotoStyleFrom(styles: PhotoStyle[], id: string): PhotoStyle {
  return styles.find((s) => s.id === id) ?? styles[0] ?? PHOTO_STYLES[0];
}

/**
 * Step-3 strip order: Meta's documented preset styles (meta.ai Restyle),
 * most recent first. The full 53-style catalog stays in the browse drawer.
 */
export const STEP3_STYLE_IDS = ["anime", "watercolor", "8bit", "illustrated", "glowy"];

/**
 * Resolves the step-3 strip for a dynamic catalog: the pinned styles that
 * exist in it (brand-configured on the identidad page, Meta's presets by
 * default), filled up to five with the catalog's first styles when pins are
 * missing — e.g. a remote catalog without them.
 */
export function getStep3Styles(
  styles: PhotoStyle[],
  pinIds: string[] = STEP3_STYLE_IDS
): PhotoStyle[] {
  const picks = pinIds
    .map((id) => styles.find((s) => s.id === id))
    .filter((s): s is PhotoStyle => s !== undefined)
    .slice(0, 5);
  for (const s of styles) {
    if (picks.length >= 5) break;
    if (!picks.some((p) => p.id === s.id)) picks.push(s);
  }
  return picks;
}
