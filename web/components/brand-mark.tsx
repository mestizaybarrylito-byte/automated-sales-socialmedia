"use client";

import { useBrand } from "@/components/brand-theme-provider";

/** Header brand mark: uploaded logo (on a light chip for legibility) + name. */
export function BrandMark() {
  const { brand } = useBrand();
  return (
    <span className="flex items-center gap-2.5">
      {brand.logoDataUrl ? (
        <img
          src={brand.logoDataUrl}
          alt="Logotipo de la marca"
          className="h-9 w-auto max-w-[9rem] object-contain rounded-[4px] bg-white/95 px-1.5 py-0.5"
        />
      ) : null}
      <span className="font-serif text-xl tracking-tight">{brand.companyName}</span>
    </span>
  );
}

/** Company name for server-rendered surfaces (footer) via client context. */
export function BrandCompanyName({ suffix = "" }: { suffix?: string }) {
  const { brand } = useBrand();
  return (
    <>
      {brand.companyName}
      {suffix}
    </>
  );
}
