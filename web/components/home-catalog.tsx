"use client";

import { useStoreProducts } from "@/lib/use-store-products";
import { ProductCard } from "@/components/product-card";

/** Home featured grid, fed by the live CRM catalog (active products). */
export function HomeCatalog() {
  const { products, loaded } = useStoreProducts();

  if (!loaded) {
    return (
      <p className="font-sans text-sm text-charcoal-800/60" role="status">
        Cargando catálogo…
      </p>
    );
  }
  if (products.length === 0) {
    return (
      <p className="text-sm text-charcoal-800/70" role="alert">
        No hay productos activos por el momento.
      </p>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
