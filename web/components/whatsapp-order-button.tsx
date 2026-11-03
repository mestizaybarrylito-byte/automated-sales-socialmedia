"use client";

import { useBrand } from "@/components/brand-theme-provider";
import { Button } from "@/components/ui/button";
import { productOrderMessage, waOrderLink } from "@/lib/config";

/** Catalog order button: the WhatsApp message carries the active brand name. */
export function WhatsappOrderButton({
  productName,
  priceMXN,
}: {
  productName: string;
  priceMXN: number;
}) {
  const { brand } = useBrand();
  return (
    <Button asChild className="w-full">
      <a
        href={waOrderLink(productOrderMessage(productName, priceMXN, brand.companyName))}
        target="_blank"
        rel="noopener noreferrer"
      >
        Pedir por WhatsApp
      </a>
    </Button>
  );
}
