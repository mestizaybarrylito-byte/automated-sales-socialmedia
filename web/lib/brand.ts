/**
 * Brand identity core: logo palette extraction, theme mapping and WCAG contrast.
 *
 * Pure module (no DOM, no storage): safe to import on server and client.
 * Covered by `npm test` (web/test/brand.test.mjs).
 *
 * Contrast policy: the `background` slot stays light enough for dark text and
 * the `dark`/`surface` slots stay dark enough for light text, so the single
 * Tailwind tokens keep working (body text, header, borders). Buttons always
 * use the best-contrast text color for the current primary.
 */

import { STEP3_STYLE_IDS } from "./photo-styles";

export interface BrandTheme {
  /** CTAs, links, prices, accents. */
  primary: string;
  /** Headings on light backgrounds, badge text. */
  primaryDeep: string;
  /** Header/footer base, body text. */
  dark: string;
  /** Photo overlays, secondary buttons, dark pills. */
  surface: string;
  /** Page background, light text on dark surfaces. */
  background: string;
  /** Sparing highlights: batch seals, alert text, badges. */
  accent: string;
}

/** Font role ids (see FONT_CATALOG) for the three typography slots. */
export interface BrandFonts {
  /** Headings: h1-h3, card titles, hero. */
  heading: string;
  /** Body copy, prices, descriptions. */
  body: string;
  /** UI accents: buttons and badges. */
  accent: string;
}

export interface FontEntry {
  id: string;
  label: string;
  category: "Serif" | "Sans" | "Display" | "Mono";
  /** Full CSS font-family stack (system fonts only: works offline). */
  stack: string;
}

export interface BrandSettings {
  /** Resized logo as a data URL (or remote URL), null when no logo set. */
  logoDataUrl: string | null;
  /** Company name shown next to the logo in the top bar. */
  companyName: string;
  /** Suggested palette extracted from the logo, up to 6 hex colors. */
  palette: string[];
  /** Active color scheme applied across the app. */
  theme: BrandTheme;
  /** Active typography: one font per role, up to three different. */
  fonts: BrandFonts;
  /** Style ids pinned in wizard step 3 ("photo style" strip), up to five. */
  step3StyleIds: string[];
  /** ISO timestamp of the last save, "" when never saved. */
  updatedAt: string;
}

export interface ContrastCheck {
  id: string;
  label: string;
  fg: string;
  bg: string;
  ratio: number;
  required: number;
  pass: boolean;
}

export const DEFAULT_THEME: BrandTheme = {
  primary: "#9a5f3b",
  primaryDeep: "#563526",
  dark: "#1a1c1e",
  surface: "#232527",
  background: "#f7f2ea",
  accent: "#c2410c",
};

export const DEFAULT_PALETTE: string[] = [
  "#9a5f3b",
  "#563526",
  "#1a1c1e",
  "#232527",
  "#f7f2ea",
  "#c2410c",
];

export const THEME_SLOTS: { key: keyof BrandTheme; label: string; role: string }[] = [
  { key: "primary", label: "Primario", role: "Botones principales, enlaces, precios" },
  { key: "primaryDeep", label: "Primario profundo", role: "Titulares sobre claro, texto de insignias" },
  { key: "dark", label: "Oscuro base", role: "Barra superior, pie, texto del cuerpo" },
  { key: "surface", label: "Superficie", role: "Overlays de foto, botones secundarios" },
  { key: "background", label: "Fondo", role: "Fondo de páginas, texto claro sobre oscuro" },
  { key: "accent", label: "Acento", role: "Sellos de lote, avisos (uso escaso)" },
];

export const DEFAULT_COMPANY_NAME = "Casa de Brasas";
export const MAX_COMPANY_NAME = 60;

export const DEFAULT_FONTS: BrandFonts = {
  heading: "georgia",
  body: "system-sans",
  accent: "system-sans",
};

