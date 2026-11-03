import Link from "next/link";
import { KpiHub } from "@/components/owner/kpi-hub";
import { ApprovalHub } from "@/components/owner/approval-hub";
import { Segmentation } from "@/components/owner/segmentation";
import { GeoMapStub } from "@/components/owner/geo-map-stub";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Panel del Dueño — Casa de Brasas",
  description:
    "Dashboard del dueño: KPIs ejecutivos DEMO con Recharts, hub de aprobación de campaña, segmentación de clientes y mapa de entregas.",
};

export default function OwnerPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <p className="font-sans text-sm text-rust-700 font-medium">
        Panel del Dueño · decisiones sobre datos, no sobre corazonadas
      </p>
      <h1 className="text-3xl mt-1">Tablero ejecutivo</h1>
      <p className="text-charcoal-800/70 mt-2 max-w-2xl">
        KPIs de CGMO, CRO y LOG-SD, comparativo año contra año, aprobación de la
        campaña semanal y segmentación de clientes. Todas las cifras de esta
        página son <strong>simuladas (DEMO)</strong>; las decisiones de compra y
        entrega reales usan la tienda mock y el CRM.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-2xl">Campaña semanal desde tendencias</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-charcoal-800/70 max-w-xl text-sm">
            Top 5 de Facebook, Instagram, TikTok, WhatsApp, Threads y X en
            columnas. Elige una tendencia y el asistente te guía: producto del
            catálogo, narrativa editable e imagen lista para publicar.
          </p>
          <Button asChild>
            <Link href="/owner/trends">Ver tendencias semanales</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-10 grid gap-14">
        <KpiHub />
        <ApprovalHub />
        <Segmentation />
        <GeoMapStub />
      </div>
    </div>
  );
}
