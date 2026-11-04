"use client";

import { cn } from "@/lib/utils";

/**
 * Style thumbnail card matching meta.ai/create's "Valores predefinidos"
 * gallery: full-bleed art with the style name overlaid on a bottom
 * gradient. Shared by the wizard step-3 strip, the identidad curation
 * strip and the style drawer so the three always agree.
 */
export function StyleThumbImage({
  url,
  name,
  className,
}: {
  url: string;
  name: string;
  className?: string;
}) {
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <img src={url} alt={name} className="w-full block" loading="lazy" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal-950/85 via-charcoal-950/30 to-transparent px-2.5 pb-2 pt-9"
      />
      <span className="absolute inset-x-0 bottom-0 px-2.5 pb-2 font-sans text-[13px] font-medium leading-tight text-cream">
        {name}
      </span>
    </span>
  );
}

/** Loading skeleton with the same footprint as the thumbnail card. */
export function StyleThumbSkeleton({ name }: { name: string }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block h-28 animate-pulse bg-charcoal-900/10" />
      <span className="absolute inset-x-0 bottom-0 px-2.5 pb-2 font-sans text-xs text-charcoal-800/50">
        {name}
      </span>
    </span>
  );
}
