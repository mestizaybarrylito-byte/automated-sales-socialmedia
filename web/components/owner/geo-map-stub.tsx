import { deliveryZones } from "@/lib/owner-kpis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Geospatial Delivery Map — STUB.
 * No mapping library is bundled in this prototype step (Google Maps quota /
 * open-source layers land with the backend), so this panel states that
 * explicitly and shows the same zone aggregates as a table instead.
 */
export function GeoMapStub() {
  return (
    <section aria-label="Mapa geoespacial de entregas">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-2xl">Mapa geoespacial de entregas</h2>
        <Badge variant="secondary">STUB — sin librería de mapas</Badge>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Mapa interactivo pendiente</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-charcoal-800/80">
          <p>
            El mapa con puntos de entrega activos, rutas de surtido y ubicación de
            compradores aún no está disponible: ninguna librería de mapas está
            instalada en este prototipo. Cuando aterrice (cuota gratuita de Google
            Maps o capas open-source), este panel mostrará hubs, rutas y un mapa de
            calor de compradores.
          </p>
          <p className="mt-2">
            Mientras tanto, los agregados por zona (DEMO) que alimentarán el mapa:
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left border-b border-charcoal-900/15">
                  <th className="py-2 pr-4 font-semibold">Zona DEMO</th>
                  <th className="py-2 pr-4 font-semibold">Compradores</th>
                  <th className="py-2 pr-4 font-semibold">Ghost leads</th>
                  <th className="py-2 font-semibold">OTIF</th>
                </tr>
              </thead>
              <tbody>
                {deliveryZones.map((z) => (
                  <tr key={z.zone} className="border-b border-charcoal-900/10 last:border-0">
                    <td className="py-2 pr-4">{z.zone}</td>
                    <td className="py-2 pr-4">{z.activeBuyers}</td>
                    <td className="py-2 pr-4">{z.ghostLeads}</td>
                    <td className="py-2">{z.otif}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
