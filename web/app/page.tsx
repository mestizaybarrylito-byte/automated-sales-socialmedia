import Link from "next/link";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div>
      {/* Hero: high-contrast food photography style, charcoal overlay, serif headline */}
      <section className="photo-frame min-h-[420px] flex items-end">
        <img
          src="/images/hero.jpg"
          alt="Corte artesanal al carbón, fotografía de alto contraste (imagen placeholder)"
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-14 pt-28 w-full">
          <p className="text-rust-200 text-sm tracking-wide mb-3">
            Cortes artesanales · Salsas caseras · 100% digital
          </p>
          <h1 className="text-cream text-4xl md:text-6xl leading-tight max-w-2xl">
            Fuego lento, sabor de familia
          </h1>
          <p className="text-cream/85 mt-4 max-w-xl">
            Pedidos por lote semanal con entrega en jueves. Sin inventario
            almacenado: tu pedido se consolida y se surte fresco con el proveedor.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="#catalogo">Ver catálogo</Link>
            </Button>
            <Button variant="outline" className="border-cream/40 text-cream hover:bg-cream/10" asChild>
              <Link href="/identidad">Nuestra identidad</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalogo" className="max-w-5xl mx-auto px-6 py-14">
        <div className="flex items-baseline justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl">Catálogo demo</h2>
            <p className="text-charcoal-800/70 mt-1">
              Precios en MXN marcados como placeholder — se confirman con el proveedor por lote.
            </p>
          </div>
          <Link href="/identidad" className="text-rust-700 underline underline-offset-4 shrink-0">
            Guía de marca
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Batch rules strip */}
      <section className="bg-charcoal-900 text-cream">
        <div className="max-w-5xl mx-auto px-6 py-10 grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-xl text-rust-200">Corte semanal</h3>
            <p className="text-cream/75 mt-1 text-sm">
              Los pedidos cierran y se consolidan cada jueves.
            </p>
          </div>
          <div>
            <h3 className="text-xl text-rust-200">Umbral de lote</h3>
            <p className="text-cream/75 mt-1 text-sm">
              Cada $3,500 MXN acumulados dispara la compra al proveedor.
            </p>
          </div>
          <div>
            <h3 className="text-xl text-rust-200">Entrega fresca</h3>
            <p className="text-cream/75 mt-1 text-sm">
              Jueves 7:00–8:00 PM · a domicilio, courier regional o punto de encuentro.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
