"use client";

import { useEffect, useState } from "react";
import {
  CLIP_STATUS_LABEL, localStore, uid,
  type ClipStatus, type Customer, type Sale, type StoreProduct,
} from "@/lib/store";
import { formatMXN } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statuses: ClipStatus[] = ["sin_link", "link_generado", "pagado", "surtido"];

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [slug, setSlug] = useState("");
  const [qty, setQty] = useState(1);
  const [channel, setChannel] = useState<"web" | "whatsapp">("whatsapp");

  useEffect(() => {
    setSales(localStore.listSales());
    const cs = localStore.listCustomers();
    const ps = localStore.listProducts();
    setCustomers(cs);
    setProducts(ps);
    setCustomerId(cs[0]?.id ?? "");
    setSlug(ps[0]?.slug ?? "");
  }, []);

  function customerName(id: string) {
    return customers.find((c) => c.id === id)?.name ?? id;
  }

  function addSale(e: React.FormEvent) {
    e.preventDefault();
    const p = products.find((x) => x.slug === slug);
    if (!p || !customerId) return;
    const sale: Sale = {
      id: uid("vta"),
      customerId,
      items: [{ slug: p.slug, qty, unitPriceMXN: p.priceMXN }],
      totalMXN: p.priceMXN * qty,
      channel,
      clipStatus: "sin_link",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    localStore.saveSale(sale);
    setSales(localStore.listSales());
  }

  function updateStatus(sale: Sale, clipStatus: ClipStatus) {
    // Prototype guard mirroring the payment-fulfillment skill: never mark
    // fulfilled (surtido) on an unconfirmed (unpaid) sale.
    if (clipStatus === "surtido" && sale.clipStatus !== "pagado" && sale.clipStatus !== "surtido") {
      alert("No se puede surtir una venta sin pago confirmado (Clip).");
      return;
    }
    const updated: Sale = {
      ...sale,
      clipStatus,
      clipLink:
        clipStatus === "link_generado" && !sale.clipLink
          ? `https://clip.mx/demo-link-${sale.id}`
          : sale.clipLink,
    };
    localStore.saveSale(updated);
    setSales(localStore.listSales());
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl">Ventas</h1>
      <p className="text-charcoal-800/70 mt-2">
        {sales.length} ventas. El estado Clip refleja el ledger de transacciones: el surtido solo
        procede con pago confirmado.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Registrar venta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addSale} className="grid gap-3 sm:grid-cols-5">
            <label className="text-sm grid gap-1">
              Cliente
              <select className="border rounded px-3 py-2" value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="text-sm grid gap-1">
              Producto
              <select className="border rounded px-3 py-2" value={slug}
                onChange={(e) => setSlug(e.target.value)}>
                {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </select>
            </label>
            <label className="text-sm grid gap-1">
              Cantidad
              <input type="number" min={1} className="border rounded px-3 py-2" value={qty}
                onChange={(e) => setQty(Number(e.target.value))} />
            </label>
            <label className="text-sm grid gap-1">
              Canal
              <select className="border rounded px-3 py-2" value={channel}
                onChange={(e) => setChannel(e.target.value as "web" | "whatsapp")}>
                <option value="whatsapp">WhatsApp</option>
                <option value="web">Web</option>
              </select>
            </label>
            <div className="flex items-end">
              <Button type="submit">Registrar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 mt-6">
        {sales.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-lg">
                  {s.id} · {customerName(s.customerId)}
                </CardTitle>
                <Badge variant={s.clipStatus === "pagado" || s.clipStatus === "surtido" ? "default" : "secondary"}>
                  {CLIP_STATUS_LABEL[s.clipStatus]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-charcoal-800/80">
              <p>
                {s.items.map((i) => `${i.slug} × ${i.qty}`).join(", ")} · {formatMXN(s.totalMXN)} MXN
                (placeholder) · canal {s.channel} · {s.createdAt}
              </p>
              {s.clipLink && <p className="mt-1 break-all">Link Clip: {s.clipLink}</p>}
              <div className="flex gap-2 mt-3 flex-wrap">
                {statuses.map((st) => (
                  <Button
                    key={st} variant={s.clipStatus === st ? "default" : "outline"}
                    onClick={() => updateStatus(s, st)}
                  >
                    {CLIP_STATUS_LABEL[st]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
