"use client";

import { useStoreProducts } from "@/lib/use-store-products";
import { productImage } from "@/lib/store";
import { formatMXN } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsappOrderButton } from "@/components/whatsapp-order-button";

/** Online catalog grid, fed by the live CRM catalog (active products). */
export function CatalogGrid() {
  const { products, loaded } = useStoreProducts();

  if (!loaded) {
    return (
      <p className="font-sans text-sm text-charcoal-800/60 mt-8" role="status">
        Cargando catálogo…
      </p>
    );
  }
  if (products.length === 0) {
    return (
      <p className="text-sm text-charcoal-800/70 mt-8" role="alert">
        No hay productos activos por el momento. Vuelve pronto.
      </p>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
      {products.map((p) => (
        <Card key={p.slug} className="overflow-hidden flex flex-col">
          <div className="photo-frame h-48">
            <img src={productImage(p)} alt={p.name} loading="lazy" />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xl">{p.name}</CardTitle>
              <Badge variant="secondary">Placeholder</Badge>
            </div>
            <p className="font-sans text-rust-700 font-semibold">
              {formatMXN(p.priceMXN)}{" "}
              <span className="text-xs font-normal text-charcoal-800/60">
                MXN · precio placeholder
              </span>
            </p>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-charcoal-800/80 flex-1">
            {p.description}
          </CardContent>
          <div className="p-6 pt-0">
            <WhatsappOrderButton productName={p.name} priceMXN={p.priceMXN} />
          </div>
        </Card>
      ))}
    </div>
  );
}
