import { buildAllCatalogPayloads, isCatalogSendEnabled } from "@/lib/whatsapp-catalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoiceNoteBox } from "@/components/voice-note-box";

export const metadata = {
  title: "Catálogo WhatsApp (preview) — Casa de Brasas",
};

export default function WhatsappPage() {
  const payloads = buildAllCatalogPayloads();
  const enabled = isCatalogSendEnabled();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl">Catálogo WhatsApp</h1>
        <Badge variant={enabled ? "default" : "secondary"}>
          {enabled ? "Envío habilitado" : "Solo vista previa"}
        </Badge>
      </div>
      <p className="text-charcoal-800/70 mt-2 max-w-2xl">
        Payloads de items del catálogo generados desde <code className="text-sm">data/products.json</code>{" "}
        para WhatsApp Cloud API. El envío real está bloqueado detrás de{" "}
        <code className="text-sm">WHATSAPP_CATALOG_SEND_ENABLED=true</code> (ver notas de setup en{" "}
        <code className="text-sm">lib/whatsapp-catalog.ts</code>); en este modo solo se previsualizan.
      </p>

      <VoiceNoteBox />

      <div className="grid gap-4 mt-8">
        {payloads.map((p) => (
          <Card key={p.retailer_id}>
            <CardHeader>
              <CardTitle className="text-lg">{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm">
              <pre className="bg-charcoal-900 text-cream rounded p-4 overflow-x-auto text-xs">
                {JSON.stringify(p, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
