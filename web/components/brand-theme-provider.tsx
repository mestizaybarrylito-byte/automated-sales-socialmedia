"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cssVarsForBrand,
  defaultBrandSettings,
  type BrandSettings,
} from "@/lib/brand";
import {
  BRAND_STORAGE_KEY,
  BRAND_UPDATED_EVENT,
  loadBrandSettings,
  loadLocalBrand,
  saveBrandSettings,
  type StoredTarget,
} from "@/lib/brand-store";

interface BrandContextValue {
  brand: BrandSettings;
  loading: boolean;
  /** Where the settings were loaded from / last saved to. */
  storage: StoredTarget | "local";
  supabaseError: string | null;
  updateBrand: (patch: Partial<BrandSettings>) => Promise<void>;
  resetBrand: () => Promise<void>;
}

const BrandContext = createContext<BrandContextValue>({
  brand: defaultBrandSettings(),
  loading: true,
  storage: "local",
  supabaseError: null,
  updateBrand: async () => {},
  resetBrand: async () => {},
});

export function useBrand(): BrandContextValue {
  return useContext(BrandContext);
}

function applyBrandToDocument(settings: BrandSettings): void {
  if (typeof document === "undefined") return;
  const vars = cssVarsForBrand(settings);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

/**
 * Loads the brand row (database first, local fallback), applies theme colors
 * and fonts as CSS variables on <html>, and keeps every tab/component in sync.
 */
export function BrandThemeProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandSettings>(() => defaultBrandSettings());
  const [loading, setLoading] = useState(true);
  const [storage, setStorage] = useState<StoredTarget | "local">("local");
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  useEffect(() => {
    // Instant first paint from cache, then the database truth.
    const cached = loadLocalBrand();
    setBrand(cached);
    applyBrandToDocument(cached);
    let cancelled = false;
    void loadBrandSettings().then(({ settings, storage: from }) => {
      if (cancelled) return;
      setBrand(settings);
      setStorage(from === "supabase" ? "supabase+local" : "local");
      applyBrandToDocument(settings);
      setLoading(false);
    });
    const sync = () => {
      const fresh = loadLocalBrand();
      setBrand(fresh);
      applyBrandToDocument(fresh);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === BRAND_STORAGE_KEY) sync();
    };
    window.addEventListener(BRAND_UPDATED_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener(BRAND_UPDATED_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const updateBrand = useCallback(async (patch: Partial<BrandSettings>) => {
    const { settings, stored, supabaseError: err } = await saveBrandSettings(patch);
    setBrand(settings);
    setStorage(stored);
    setSupabaseError(err);
    applyBrandToDocument(settings);
  }, []);

  const resetBrand = useCallback(async () => {
    const defaults = defaultBrandSettings();
    await updateBrand({
      logoDataUrl: defaults.logoDataUrl,
      companyName: defaults.companyName,
      palette: defaults.palette,
      theme: defaults.theme,
      fonts: defaults.fonts,
      step3StyleIds: defaults.step3StyleIds,
    });
  }, [updateBrand]);

  const value = useMemo(
    () => ({ brand, loading, storage, supabaseError, updateBrand, resetBrand }),
    [brand, loading, storage, supabaseError, updateBrand, resetBrand]
  );
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}
