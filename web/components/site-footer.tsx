import { BrandCompanyName } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="bg-charcoal-900 text-cream/70 mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 text-sm flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
        <p className="font-serif text-cream text-base">
          <BrandCompanyName suffix=" — prototipo $0" />
        </p>
        <p>
          Lote semanal · corte jueves · entrega jueves 7:00–8:00 PM · Pago via Clip
          (payment links)
        </p>
      </div>
    </footer>
  );
}
