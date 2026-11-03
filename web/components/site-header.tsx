import Link from "next/link";
import { SettingsSelectors } from "@/components/settings-selectors";
import { BrandMark } from "@/components/brand-mark";

export function SiteHeader() {
  return (
    <header className="bg-charcoal-900 text-cream sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6 min-h-[4rem] py-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <Link href="/">
          <BrandMark />
        </Link>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <nav className="flex gap-5 text-sm">
            <Link href="/catalogo" className="text-cream/80 hover:text-cream">
              Catálogo
            </Link>
            <Link href="/crm" className="text-cream/80 hover:text-cream">
              CRM
            </Link>
            <Link href="/owner" className="text-cream/80 hover:text-cream">
              Dueño
            </Link>
            <Link href="/owner/trends" className="text-cream/80 hover:text-cream">
              Tendencias
            </Link>
            <Link href="/identidad" className="text-cream/80 hover:text-cream">
              Identidad
            </Link>
          </nav>
          <SettingsSelectors />
        </div>
      </div>
    </header>
  );
}
