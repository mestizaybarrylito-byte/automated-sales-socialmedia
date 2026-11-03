"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_COMPANY_NAME,
  brandFaviconHref,
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
  const pathname = usePathname();
  const prevName = useRef(DEFAULT_COMPANY_NAME);

  // Every page title carries the company name: swap the name segment as the
  // brand changes or the route swaps in fresh static metadata. No-op while
  // the brand is the default, so SSR titles stay byte-identical.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const current = document.title;
    if (prevName.current !== DEFAULT_COMPANY_NAME && current.includes(prevName.current)) {
      document.title = current.split(prevName.current).join(brand.companyName);
    } else if (
      brand.companyName !== DEFAULT_COMPANY_NAME &&
      current.includes(DEFAULT_COMPANY_NAME)
    ) {
      document.title = current.split(DEFAULT_COMPANY_NAME).join(brand.companyName);
    }
    prevName.current = brand.companyName;
  }, [brand.companyName, pathname]);

  // Browser tab icon follows the uploaded logo (default badge when none).
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.head
      .querySelectorAll('link[rel="icon"]')
      .forEach((el) => el.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = brandFaviconHref(brand.logoDataUrl);
    document.head.appendChild(link);
  }, [brand.logoDataUrl]);

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
