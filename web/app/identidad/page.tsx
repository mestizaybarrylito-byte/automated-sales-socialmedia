import type { Metadata } from "next";
import { WatermarkDemo } from "@/components/watermark-demo";
import { BrandManager } from "@/components/brand-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Identidad corporativa — Casa de Brasas",
  description:
    "Guía viva de identidad: paleta rust/charcoal, tipografía serif/sans, regla de watermark y proporción 80/20 core-vs-tendencia.",
};

const palette = [
  { name: "Rust 600", hex: "#9A5F3B", role: "Primario — acentos, CTAs, enlaces", dark: false },
  { name: "Rust 900", hex: "#563526", role: "Profundidad — titulares sobre claro", dark: true },
  { name: "Charcoal 900", hex: "#1A1C1E", role: "Base — texto, fondos oscuros", dark: true },
  { name: "Charcoal 800", hex: "#232527", role: "Superficie — franjas, overlays foto", dark: true },
  { name: "Cream", hex: "#F7F2EA", role: "Fondo cálido — páginas y tarjetas", dark: false },
  { name: "Ember", hex: "#C2410C", role: "Uso escaso — alertas de lote, sellos", dark: false },
];

const coreVsTrend = [
  { label: "80% Core — cocina de calidad, familia y parrilla, sabor premium", width: "80%", core: true },
  { label: "20% Tendencia — memes y audios virales adaptados sin perder lo premium", width: "20%", core: false },
];

export default function IdentidadPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Badge>Brand_Design_Guidelines · guía viva</Badge>
      <h1 className="text-4xl md:text-5xl mt-4">Identidad corporativa</h1>
      <p className="text-charcoal-800/75 mt-3 max-w-2xl">
        Esta página <em>es</em> la guía aplicada: cada sección demuestra la regla que
        documenta. Administra el logotipo y los colores en el módulo interactivo;
        el resto documenta la guía base rust/charcoal con fotografía gastronómica
        de alto contraste, serif rústica en titulares y sans limpia en cuerpo.
      </p>

      {/* 0. Interactive brand manager: logo, palette, theme */}
      <section aria-label="Administración de logo y colores">
        <h2 className="text-3xl mt-12">0 · Marca: logo, nombre, colores y tipografía</h2>
        <BrandManager />
      </section>

      {/* 1. Palette */}
      <section className="mt-12">
        <h2 className="text-3xl">1 · Paleta rust / charcoal</h2>
        <p className="text-charcoal-800/75 mt-2 max-w-2xl">
          Colores dominantes cálidos y artesanales. Prohibidos los sintéticos y
          neones: nada de púrpuras eléctricos, degradados neón ni acentos fríos.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {palette.map((c) => (
            <Card key={c.hex}>
              <div
                className="h-24 rounded-t-md border-b border-charcoal-900/10"
                style={{ backgroundColor: c.hex }}
                aria-label={`Muestra de color ${c.name} ${c.hex}`}
              />
              <CardHeader>
                <CardTitle className="text-lg">
                  {c.name} <span className="font-sans text-sm font-normal text-charcoal-800/60">{c.hex}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-charcoal-800/75">{c.role}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. Typography */}
      <section className="mt-12">
        <h2 className="text-3xl">2 · Tipografía</h2>
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Serif rústica — titulares</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-3xl leading-snug">Fuego lento, sabor de familia</p>
              <p className="font-serif text-lg mt-2 text-charcoal-800/70">
                Georgia / Times — cálida, artesanal, editorial.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Sans limpia — cuerpo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-sans">
                Pedidos por lote semanal con entrega en jueves. Texto funcional,
                legible y sin adornos para precios, descripciones y logística.
              </p>
              <p className="font-sans text-sm mt-2 text-charcoal-800/70">
                System sans stack — rápida, neutral, accesible.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Photography */}
      <section className="mt-12">
        <h2 className="text-3xl">3 · Fotografía gastronómica</h2>
        <p className="text-charcoal-800/75 mt-2 max-w-2xl">
          Alto contraste, brasas y textura real. Overlay charcoal para legibilidad;
          nunca filtros neón ni fondos sintéticos.
        </p>
        <div className="photo-frame rounded-md min-h-[260px] flex items-end mt-6">
          <img
            src="/images/hero.jpg"
            alt="Fotografía hero de alto contraste (imagen placeholder)"
          />
          <p className="relative z-10 px-6 pb-5 text-cream font-serif text-2xl">
            Así se ve un hero de marca: foto + overlay charcoal + serif crema.
          </p>
        </div>
      </section>

      {/* 4. Watermark rule */}
      <section className="mt-12">
        <h2 className="text-3xl">4 · Regla de watermark</h2>
        <p className="text-charcoal-800/75 mt-2 max-w-2xl">
          El logo-watermark <strong>siempre</strong> aparece en la{" "}
          <strong>esquina superior derecha</strong> de los videos cortos y del
          slide final de los carruseles. Demostración en vivo:
        </p>
        <WatermarkDemo />
      </section>

      {/* 5. 80/20 */}
      <section className="mt-12">
        <h2 className="text-3xl">5 · Proporción 80/20 core-vs-tendencia</h2>
        <p className="text-charcoal-800/75 mt-2 max-w-2xl">
          El 80% del contenido es core evergreen (cocina de calidad, tradiciones
          familiares/parrilleras, sabor premium). Solo el 20% adapta tendencias —
          y cada adaptación debe regresar al core según la Trend_Adaptation_Rule.
          Nunca sacrificar percepción premium por viralidad barata.
        </p>
        <div
          className="mt-6 rounded-md overflow-hidden border border-charcoal-900/15 flex"
          role="img"
          aria-label="Barra 80/20: 80 por ciento core, 20 por ciento tendencia"
        >
          {coreVsTrend.map((s) => (
            <div
              key={s.label}
              style={{ width: s.width }}
              className={s.core ? "bg-rust-700 text-on-primary" : "bg-charcoal-800 text-on-surface"}
            >
              <p className={`p-4 text-sm ${s.core ? "" : "hidden md:block"}`}>{s.label}</p>
              <p className={`p-4 text-sm md:hidden ${s.core ? "hidden" : ""}`}>20% Tendencia</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">80% Core — ejemplos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-charcoal-800/80 space-y-1">
              <p>· El corte perfecto para el asado del domingo</p>
              <p>· Salsa casera de la abuela, lote fresco semanal</p>
              <p>· Cómo sellar un ribeye al carbón paso a paso</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">20% Tendencia — con regreso al core</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-charcoal-800/80 space-y-1">
              <p>· Audio viral + “así suena un buen sellado”</p>
              <p>· Meme de quincena + “invierte en un buen corte”</p>
              <p>· Trend de unboxing + desempaque del lote del jueves</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
