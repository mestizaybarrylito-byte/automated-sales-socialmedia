import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "CRM — Casa de Brasas",
  description: "Mini CRM prototipo: clientes, productos y ventas con estado de link Clip.",
};

const sections = [
  {
    href: "/crm/clientes",
    title: "Clientes",
    desc: "Listar, agregar y actualizar clientes (nombre, teléfono, notas).",
  },
  {
    href: "/crm/productos",
    title: "Productos",
    desc: "Listar, agregar y actualizar productos del catálogo. Precios placeholder.",
  },
  {
    href: "/crm/ventas",
    title: "Ventas",
    desc: "Ventas con canal (web/WhatsApp) y estado del link de pago Clip.",
  },
  {
    href: "/crm/whatsapp",
    title: "Catálogo WhatsApp",
    desc: "Vista previa de los payloads del catálogo para WhatsApp Cloud API.",
  },
];

export default function CrmPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl">CRM</h1>
      <p className="text-charcoal-800/70 mt-2 max-w-2xl">
        Mini CRM del prototipo con datos locales (mock). La capa de datos (
        <code className="text-sm">lib/store.ts</code>) documenta el seam para migrar a Supabase sin
        cambiar las pantallas.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 mt-8">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-charcoal-800/80">{s.desc}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
