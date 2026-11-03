import data from "@/data/products.json";

export interface Product {
  slug: string;
  name: string;
  /** Placeholder MXN price — NOT a real price. Confirmed per batch with the supplier. */
  priceMXN: number;
  pricePlaceholder: true;
  description: string;
  image: string;
  category: "corte" | "salsa" | "paquete";
}

export const products = data as Product[];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
