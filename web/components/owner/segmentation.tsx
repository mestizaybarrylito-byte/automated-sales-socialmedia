"use client";

import { useEffect, useState } from "react";
import { localStore, type Customer, type Sale } from "@/lib/store";
import { getProduct } from "@/lib/products";
import { formatMXN } from "@/lib/config";
import { ghostLeads } from "@/lib/owner-kpis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function affinityOf(sales: Sale[]): string {
  const counts = new Map<string, number>();
  for (const s of sales) {
    for (const it of s.items) counts.set(it.slug, (counts.get(it.slug) ?? 0) + it.qty);
  }
  let best: string | null = null;
  let bestQty = 0;
  counts.forEach((qty, slug) => {
    if (qty > bestQty) {
      best = slug;
      bestQty = qty;
    }
  });
  if (!best) return "—";
  return getProduct(best)?.name.replace("[PLACEHOLDER] ", "") ?? best;
}

export function Segmentation() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    setCustomers(localStore.listCustomers());
    setSales(localStore.listSales());
  }, []);

  const buyers = customers.map((c) => {
    const mine = sales.filter((s) => s.customerId === c.id);
    const ltv = mine.reduce((sum, s) => sum + s.totalMXN, 0);
    const last = mine.map((s) => s.createdAt).sort().at(-1) ?? "—";
    return { customer: c, frequency: mine.length, ltv, last, affinity: affinityOf(mine) };
  });

  return (
    <section aria-label="Segmentación de clientes">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-2xl">Segmentación de clientes</h2>
        <Badge>DEMO · compradores desde la tienda mock</Badge>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Compradores activos — {buyers.length}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left border-b border-charcoal-900/15">
                <th className="py-2 pr-4 font-semibold">Cliente</th>
                <th className="py-2 pr-4 font-semibold">Contacto</th>
                <th className="py-2 pr-4 font-semibold">Compras</th>
                <th className="py-2 pr-4 font-semibold">Afinidad</th>
                <th className="py-2 pr-4 font-semibold">Última compra</th>
                <th className="py-2 font-semibold">Valor acumulado</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map(({ customer, frequency, ltv, last, affinity }) => (
                <tr key={customer.id} className="border-b border-charcoal-900/10 last:border-0">
                  <td className="py-2 pr-4">{customer.name}</td>
                  <td className="py-2 pr-4 text-charcoal-800/70">{customer.phone}</td>
                  <td className="py-2 pr-4">{frequency}</td>
                  <td className="py-2 pr-4">{affinity}</td>
                  <td className="py-2 pr-4">{last}</td>
                  <td className="py-2">{formatMXN(ltv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Ghost leads — {ghostLeads.length} registrados sin compra</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left border-b border-charcoal-900/15">
                <th className="py-2 pr-4 font-semibold">Lead</th>
                <th className="py-2 pr-4 font-semibold">Registro</th>
                <th className="py-2 pr-4 font-semibold">Paso de abandono</th>
                <th className="py-2 font-semibold">Última actividad</th>
              </tr>
            </thead>
            <tbody>
              {ghostLeads.map((g) => (
                <tr key={g.id} className="border-b border-charcoal-900/10 last:border-0">
                  <td className="py-2 pr-4">
                    {g.name}
                    <span className="block text-xs text-charcoal-800/60">{g.phone}</span>
                  </td>
                  <td className="py-2 pr-4">{g.registeredAt}</td>
                  <td className="py-2 pr-4">{g.dropoffStep}</td>
                  <td className="py-2">{g.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
