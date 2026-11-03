/**
 * Owner Dashboard demo data (Step 5 prototype).
 *
 * Every figure here is SIMULATED and must be rendered with a DEMO badge.
 * Live derivations from the mock store (Clip revenue, AOV, buyer counts)
 * happen in the components via `localStore`; the weekly series below stand
 * in for the Supabase queries the dashboard-visualization skill defines
 * (replaced by real endpoints when the backend lands).
 */

export interface WeekPoint {
  week: string;
  cac: number; // MXN
  mql: number; // count
  roas: number; // x
  clipRevenue: number; // MXN
  abandonment: number; // %
  turnaround: number; // days
  shippingCost: number; // MXN per order
  otif: number; // %
}

export const weeklySeries: WeekPoint[] = [
  { week: "S40", cac: 96, mql: 118, roas: 2.1, clipRevenue: 8450, abandonment: 68, turnaround: 3.4, shippingCost: 89, otif: 91 },
  { week: "S41", cac: 91, mql: 132, roas: 2.3, clipRevenue: 9200, abandonment: 66, turnaround: 3.1, shippingCost: 86, otif: 93 },
  { week: "S42", cac: 88, mql: 141, roas: 2.5, clipRevenue: 10150, abandonment: 64, turnaround: 2.9, shippingCost: 84, otif: 94 },
  { week: "S43", cac: 84, mql: 156, roas: 2.7, clipRevenue: 11300, abandonment: 61, turnaround: 2.7, shippingCost: 82, otif: 95 },
];

export interface YoYPoint {
  month: string;
  current: number; // MXN revenue via Clip, demo year
  prior: number; // MXN revenue via Clip, prior year
}

export const yoySeries: YoYPoint[] = [
  { month: "Ene", current: 18400, prior: 12200 },
  { month: "Feb", current: 19800, prior: 13100 },
  { month: "Mar", current: 21300, prior: 13900 },
  { month: "Abr", current: 22700, prior: 14800 },
  { month: "May", current: 24100, prior: 15600 },
  { month: "Jun", current: 22900, prior: 15100 },
  { month: "Jul", current: 25600, prior: 16400 },
  { month: "Ago", current: 26800, prior: 17200 },
  { month: "Sep", current: 28400, prior: 18100 },
  { month: "Oct", current: 30100, prior: 19300 },
  { month: "Nov", current: 0, prior: 21500 },
  { month: "Dic", current: 0, prior: 24800 },
];

export interface GhostLead {
  id: string;
  name: string;
  phone: string;
  registeredAt: string;
  dropoffStep: string;
  lastActivity: string;
}

/** Registered users with zero purchases — DEMO rows. */
export const ghostLeads: GhostLead[] = [
  {
    id: "ghost-001",
    name: "Lucía Ramírez",
    phone: "+52 999 222 8899",
    registeredAt: "2026-09-28",
    dropoffStep: "Catálogo → sin pedido por WhatsApp",
    lastActivity: "Vio el catálogo el 2026-10-02",
  },
  {
    id: "ghost-002",
    name: "Diego Torres",
    phone: "+52 999 333 7711",
    registeredAt: "2026-10-05",
    dropoffStep: "Pedido armado → sin pagar link Clip",
    lastActivity: "Pidió link Clip el 2026-10-09, sin pago",
  },
  {
    id: "ghost-003",
    name: "Ana Sofía Vega",
    phone: "+52 999 555 0142",
    registeredAt: "2026-10-12",
    dropoffStep: "Carrito web → abandonado",
    lastActivity: "Abandonó carrito el 2026-10-14",
  },
  {
    id: "ghost-004",
    name: "Jorge Méndez",
    phone: "+52 999 777 9021",
    registeredAt: "2026-10-19",
    dropoffStep: "WhatsApp hola → sin elegir productos",
    lastActivity: "Último mensaje el 2026-10-21",
  },
];

export interface DeliveryZone {
  zone: string;
  activeBuyers: number;
  ghostLeads: number;
  otif: number; // % demo
}

/** Text fallback behind the map stub — DEMO rows. */
export const deliveryZones: DeliveryZone[] = [
  { zone: "Centro", activeBuyers: 14, ghostLeads: 6, otif: 96 },
  { zone: "Norte", activeBuyers: 9, ghostLeads: 11, otif: 91 },
  { zone: "Sur", activeBuyers: 6, ghostLeads: 4, otif: 89 },
  { zone: "Punto de encuentro (jueves)", activeBuyers: 11, ghostLeads: 3, otif: 99 },
];

/** Targets the Owner judges against (demo). */
export const targets = {
  cacMax: 90, // MXN
  roasMin: 2.5, // x
  conversionMin: 3.0, // %
  abandonmentMax: 60, // %
  turnaroundMax: 3.0, // days
  otifMin: 95, // %
};