export const FONT_CATALOG: FontEntry[] = [
  { id: "georgia", label: "Georgia clásica", category: "Serif", stack: "Georgia, 'Times New Roman', serif" },
  { id: "palatino", label: "Palatino editorial", category: "Serif", stack: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif" },
  { id: "garamond", label: "Garamond elegante", category: "Serif", stack: "Garamond, 'Adobe Garamond Pro', 'Times New Roman', serif" },
  { id: "didot", label: "Didot contrastada", category: "Serif", stack: "Didot, 'Bodoni MT', 'Times New Roman', serif" },
  { id: "times", label: "Times neutra", category: "Serif", stack: "'Times New Roman', Times, serif" },
  { id: "system-sans", label: "Sans del sistema", category: "Sans", stack: "-apple-system, 'BlinkMacSystemFont', 'Segoe UI', Helvetica, Arial, sans-serif" },
  { id: "verdana", label: "Verdana amplia", category: "Sans", stack: "Verdana, Geneva, sans-serif" },
  { id: "trebuchet", label: "Trebuchet cálida", category: "Sans", stack: "'Trebuchet MS', Verdana, sans-serif" },
  { id: "arial-black", label: "Arial Black contundente", category: "Display", stack: "'Arial Black', 'Arial Bold', Arial, sans-serif" },
  { id: "mono", label: "Mono técnica", category: "Mono", stack: "Consolas, 'Courier New', monospace" },
];

export const FONT_ROLES: { key: keyof BrandFonts; label: string; role: string }[] = [
  { key: "heading", label: "Titulares", role: "H1–H3, títulos de tarjetas, hero" },
  { key: "body", label: "Cuerpo", role: "Párrafos, precios, descripciones" },
  { key: "accent", label: "Acento UI", role: "Botones e insignias" },
];

/** Catalog stack for a font id, falling back to the system sans. */
export function resolveFontStack(id: string): string {
  const found = FONT_CATALOG.find((f) => f.id === id);
  if (found) return found.stack;
  return FONT_CATALOG.find((f) => f.id === "system-sans")?.stack ?? "sans-serif";
}

export function normalizeCompanyName(input: unknown): string {
  const clean = typeof input === "string" ? input.trim().replace(/\s+/g, " ") : "";
  if (!clean) return DEFAULT_COMPANY_NAME;
  return clean.slice(0, MAX_COMPANY_NAME);
}

export const MAX_STEP3_STYLES = 5;

export function defaultBrandSettings(): BrandSettings {
  return {
    logoDataUrl: null,
    companyName: DEFAULT_COMPANY_NAME,
    palette: [...DEFAULT_PALETTE],
    theme: { ...DEFAULT_THEME },
    fonts: { ...DEFAULT_FONTS },
    step3StyleIds: [...STEP3_STYLE_IDS],
    updatedAt: "",
  };
}

/** Normalize "#abc", "abc" or "#aabbcc" to "#aabbcc"; null when invalid. */
export function normalizeHex(input: string): string | null {
  if (typeof input !== "string") return null;
  const clean = input.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return `#${full.toLowerCase()}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = normalizeHex(hex) ?? "#000000";
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  const pad = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${pad(r)}${pad(g)}${pad(b)}`;
}

/** "r g b" triplet for `rgb(var(--x-rgb) / <alpha-value>)` Tailwind tokens. */
export function hexToRgbTriplet(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

/** Mix two colors: t=0 returns a, t=1 returns b. */
export function mixHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const k = Math.min(1, Math.max(0, t));
  return rgbToHex(
    ca.r + (cb.r - ca.r) * k,
    ca.g + (cb.g - ca.g) * k,
    ca.b + (cb.b - ca.b) * k
  );
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio, 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** 0 (gray) to 1 (fully vivid). */
export function saturation(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  if (max === 0) return 0;
  return (max - Math.min(r, g, b)) / max;
}

function rgbDistance(a: string, b: string): number {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return Math.sqrt(
    (ca.r - cb.r) ** 2 + (ca.g - cb.g) ** 2 + (ca.b - cb.b) ** 2
  );
}

export const LIGHT_TEXT = "#ffffff";
export const DARK_TEXT = "#1a1c1e";

/** Whichever of white/near-black reads better on the given background. */
export function bestTextOn(bgHex: string): string {
  const bg = normalizeHex(bgHex) ?? "#000000";
  return contrastRatio(LIGHT_TEXT, bg) > contrastRatio(DARK_TEXT, bg)
    ? LIGHT_TEXT
    : DARK_TEXT;
}

/**
 * Quantize flat RGBA pixels into up to `maxColors` representative colors.
 * Frequency-ranked (dominant first), near-duplicate buckets merged, fully
 * transparent pixels ignored. Near-white is skipped as probable logo
 * background unless it is the only color found.
 */
export function extractPaletteFromPixels(
  pixels: ArrayLike<number>,
  maxColors = 6
): string[] {
  const count = Math.floor(pixels.length / 4);
  const limit = Math.min(6, Math.max(1, Math.floor(maxColors)));
  if (count <= 0) return [];
  const step = Math.max(1, Math.floor(count / 20000));
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < count; i += step) {
    const alpha = pixels[i * 4 + 3];
    if (alpha < 128) continue;
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const hit = buckets.get(key);
    if (hit) {
      hit.n += 1;
      hit.r += r;
      hit.g += g;
      hit.b += b;
    } else {
      buckets.set(key, { n: 1, r, g, b });
    }
  }
  type Entry = { hex: string; n: number; sat: number; lum: number };
  const entries: Entry[] = Array.from(buckets.values()).map((bk) => {
    const hex = rgbToHex(bk.r / bk.n, bk.g / bk.n, bk.b / bk.n);
    return { hex, n: bk.n, sat: saturation(hex), lum: relativeLuminance(hex) };
  });
  entries.sort((x, y) => y.n - x.n);
  if (entries.length === 0) return [];
  // Drop near-white background buckets when real colors exist.
  const chromatic = entries.filter((e) => !(e.lum > 0.92 && e.sat < 0.1));
  const pool = chromatic.length > 0 ? chromatic : entries;
  const picked: string[] = [];
  for (const minDist of [56, 28, 0]) {
    for (const e of pool) {
      if (picked.length >= limit) break;
      if (picked.includes(e.hex)) continue;
      if (picked.every((p) => rgbDistance(p, e.hex) >= minDist)) {
        picked.push(e.hex);
      }
    }
    if (picked.length >= limit) break;
  }
  return picked;
}

/**
 * Map a logo palette onto theme roles: lightest becomes the background,
 * darkest the base, the most vivid mid-tone the primary. Single-color
 * palettes expand into tints/shades of that color.
 */
export function themeFromPalette(palette: string[]): BrandTheme {
  const valid: string[] = [];
  for (const c of palette) {
    const hex = normalizeHex(c);
    if (hex && !valid.includes(hex)) valid.push(hex);
  }
  if (valid.length === 0) return { ...DEFAULT_THEME };
  if (valid.length === 1) {
    const [c] = valid;
    return {
      primary: c,
      primaryDeep: mixHex(c, "#000000", 0.35),
      dark: mixHex(c, "#000000", 0.8),
      surface: mixHex(c, "#000000", 0.68),
      background: mixHex(c, "#ffffff", 0.92),
      accent: c,
    };
  }
  const byLum = [...valid].sort(
    (a, b) => relativeLuminance(a) - relativeLuminance(b)
  );
  const background = byLum[byLum.length - 1];
  const dark = byLum[0];
  const mids = byLum.length > 2 ? byLum.slice(1, -1) : byLum;
  const bySat = [...mids].sort((a, b) => {
    const ds = saturation(b) - saturation(a);
    if (Math.abs(ds) > 0.05) return ds;
    // Tie-break: prefer a mid luminance that works as primary.
    return (
      Math.abs(relativeLuminance(a) - 0.3) - Math.abs(relativeLuminance(b) - 0.3)
    );
  });
  const primary = bySat[0];
  const accent =
    valid
      .filter((c) => c !== primary)
      .sort((a, b) => saturation(b) - saturation(a))
      .find((c) => rgbDistance(c, primary) >= 60) ?? primary;
  return {
    primary,
    primaryDeep: mixHex(primary, dark, 0.5),
    dark,
    surface:
      byLum.length > 3 ? byLum[1] : mixHex(dark, background, 0.18),
    background,
    accent,
  };
}

function meetContrast(
  mutable: string,
  fixed: string,
  target: number
): { hex: string; ratio: number; changed: boolean } {
  const start = normalizeHex(mutable) ?? "#000000";
  const ref = normalizeHex(fixed) ?? "#ffffff";
  if (contrastRatio(start, ref) >= target) {
    return { hex: start, ratio: contrastRatio(start, ref), changed: false };
  }
  // Try both endpoints: a greedy single-step direction gets trapped in local
  // maxima (e.g. darkening a dark background against dark blue helps at
  // first but caps below target), so pick the reachable side with the
  // smallest change instead.
  const attempt = (end: string) => {
    let hex = start;
    let ratio = contrastRatio(hex, ref);
    let steps = 0;
    while (steps < 60 && ratio < target) {
      hex = mixHex(hex, end, 0.07);
      ratio = contrastRatio(hex, ref);
      steps += 1;
    }
    return { hex, ratio, steps, ok: ratio >= target };
  };
  const options = [attempt("#000000"), attempt("#ffffff")];
  const passing = options.filter((o) => o.ok).sort((a, b) => a.steps - b.steps);
  const best =
    passing[0] ?? options.sort((a, b) => b.ratio - a.ratio)[0] ?? attempt("#ffffff");
  return { hex: best.hex, ratio: best.ratio, changed: best.hex !== start };
}

/**
 * Check the five readability pairs of a theme and compute the smallest
 * adjustment that brings every pair to its WCAG target. `checks` describes
 * the input theme; apply `fixedTheme` to persist the correction.
 */
export function checkThemeContrast(theme: BrandTheme): {
  checks: ContrastCheck[];
  fixedTheme: BrandTheme;
} {
  const t = { ...theme };
  const checks: ContrastCheck[] = [
    {
      id: "body",
      label: "Texto sobre fondo",
      fg: t.dark,
      bg: t.background,
      ratio: contrastRatio(t.dark, t.background),
      required: 4.5,
      pass: contrastRatio(t.dark, t.background) >= 4.5,
    },
    {
      id: "heading",
      label: "Titulares sobre fondo",
      fg: t.primaryDeep,
      bg: t.background,
      ratio: contrastRatio(t.primaryDeep, t.background),
      required: 4.5,
      pass: contrastRatio(t.primaryDeep, t.background) >= 4.5,
    },
    {
      id: "button",
      label: "Texto de botones principales",
      fg: bestTextOn(t.primary),
      bg: t.primary,
      ratio: contrastRatio(bestTextOn(t.primary), t.primary),
      required: 4.5,
      pass: contrastRatio(bestTextOn(t.primary), t.primary) >= 4.5,
    },
    {
      id: "header",
      label: "Texto de barra superior y pie",
      fg: bestTextOn(t.dark),
      bg: t.dark,
      ratio: contrastRatio(bestTextOn(t.dark), t.dark),
      required: 4.5,
      pass: contrastRatio(bestTextOn(t.dark), t.dark) >= 4.5,
    },
    {
      id: "accent",
      label: "Acento sobre claro (sellos)",
      fg: t.accent,
      bg: "#ffffff",
      ratio: contrastRatio(t.accent, "#ffffff"),
      required: 3,
      pass: contrastRatio(t.accent, "#ffffff") >= 3,
    },
  ];

  const fixed = { ...t };
  // Iterate: pairs share slots (body fixes the background against dark, then
  // the header fix moves dark), so one pass can invalidate an earlier pair.
  const allPass = (c: BrandTheme): boolean =>
    contrastRatio(c.dark, c.background) >= 4.5 &&
    contrastRatio(c.primaryDeep, c.background) >= 4.5 &&
    contrastRatio(bestTextOn(c.primary), c.primary) >= 4.5 &&
    contrastRatio(bestTextOn(c.dark), c.dark) >= 4.5 &&
    contrastRatio(c.accent, "#ffffff") >= 3;
  for (let i = 0; i < 5 && !allPass(fixed); i++) {
    fixed.background = meetContrast(fixed.background, fixed.dark, 4.5).hex;
    fixed.primaryDeep = meetContrast(fixed.primaryDeep, fixed.background, 4.5).hex;
    fixed.primary = meetContrast(fixed.primary, bestTextOn(fixed.primary), 4.5).hex;
    fixed.dark = meetContrast(fixed.dark, bestTextOn(fixed.dark), 4.5).hex;
    fixed.accent = meetContrast(fixed.accent, "#ffffff", 3).hex;
  }
  return { checks, fixedTheme: fixed };
}

/** CSS custom properties (hex + `r g b` triplets) for a theme. */
export function cssVarsForTheme(theme: BrandTheme): Record<string, string> {
  const onPrimary = bestTextOn(theme.primary);
  const onDark = bestTextOn(theme.dark);
  const onSurface = bestTextOn(theme.surface);
  const softBg = mixHex(theme.background, theme.primary, 0.14);
  const softText = mixHex("#ffffff", theme.primary, 0.3);
  const hover = mixHex(theme.primary, "#000000", 0.12);
  const hexVars: Record<string, string> = {
    "--brand-primary": theme.primary,
    "--brand-primary-deep": theme.primaryDeep,
    "--brand-dark": theme.dark,
    "--brand-surface": theme.surface,
    "--brand-bg": theme.background,
    "--brand-accent": theme.accent,
    "--brand-on-primary": onPrimary,
    "--brand-on-dark": onDark,
    "--brand-on-surface": onSurface,
    "--brand-soft-bg": softBg,
    "--brand-soft-text": softText,
    "--brand-primary-hover": hover,
  };
  const out: Record<string, string> = { ...hexVars };
  for (const [key, value] of Object.entries(hexVars)) {
    out[`${key}-rgb`] = hexToRgbTriplet(value);
  }
  return out;
}

function isValidLogoUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 1_500_000 &&
    (value.startsWith("data:image/") || value.startsWith("https://"))
  );
}

