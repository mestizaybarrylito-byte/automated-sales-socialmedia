/**
 * Brand persistence seam: localStorage-first with Supabase as the database.
 *
 * The logo (resized data URL), company name, suggested palette, active theme
 * and typography are always saved locally so the prototype works offline; when
 * NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY are configured the
 * same row is upserted into the `brand_settings` table (see
 * /supabase/migrations/20261103_brand_settings.sql) via the PostgREST API, so
 * no new dependency is needed. Service-role key is never used here.
 */

import {
  defaultBrandSettings,
  extractPaletteFromPixels,
  validateBrandSettings,
  type BrandSettings,
} from "./brand";
import { getSupabaseConfig, isSupabaseConfigured } from "@/supabase/client";

export const BRAND_STORAGE_KEY = "casa-de-brasas-brand-v1";
export const BRAND_ROW_ID = "default";
export const BRAND_UPDATED_EVENT = "brand-updated";

export interface BrandRow {
  id: string;
  logo_data_url: string | null;
  company_name: unknown;
  palette: unknown;
  theme: unknown;
  fonts: unknown;
  step3_style_ids: unknown;
  updated_at: string;
}

export function rowToSettings(row: BrandRow): BrandSettings {
  return validateBrandSettings({
    logoDataUrl: row.logo_data_url,
    companyName: row.company_name,
    palette: row.palette,
    theme: row.theme,
    fonts: row.fonts,
    step3StyleIds: row.step3_style_ids,
    updatedAt: row.updated_at,
  });
}

export function brandSettingsToRow(settings: BrandSettings): BrandRow {
  return {
    id: BRAND_ROW_ID,
    logo_data_url: settings.logoDataUrl,
    company_name: settings.companyName,
    palette: settings.palette,
    theme: settings.theme,
    fonts: settings.fonts,
    step3_style_ids: settings.step3StyleIds,
    updated_at: settings.updatedAt,
  };
}

/** Synchronous local read for first paint (SSR-safe, never throws). */
export function loadLocalBrand(): BrandSettings {
  if (typeof window === "undefined") return defaultBrandSettings();
  try {
    const raw = window.localStorage.getItem(BRAND_STORAGE_KEY);
    if (!raw) return defaultBrandSettings();
    return validateBrandSettings(JSON.parse(raw));
  } catch {
    return defaultBrandSettings();
  }
}

/** Synchronous local write; notifies other components in this tab. */
export function saveLocalBrand(settings: BrandSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event(BRAND_UPDATED_EVENT));
  } catch {
    /* storage full/blocked: keep the in-memory copy for this session */
  }
}

function restUrl(): string {
  const { url } = getSupabaseConfig();
  return `${url.replace(/\/$/, "")}/rest/v1/brand_settings`;
}

function restHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const { anonKey } = getSupabaseConfig();
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

/** Database read; null when unconfigured, missing, or unreachable. */
export async function loadBrandFromSupabase(
  signal?: AbortSignal
): Promise<BrandSettings | null> {
  if (!isSupabaseConfigured()) return null;
  const res = await fetch(`${restUrl()}?id=eq.${BRAND_ROW_ID}&select=*`, {
    headers: restHeaders(),
    signal,
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as BrandRow[];
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rowToSettings(rows[0]);
}

/** Database upsert; throws with a short message on failure. */
export async function saveBrandToSupabase(settings: BrandSettings): Promise<void> {
  const res = await fetch(restUrl(), {
    method: "POST",
    headers: restHeaders({ Prefer: "resolution=merge-duplicates" }),
    body: JSON.stringify(brandSettingsToRow(settings)),
  });
  if (!res.ok) {
    throw new Error(`Supabase guardó ${res.status}`);
  }
}

/**
 * Load order: database first (short timeout), local fallback. A database hit
 * refreshes the local cache so the next first paint is instant.
 */
export async function loadBrandSettings(): Promise<{
  settings: BrandSettings;
  storage: "supabase" | "local";
}> {
  const local = loadLocalBrand();
  if (!isSupabaseConfigured()) return { settings: local, storage: "local" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const remote = await loadBrandFromSupabase(controller.signal);
    if (remote) {
      saveLocalBrand(remote);
      return { settings: remote, storage: "supabase" };
    }
  } catch {
    /* offline/unauthorized: fall through to local */
  } finally {
    clearTimeout(timer);
  }
  return { settings: local, storage: "local" };
}

export type StoredTarget = "supabase+local" | "local";

/**
 * Save locally (always) and to the database when configured. Never throws:
 * the resolved target tells the UI where the data landed.
 */
export async function saveBrandSettings(
  patch: Partial<BrandSettings>
): Promise<{ settings: BrandSettings; stored: StoredTarget; supabaseError: string | null }> {
  const settings = validateBrandSettings({
    ...loadLocalBrand(),
    ...patch,
    updatedAt: new Date().toISOString(),
  });
  saveLocalBrand(settings);
  if (!isSupabaseConfigured()) {
    return { settings, stored: "local", supabaseError: null };
  }
  try {
    await saveBrandToSupabase(settings);
    return { settings, stored: "supabase+local", supabaseError: null };
  } catch (err) {
    return {
      settings,
      stored: "local",
      supabaseError: err instanceof Error ? err.message : "No se pudo guardar en Supabase",
    };
  }
}

/**
 * Resize an uploaded logo for header/watermark use (browser-only).
 * Keeps PNG transparency; caps the payload so the database row stays small.
 */
export function processLogoFile(file: File, maxDim = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined" || typeof Image === "undefined") {
      reject(new Error("Solo disponible en el navegador"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo debe ser una imagen (PNG, JPG, SVG o WebP)"));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height, 1));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D no disponible");
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(objectUrl);
        const keepPng = file.type === "image/png";
        let dataUrl = canvas.toDataURL(keepPng ? "image/png" : "image/jpeg", 0.85);
        // Oversized PNG (photo-like with alpha): retry once as JPEG.
        if (keepPng && dataUrl.length > 700_000) {
          const flat = document.createElement("canvas");
          flat.width = w;
          flat.height = h;
          const fctx = flat.getContext("2d");
          if (fctx) {
            fctx.fillStyle = "#ffffff";
            fctx.fillRect(0, 0, w, h);
            fctx.drawImage(canvas, 0, 0);
            dataUrl = flat.toDataURL("image/jpeg", 0.85);
          }
        }
        resolve(dataUrl);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err instanceof Error ? err : new Error("No se pudo procesar el logo"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo leer el archivo de imagen"));
    };
    img.src = objectUrl;
  });
}

/** Draw the logo small and quantize its pixels (browser-only). */
export function extractPaletteFromDataUrl(
  dataUrl: string,
  maxColors = 6
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined" || typeof Image === "undefined") {
      reject(new Error("Solo disponible en el navegador"));
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, 160 / Math.max(img.width, img.height, 1));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Canvas 2D no disponible");
        ctx.drawImage(img, 0, 0, w, h);
        const pixels = ctx.getImageData(0, 0, w, h).data;
        resolve(extractPaletteFromPixels(pixels, maxColors));
      } catch (err) {
        reject(err instanceof Error ? err : new Error("No se pudo analizar el logo"));
      }
    };
    img.onerror = () => reject(new Error("No se pudo leer el logo"));
    img.src = dataUrl;
  });
}
