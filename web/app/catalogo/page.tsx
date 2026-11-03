import { WHATSAPP_NUMBER } from "@/lib/config";
import { CatalogGrid } from "@/components/catalog-grid";

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

      <CatalogGrid />
    </div>
  );
}
