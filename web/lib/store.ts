/**
 * Mock data layer — customers, products, sales (Step 4 prototype).
 *
 * ---------------------------------------------------------------------------
 * SUPABASE SEAM (how this gets replaced with the real backend):
 * - Every entity below maps 1:1 to a table in /supabase/migrations/*.sql
 *   (customers, products, sales, transactions).
 * - The `Store` interface is the seam: swap `localStore` for a Supabase-backed
 *   implementation calling the tables via @supabase/supabase-js (client) or
 *   Edge Functions (server, service-role key), keeping the same method names.
 * - RLS policies in the migrations already scope each table; the client must
 *   only ever use NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   (see lib/supabase-client.ts when it lands). Service-role key stays in
 *   Edge Functions, never in this file or any client bundle.
 * - Clip-link status lives on Sale.clipStatus and mirrors the transactions
 *   table ledger (payment-fulfillment skill: link generated -> confirmed ->
 *   fulfilled; never fulfill on unconfirmed payment).
 * ---------------------------------------------------------------------------
 *
 * Storage: in-memory seed + localStorage persistence (key below), so CRM
 * add/update works in the static prototype with zero backend. Guarded for SSR.
 */

import seedProducts from "@/data/products.json";

export type ClipStatus =
  | "sin_link" // cart finalized, no Clip link yet
  | "link_generado" // dynamic Clip payment link issued
  | "pagado" // Clip confirmation webhook received
  | "surtido"; // fulfillment dispatched (only after pagado)

export interface Customer {
  id: string;
  name: string;
  phone: string; // E.164-ish, e.g. +52 999 000 0000
  email?: string;
  notes?: string;
  createdAt: string; // ISO date
}

export interface StoreProduct {
  slug: string;
  name: string;
  priceMXN: number;
  /** Always true in the prototype: prices are placeholders confirmed per batch. */
  pricePlaceholder: boolean;
  description: string;
  image: string;
  category: "corte" | "salsa" | "paquete";
  active: boolean;
}

export interface Sale {
  id: string;
  customerId: string;
  items: { slug: string; qty: number; unitPriceMXN: number }[];
  totalMXN: number;
  channel: "web" | "whatsapp";
  clipStatus: ClipStatus;
  clipLink?: string;
  createdAt: string;
}

export interface Store {
  listCustomers(): Customer[];
  saveCustomer(c: Customer): void;
  listProducts(): StoreProduct[];
  saveProduct(p: StoreProduct): void;
  listSales(): Sale[];
  saveSale(s: Sale): void;
  reset(): void;
}

const STORAGE_KEY = "casa-de-brasas-store-v1";

/** Shown when a CRM product has no image of its own. */
export const FALLBACK_PRODUCT_IMAGE = "/images/hero.jpg";

/** Only active products reach the online catalog and the campaign wizard. */
export function activeProducts(items: StoreProduct[]): StoreProduct[] {
  return items.filter((p) => p.active);
}

/** Product image with hero fallback for CRM rows without one. */
export function productImage(p: Pick<StoreProduct, "image">): string {
  return p.image || FALLBACK_PRODUCT_IMAGE;
}

const seedCustomers: Customer[] = [
  {
    id: "cli-001",
    name: "María Fernanda López",
    phone: "+52 999 111 2233",
    email: "marifer@example.mx",
    notes: "Clienta frecuente, prefiere entrega jueves por la mañana.",
    createdAt: "2026-10-01",
  },
  {
    id: "cli-002",
    name: "Carlos Hernández",
    phone: "+52 999 444 5566",
    notes: "Pedido vía WhatsApp, paquete familiar.",
    createdAt: "2026-10-15",
  },
];

const seedSales: Sale[] = [
  {
    id: "vta-001",
    customerId: "cli-001",
    items: [{ slug: "ribeye-al-carbon", qty: 2, unitPriceMXN: 499 }],
    totalMXN: 998,
    channel: "whatsapp",
    clipStatus: "pagado",
    clipLink: "https://clip.mx/demo-link-vta-001",
    createdAt: "2026-10-20",
  },
  {
    id: "vta-002",
    customerId: "cli-002",
    items: [{ slug: "paquete-asado-familiar", qty: 1, unitPriceMXN: 999 }],
    totalMXN: 999,
    channel: "web",
    clipStatus: "link_generado",
    clipLink: "https://clip.mx/demo-link-vta-002",
    createdAt: "2026-10-28",
  },
];

function seedState(): { customers: Customer[]; products: StoreProduct[]; sales: Sale[] } {
  return {
    customers: seedCustomers,
    products: (seedProducts as Omit<StoreProduct, "active" | "pricePlaceholder">[]).map((p) => ({
      ...p,
      pricePlaceholder: true,
      active: true,
    })),
    sales: seedSales,
  };
}

interface State {
  customers: Customer[];
  products: StoreProduct[];
  sales: Sale[];
}

function load(): State {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    /* fall through to seed */
  }
  return seedState();
}

function persist(s: State): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage full/blocked: prototype keeps in-memory copy */
  }
}

let mem: State | null = null;
function state(): State {
  if (!mem) mem = load();
  return mem;
}

if (typeof window !== "undefined") {
  // Another tab edited the CRM: drop the snapshot so the next read is fresh.
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) mem = null;
  });
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
}

export const CLIP_STATUS_LABEL: Record<ClipStatus, string> = {
  sin_link: "Sin link Clip",
  link_generado: "Link Clip generado",
  pagado: "Pagado (confirmado)",
  surtido: "Surtido",
};

/** Local (mock) implementation of the Store seam. */
export const localStore: Store = {
  listCustomers: () => [...state().customers],
  saveCustomer(c) {
    const s = state();
    const i = s.customers.findIndex((x) => x.id === c.id);
    if (i >= 0) s.customers[i] = c;
    else s.customers.push(c);
    persist(s);
  },
  listProducts: () => [...state().products],
  saveProduct(p) {
    const s = state();
    const i = s.products.findIndex((x) => x.slug === p.slug);
    if (i >= 0) s.products[i] = p;
    else s.products.push(p);
    persist(s);
  },
  listSales: () => [...state().sales],
  saveSale(sale) {
    const s = state();
    const i = s.sales.findIndex((x) => x.id === sale.id);
    if (i >= 0) s.sales[i] = sale;
    else s.sales.push(sale);
    persist(s);
  },
  reset() {
    mem = seedState();
    persist(mem);
  },
};
