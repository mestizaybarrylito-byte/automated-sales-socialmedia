/**
 * Central app config — public constants safe for the browser bundle.
 *
 * WHATSAPP_NUMBER is the display form (+52 999 354 0057, Mérida MX).
 * WHATSAPP_WA_NUMBER is the digits-only form used in wa.me/ deep links.
 */

export const WHATSAPP_NUMBER = "+52 999 354 0057";

/** Digits-only form for wa.me/ links (country code + number, no +, spaces, or dashes). */
export const WHATSAPP_WA_NUMBER = "529993540057";

/**
 * Build a wa.me deep link with prefilled Spanish order text.
 * Example: https://wa.me/529993540057?text=Hola%20...
 */
export function waOrderLink(message: string): string {
  return `https://wa.me/${WHATSAPP_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Prefilled order message for a single product (name shown without placeholder prefix). */
export function productOrderMessage(productName: string, priceMXN: number): string {
  const clean = productName.replace(/^\[PLACEHOLDER\]\s*/, "");
  return `Hola Casa de Brasas, quiero pedir: ${clean} ($${priceMXN} MXN, precio por confirmar). ¿Me ayudas con mi pedido del lote semanal?`;
}

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}
