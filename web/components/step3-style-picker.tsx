"use client";

import { useEffect, useState } from "react";
import { useBrand } from "@/components/brand-theme-provider";
import { Button } from "@/components/ui/button";
import { StyleDrawer, type DrawerThumb } from "@/components/owner/style-drawer";
import { StyleThumbImage } from "@/components/owner/style-thumb-card";
import { loadArtImage, renderArtCanvas } from "@/lib/campaign-art";
import { PHOTO_STYLES } from "@/lib/photo-styles";
import { MAX_STEP3_STYLES } from "@/lib/brand";
import { STYLE_SAMPLE_IMAGES, sampleImageForStyle } from "@/lib/style-samples";
import { cn } from "@/lib/utils";

/** Fixed sample content so the strip matches the wizard's "photo style" look. */
const SAMPLE = {
  hashtag: "#LoteSemanal",
  productName: "Ribeye al Carbón",
  caption: "Pedido por lote semanal · entrega jueves",
  width: 1080,
  height: 1080,
};

/** Preloads every sample photo; individual failures resolve to null. */
async function loadSampleImages(): Promise<Map<string, HTMLImageElement>> {
  const entries = await Promise.all(
    STYLE_SAMPLE_IMAGES.map(async (src) => {
      try {
        const img = await loadArtImage(src);
        return [src, img] as const;
      } catch {
        return null;
      }
    })
  );
  const map = new Map<string, HTMLImageElement>();
  for (const entry of entries) {
    if (entry) map.set(entry[0], entry[1]);
  }
  return map;
}

/**
 * Step-3 curation for the identidad page: the pinned styles rendered as
 * real thumbnails (same renderer as the wizard strip), with the full
 * catalog drawer for toggling up to five.
 */
export function Step3StylePicker() {
  const { brand, updateBrand } = useBrand();
  const pinsKey = brand.step3StyleIds.join(",");
  const [strip, setStrip] = useState<DrawerThumb[] | null>(null);
  const [stripFailed, setStripFailed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerThumbs, setDrawerThumbs] = useState<DrawerThumb[]>([]);
  const [drawerFailed, setDrawerFailed] = useState(false);

  function toggle(id: string): void {
    const current = brand.step3StyleIds;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : current.length >= MAX_STEP3_STYLES
        ? current
        : [...current, id];
    if (next === current) return;
    void updateBrand({ step3StyleIds: next });
  }

  // Pinned strip thumbnails, refreshed with pins, logo and company name.
  useEffect(() => {
    let cancelled = false;
    setStrip(null);
    setStripFailed(false);
    (async () => {
      try {
        const [samples, logo] = await Promise.all([
          loadSampleImages(),
          brand.logoDataUrl
            ? loadArtImage(brand.logoDataUrl).catch(() => null)
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
        const fallback = Array.from(samples.values())[0];
        if (!fallback) throw new Error("no samples");
        const tw = 200;
        const th = Math.max(2, Math.round((tw * SAMPLE.height) / SAMPLE.width));
        const art = {
          hashtag: SAMPLE.hashtag,
          productName: SAMPLE.productName,
          overlayText: "",
          caption: SAMPLE.caption,
          width: tw,
          height: th,
          logo,
          companyName: brand.companyName,
        };
        const list = pinsKey
          .split(",")
          .filter(Boolean)
          .map((id) => PHOTO_STYLES.find((s) => s.id === id))
          .filter((s) => s !== undefined)
          .map((style) => ({
            id: style.id,
            url: renderArtCanvas({
              ...art,
              image: samples.get(sampleImageForStyle(style.id)) ?? fallback,
              style,
            }).toDataURL("image/png"),
          }));
        if (!cancelled) setStrip(list);
      } catch {
        if (!cancelled) {
          setStrip([]);
          setStripFailed(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinsKey, brand.logoDataUrl, brand.companyName]);

  // Drawer thumbnails, rendered fresh on every open in small batches.
  useEffect(() => {
    if (!drawerOpen) return;
    let cancelled = false;
    setDrawerThumbs([]);
    setDrawerFailed(false);
    (async () => {
      const [samples, logo] = await Promise.all([
        loadSampleImages(),
        brand.logoDataUrl
          ? loadArtImage(brand.logoDataUrl).catch(() => null)
          : Promise.resolve(null),
      ]);
      const fallback = Array.from(samples.values())[0];
      if (!fallback) {
        if (!cancelled) setDrawerFailed(true);
        return;
      }
      if (cancelled) return;
      const tw = 160;
      const th = Math.max(2, Math.round((tw * SAMPLE.height) / SAMPLE.width));
      const art = {
        hashtag: SAMPLE.hashtag,
        productName: SAMPLE.productName,
        overlayText: "",
        caption: SAMPLE.caption,
        width: tw,
        height: th,
        logo,
        companyName: brand.companyName,
      };
      const list: DrawerThumb[] = [];
      for (const style of PHOTO_STYLES) {
        try {
          list.push({
            id: style.id,
            url: renderArtCanvas({
              ...art,
              image: samples.get(sampleImageForStyle(style.id)) ?? fallback,
              style,
            }).toDataURL("image/jpeg", 0.82),
          });
        } catch {
          continue;
        }
        if (cancelled) return;
        if (list.length % 4 === 0) {
          setDrawerThumbs([...list]);
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      if (!cancelled) setDrawerThumbs(list);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-charcoal-800/75 max-w-2xl">
          Estos son los estilos que aparecen en el paso 3 del asistente, en la
          sección de elegir estilo para la foto. Explora el catálogo y marca
          hasta cinco; el orden de selección es el orden en que aparecen. Clic
          en una miniatura para quitarla.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDrawerOpen(true)}
          className="shrink-0"
        >
          Explorar estilos
        </Button>
      </div>

      <div className="mt-4">
        {strip === null ? (
          <p className="font-sans text-sm text-charcoal-800/60">
            Generando miniaturas…
          </p>
        ) : stripFailed || strip.length === 0 ? (
          <p className="text-sm text-ember">
            {stripFailed
              ? "No se pudieron generar las miniaturas."
              : "Ningún estilo guardado existe en el catálogo — explora y elige de nuevo."}
          </p>
        ) : (
          <div
            role="group"
            aria-label="Estilos del paso 3"
            className="flex gap-3 overflow-x-auto pb-2 snap-x"
          >
            {strip.map((thumb, i) => {
              const style = PHOTO_STYLES.find((s) => s.id === thumb.id);
              const name = style?.name ?? thumb.id;
              return (
                <button
                  key={thumb.id}
                  type="button"
                  aria-pressed="true"
                  title={`Quitar ${name}`}
                  onClick={() => toggle(thumb.id)}
                  className={cn(
                    "w-44 sm:w-48 shrink-0 snap-start rounded-xl border overflow-hidden text-left transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust-600",
                    "border-rust-700 ring-2 ring-rust-700/30"
                  )}
                >
                  <StyleThumbImage url={thumb.url} name={`${i + 1} · ${name}`} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-charcoal-800/60 mt-3">
        Si eliges menos de cinco, el asistente completa la tira con los
        primeros estilos del catálogo.
      </p>

      <StyleDrawer
        open={drawerOpen}
        title="Explorar estilos"
        closeLabel="Cerrar"
        loadingLabel="Generando miniaturas…"
        errorLabel="No se pudieron generar las miniaturas."
        styles={PHOTO_STYLES}
        thumbs={drawerThumbs}
        failed={drawerFailed}
        selectedIds={brand.step3StyleIds}
        maxSelections={MAX_STEP3_STYLES}
        onSelect={toggle}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