/** CSS custom properties for the full brand: theme colors + font stacks. */
export function cssVarsForBrand(settings: BrandSettings): Record<string, string> {
  return {
    ...cssVarsForTheme(settings.theme),
    "--brand-font-heading": resolveFontStack(settings.fonts.heading),
    "--brand-font-body": resolveFontStack(settings.fonts.body),
    "--brand-font-accent": resolveFontStack(settings.fonts.accent),
  };
}

/** Coerce unknown stored data into a safe BrandSettings object. */
export function validateBrandSettings(input: unknown): BrandSettings {
  const fallback = defaultBrandSettings();
  if (!input || typeof input !== "object") return fallback;
  const raw = input as Partial<BrandSettings>;
  const palette: string[] = [];
  if (Array.isArray(raw.palette)) {
    for (const c of raw.palette) {
      const hex = typeof c === "string" ? normalizeHex(c) : null;
      if (hex && !palette.includes(hex)) palette.push(hex);
      if (palette.length >= 6) break;
    }
  }
  const rawTheme = (raw.theme ?? {}) as Partial<BrandTheme>;
  const theme: BrandTheme = { ...DEFAULT_THEME };
  (Object.keys(DEFAULT_THEME) as (keyof BrandTheme)[]).forEach((key) => {
    const hex =
      typeof rawTheme[key] === "string"
        ? normalizeHex(rawTheme[key] as string)
        : null;
    if (hex) theme[key] = hex;
  });
  const rawFonts = (raw.fonts ?? {}) as Partial<BrandFonts>;
  const fonts: BrandFonts = { ...DEFAULT_FONTS };
  (Object.keys(DEFAULT_FONTS) as (keyof BrandFonts)[]).forEach((key) => {
    const id = rawFonts[key];
    if (typeof id === "string" && FONT_CATALOG.some((f) => f.id === id)) {
      fonts[key] = id;
    }
  });
  const step3StyleIds: string[] = [];
  if (Array.isArray(raw.step3StyleIds)) {
    for (const id of raw.step3StyleIds) {
      if (typeof id === "string" && id.trim() && !step3StyleIds.includes(id)) {
        step3StyleIds.push(id);
      }
      if (step3StyleIds.length >= MAX_STEP3_STYLES) break;
    }
  }
  return {
    logoDataUrl: isValidLogoUrl(raw.logoDataUrl) ? raw.logoDataUrl : null,
    companyName: normalizeCompanyName(raw.companyName),
    palette: palette.length > 0 ? palette : [...DEFAULT_PALETTE],
    theme,
    fonts,
    step3StyleIds:
      step3StyleIds.length > 0 ? step3StyleIds : [...STEP3_STYLE_IDS],
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : "",
  };
}
