/**
 * WhatsApp Cloud API catalog payloads (Step 4 prototype).
 *
 * Builds catalog-item payloads from web/data/products.json so the same
 * source of truth feeds the storefront AND the WhatsApp catalog sync.
 *
 * ---------------------------------------------------------------------------
 * SETUP NOTES (to go live — IT whatsapp-integration skill):
 * 1. Create a Meta Commerce catalog in Commerce Manager; note CATALOG_ID.
 * 2. Create a Meta app with the WhatsApp product; add a test number or go
 *    live; get WHATSAPP_CLOUD_API_TOKEN (permanent system-user token) and
 *    WHATSAPP_PHONE_NUMBER_ID. Server-side only — never NEXT_PUBLIC_.
 * 3. Upload each item via: POST https://graph.facebook.com/v21.0/{CATALOG_ID}/items
 *    with the JSON from buildCatalogItemPayload(). Batch endpoint supports
 *    up to ~5k items per call.
 * 4. Subscribe the webhook (verify token handshake) and validate every
 *    inbound signature (X-Hub-Signature-256) in the Edge Function receiver.
 * 5. Sync on schedule + on LOG-SD availability alerts; honor the 24h
 *    customer-service window (approved templates outside it) and opt-outs.
 * ---------------------------------------------------------------------------
 *
 * Sending is STUBBED behind WHATSAPP_CATALOG_SEND_ENABLED=true. With any
 * other value (or unset), sendCatalogPayloads() only logs/previews payloads
 * and never touches the network — safe default for the prototype.
 */

import products from "@/data/products.json";

export interface CatalogItemPayload {
  retailer_id: string;
  name: string;
  description: string;
  price: string; // minor units as string, e.g. "49900" = $499.00 MXN
  currency: string; // ISO 4217
  availability: "in stock" | "out of stock";
  image_url: string;
  category?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://casa-de-brasas.example.mx";

/** Strip the [PLACEHOLDER] prefix for customer-facing catalog text. */
export function displayName(name: string): string {
  return name.replace(/^\[PLACEHOLDER\]\s*/, "");
}

export function buildCatalogItemPayload(p: {
  slug: string;
  name: string;
  priceMXN: number;
  description: string;
  image: string;
  category: string;
}): CatalogItemPayload {
  return {
    retailer_id: p.slug,
    name: displayName(p.name),
    description: displayName(p.description),
    price: String(Math.round(p.priceMXN * 100)),
    currency: "MXN",
    availability: "in stock",
    image_url: `${BASE_URL}${p.image}`,
    category: p.category,
  };
}

/** Build one payload per product in products.json. */
export function buildAllCatalogPayloads(): CatalogItemPayload[] {
  return (products as Parameters<typeof buildCatalogItemPayload>[0][]).map(buildCatalogItemPayload);
}

/** True only when the operator explicitly enables live sending. */
export function isCatalogSendEnabled(): boolean {
  return process.env.WHATSAPP_CATALOG_SEND_ENABLED === "true";
}

export interface SendResult {
  sent: boolean;
  count: number;
  note: string;
}

/**
 * Stub sender: previews payloads to the console. Performs the real Graph API
 * POST only when WHATSAPP_CATALOG_SEND_ENABLED=true AND credentials exist.
 */
export async function sendCatalogPayloads(
  items: CatalogItemPayload[],
  opts?: { catalogId?: string; token?: string }
): Promise<SendResult> {
  const catalogId = opts?.catalogId ?? process.env.WHATSAPP_CATALOG_ID;
  const token = opts?.token ?? process.env.WHATSAPP_CLOUD_API_TOKEN;

  if (!isCatalogSendEnabled() || !catalogId || !token) {
    console.log(
      `[whatsapp-catalog] PREVIEW ONLY (${items.length} items, send disabled or credentials missing):`
    );
    for (const it of items) console.log(JSON.stringify(it));
    return {
      sent: false,
      count: items.length,
      note: "Previewed only: set WHATSAPP_CATALOG_SEND_ENABLED=true + WHATSAPP_CATALOG_ID + WHATSAPP_CLOUD_API_TOKEN to send.",
    };
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${catalogId}/items/batch`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ item_requests: items.map((item) => ({ method: "CREATE", item })) }),
  });
  if (!res.ok) throw new Error(`Catalog batch sync failed: ${res.status} ${await res.text()}`);
  return { sent: true, count: items.length, note: `Synced ${items.length} items to catalog ${catalogId}.` };
}
