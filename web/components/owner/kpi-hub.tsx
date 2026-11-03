"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { localStore } from "@/lib/store";
import { formatMXN } from "@/lib/config";
import { targets, weeklySeries, yoySeries } from "@/lib/owner-kpis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RUST = "#9A5F3B";
const CHARCOAL = "#232527";
const EMBER = "#C2410C";
const SAND = "#D4AE8E";
const SLATE = "#7E8288";

function Freshness({ label }: { label: string }) {
  const [at, setAt] = useState<string | null>(null);
  useEffect(() => {
    setAt(new Date().toLocaleString("es-MX"));
  }, []);
  return (
    <p className="text-xs text-charcoal-800/60 mt-1">
      {label} · Actualizado: {at ?? "…"} · <strong>Todas las cifras son DEMO</strong>
    </p>
  );
}

interface Stat {
  label: string;
  value: string;
  owner: string;
  hint: string;
}

function StatTile({ stat }: { stat: Stat }) {
  return (
    <div className="rounded-md border border-charcoal-900/15 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-charcoal-800/70">{stat.label}</p>
        <Badge variant="secondary">DEMO</Badge>
      </div>
      <p className="font-serif text-2xl mt-1">{stat.value}</p>
      <p className="text-xs text-charcoal-800/60 mt-1">
        Dueño: {stat.owner} · {stat.hint}
      </p>
    </div>
  );
}

type YoYRange = "6m" | "12m";

export function KpiHub() {
  const [range, setRange] = useState<YoYRange>("12m");
  const [storeStats, setStoreStats] = useState<{
    clipRevenue: number;
    aov: number;
    sales: number;
    buyers: number;
  } | null>(null);

  useEffect(() => {
    const sales = localStore.listSales();
    const paid = sales.filter((s) => s.clipStatus === "pagado" || s.clipStatus === "surtido");
    const clipRevenue = paid.reduce((sum, s) => sum + s.totalMXN, 0);
    const aov = sales.length > 0 ? Math.round(sales.reduce((sum, s) => sum + s.totalMXN, 0) / sales.length) : 0;
    setStoreStats({
      clipRevenue,
      aov,
      sales: sales.length,
      buyers: new Set(sales.map((s) => s.customerId)).size,
    });
  }, []);

  const latest = weeklySeries[weeklySeries.length - 1];
  const yoy = range === "6m" ? yoySeries.slice(4, 10) : yoySeries;

  const cgmo: Stat[] = [
    { label: "CAC", value: formatMXN(latest.cac), owner: "CGMO", hint: `meta ≤ ${formatMXN(targets.cacMax)}` },
    { label: "MQL", value: String(latest.mql), owner: "CGMO", hint: "leads calificados/sem" },
    { label: "RoAS", value: `${latest.roas.toFixed(1)}x`, owner: "CGMO", hint: `meta ≥ ${targets.roasMin.toFixed(1)}x` },
  ];
  const cro: Stat[] = [
    { label: "Conversión tienda", value: "3.4%", owner: "CRO", hint: `meta ≥ ${targets.conversionMin.toFixed(1)}%` },
    {
      label: "Ticket promedio",
      value: storeStats ? formatMXN(storeStats.aov) : "…",
      owner: "CRO",
      hint: "derivado de la tienda mock",
    },
    { label: "Abandono carrito", value: `${latest.abandonment}%`, owner: "CRO", hint: `meta ≤ ${targets.abandonmentMax}%` },
    {
      label: "Ingresos vía Clip",
      value: storeStats ? formatMXN(storeStats.clipRevenue) : "…",
      owner: "CRO",
      hint: `tienda mock · ${storeStats?.sales ?? "…"} ventas`,
    },
  ];
  const log: Stat[] = [
    { label: "Turnaround última milla", value: `${latest.turnaround.toFixed(1)} días`, owner: "LOG-SD", hint: `meta ≤ ${targets.turnaroundMax.toFixed(1)} días` },
    { label: "Costo envío / pedido", value: formatMXN(latest.shippingCost), owner: "LOG-SD", hint: "MXN por pedido" },
    { label: "OTIF", value: `${latest.otif}%`, owner: "LOG-SD", hint: `meta ≥ ${targets.otifMin}%` },
  ];

  return (
    <section aria-label="Resumen ejecutivo de KPIs">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-2xl">Resumen ejecutivo</h2>
        <Badge>DEMO · cifras simuladas</Badge>
      </div>
      <Freshness label="Paneles CGMO / CRO / LOG-SD" />

      <h3 className="font-sans font-semibold text-sm mt-6 mb-2">CGMO — adquisición</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {cgmo.map((s) => <StatTile key={s.label} stat={s} />)}
      </div>

      <h3 className="font-sans font-semibold text-sm mt-6 mb-2">CRO — tienda y Clip</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cro.map((s) => <StatTile key={s.label} stat={s} />)}
      </div>

      <h3 className="font-sans font-semibold text-sm mt-6 mb-2">LOG-SD — entrega</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {log.map((s) => <StatTile key={s.label} stat={s} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-xl">Comparativo YoY — ingresos vía Clip</CardTitle>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRange("6m")}
                  className={`text-sm px-3 py-1 rounded-md border ${range === "6m" ? "bg-charcoal-800 text-cream border-charcoal-800" : "border-charcoal-900/25"}`}
                >
                  6 meses
                </button>
                <button
                  type="button"
                  onClick={() => setRange("12m")}
                  className={`text-sm px-3 py-1 rounded-md border ${range === "12m" ? "bg-charcoal-800 text-cream border-charcoal-800" : "border-charcoal-900/25"}`}
                >
                  12 meses
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={yoy} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e4e6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v / 1000}k`} />
                <Tooltip formatter={(v) => [formatMXN(Number(v)), ""]} />
                <Legend />
                <Line type="monotone" dataKey="current" name="Año actual (DEMO)" stroke={RUST} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="prior" name="Año previo (DEMO)" stroke={SLATE} strokeWidth={2} strokeDasharray="5 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Marketing semanal — MQL, CAC, RoAS</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={weeklySeries} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e4e6" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="mql" name="MQL (DEMO)" fill={SAND} />
                <Line yAxisId="left" type="monotone" dataKey="cac" name="CAC MXN (DEMO)" stroke={EMBER} strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="roas" name="RoAS x (DEMO)" stroke={CHARCOAL} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Ingresos Clip + abandono, por semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={weeklySeries} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e4e6" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip formatter={(v) => [String(v), ""]} />
                <Legend />
                <Bar yAxisId="left" dataKey="clipRevenue" name="Ingresos Clip MXN (DEMO)" fill={RUST} />
                <Line yAxisId="right" type="monotone" dataKey="abandonment" name="Abandono % (DEMO)" stroke={EMBER} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Logística semanal — OTIF, turnaround, costo de envío</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={weeklySeries} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e4e6" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${v}%`} domain={[80, 100]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="otif" name="OTIF % (DEMO)" stroke={RUST} strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="turnaround" name="Turnaround días (DEMO)" stroke={CHARCOAL} strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="shippingCost" name="Costo envío MXN (DEMO)" stroke={SLATE} strokeWidth={2} strokeDasharray="5 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
