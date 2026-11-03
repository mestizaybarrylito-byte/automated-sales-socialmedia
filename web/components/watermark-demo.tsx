"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/components/brand-theme-provider";

type Format = "reel" | "carousel";

/**
 * Live demonstration of the watermark-logo upper-right rule:
 * short-form video mock (9:16) and carousel end-slide mock (1:1),
 * both carrying the watermark in the upper-right corner.
 */
export function WatermarkDemo() {
  const [format, setFormat] = useState<Format>("reel");
  const { brand } = useBrand();

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-lg">Demo en vivo del watermark</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={format === "reel" ? "default" : "outline"}
              onClick={() => setFormat("reel")}
            >
              Reel 9:16
            </Button>
            <Button
              size="sm"
              variant={format === "reel" ? "outline" : "default"}
              onClick={() => setFormat("carousel")}
            >
              Slide final 1:1
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div
            className={`photo-frame rounded-md ${format === "reel" ? "w-56 aspect-[9/16]" : "w-full max-w-md aspect-square"}`}
            role="img"
            aria-label={
              format === "reel"
                ? "Mock de video corto con watermark en la esquina superior derecha"
                : "Mock de slide final de carrusel con watermark en la esquina superior derecha"
            }
          >
            <img src="/images/hero.jpg" alt="" aria-hidden="true" />
            {/* Watermark: always upper-right */}
            {brand.logoDataUrl ? (
              <img
                src={brand.logoDataUrl}
                alt="Logotipo de marca como watermark"
                className="brand-watermark absolute top-3 right-3 z-10 h-9 w-auto max-w-[9rem] object-contain rounded-sm bg-[#f7f2ea]/95 px-1.5 py-0.5 border border-black/25"
              />
            ) : (
              <span className="absolute top-3 right-3 z-10 rounded-sm bg-charcoal-950/70 px-2 py-1 font-serif text-xs tracking-tight text-cream border border-cream/25">
                {brand.companyName}
              </span>
            )}
            <div className="absolute bottom-0 inset-x-0 z-10 p-4">
              <p className="font-serif text-cream text-lg leading-snug">
                {format === "reel" ? "Sellado perfecto en 60 segundos" : "Lote del jueves · pide antes del corte"}
              </p>
              <p className="font-sans text-cream/70 text-xs mt-1">
                Watermark arriba a la derecha — siempre visible, nunca centrado.
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm text-charcoal-800/70 mt-4 max-w-2xl">
          Regla: el watermark va fijo en la esquina superior derecha, con fondo
          semitransparente para legibilidad sobre foto. No se mueve, no se
          oculta, no compite con el titular.
        </p>
      </CardContent>
    </Card>
  );
}
