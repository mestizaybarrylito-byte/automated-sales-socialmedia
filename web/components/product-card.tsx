import type { Product } from "@/lib/products";
import type { StoreProduct } from "@/lib/store";
import { productImage } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatMXN(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductCard({ product }: { product: Product | StoreProduct }) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="photo-frame h-44">
        <img src={productImage(product)} alt={`${product.name} (imagen placeholder)`} loading="lazy" />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl">{product.name}</CardTitle>
          <Badge variant="secondary">Placeholder</Badge>
        </div>
        <p className="font-sans text-rust-700 font-semibold">
          {formatMXN(product.priceMXN)}{" "}
          <span className="text-xs font-normal text-charcoal-800/60">MXN · precio placeholder</span>
        </p>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-charcoal-800/80 flex-1">
        {product.description}
      </CardContent>
      <div className="p-6 pt-0">
        <Button variant="outline" className="w-full" disabled title="Checkout en pasos posteriores">
          Agregar (demo)
        </Button>
      </div>
    </Card>
  );
}
