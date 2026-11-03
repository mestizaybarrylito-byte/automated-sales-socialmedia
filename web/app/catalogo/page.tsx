import { products } from "@/lib/products";
import { WHATSAPP_NUMBER, formatMXN, productOrderMessage, waOrderLink } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Catálogo y pedidos por WhatsApp — Casa de Brasas",
  description:
    "Catálogo en línea: pide por WhatsApp con un clic. Precios placeholder en MXN, se confirman por lote semanal.",
};

export default function CatalogoPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl">Catálogo en línea</h1>
      <p className="text-charcoal-800/70 mt-2 max-w-2xl">
        Elige tu corte o salsa y pide por WhatsApp al {WHATSAPP_NUMBER}. Todos los precios están
        marcados como <strong>placeholder</strong> y se confirman con el proveedor por lote semanal.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {products.map((p) => (
          <Card key={p.slug} className="overflow-hidden flex flex-col">
            <div className="photo-frame h-48">
              <img src={p.image} alt={p.name} loading="lazy" />
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
              <Button asChild className="w-full">
                <a
                  href={waOrderLink(productOrderMessage(p.name, p.priceMXN))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pedir por WhatsApp
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
