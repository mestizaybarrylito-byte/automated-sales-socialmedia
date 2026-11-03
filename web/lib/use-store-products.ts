"use client";

import { useEffect, useState } from "react";
import { activeProducts, localStore, type StoreProduct } from "./store";

/**
 * Live CRM catalog for storefront surfaces (online catalog, home grid,
 * wizard step 1). Loads after mount (SSR-safe, no hydration mismatch),
 * active products only, refreshed across tabs.
 */
export function useStoreProducts(): { products: StoreProduct[]; loaded: boolean } {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setProducts(activeProducts(localStore.listProducts()));
      setLoaded(true);
    };
    refresh();
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { products, loaded };
}
