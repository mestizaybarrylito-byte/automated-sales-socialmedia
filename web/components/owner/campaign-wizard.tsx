"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { productImage } from "@/lib/store";
import { useStoreProducts } from "@/lib/use-store-products";
import { buildCaption, buildNarrative } from "@/lib/narrative";
import type { NetworkMeta, Trend } from "@/lib/trends";
import type { Locale } from "@/lib/settings";
import { localeTag } from "@/lib/settings";
import { strings } from "@/lib/i18n";
import { DEFAULT_STYLE_ID, PHOTO_STYLES, getPhotoStyleFrom, getStep3Styles, type PhotoStyle } from "@/lib/photo-styles";
import { loadPhotoStyles } from "@/lib/style-catalog";
import { loadArtImage, renderArtCanvas } from "@/lib/campaign-art";
import { recordArtVideo, supportsVideoExport, videoDims } from "@/lib/campaign-video";
import { useBrand } from "@/components/brand-theme-provider";
import { applyBrandName } from "@/lib/brand";
import { StyleDrawer } from "@/components/owner/style-drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatPrice(amount: number, locale: Locale) {
  let tag = localeTag(locale);
  try {
    // Throws only for structurally invalid tags; every catalog tag is valid,
    // this guards hand-edited cookies resolved through localeTag fallbacks.
    new Intl.NumberFormat(tag);
  } catch {
    tag = "en-US";
  }
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function cleanName(p: { name: string }) {
  return p.name.replace("[PLACEHOLDER] ", "");
}

type Format = "photo" | "video";

export function CampaignWizard({
  trend,
  network,
  locale,
}: {
  trend: Trend;
  network: NetworkMeta;
  locale: Locale;
}) {
  const t = strings[locale].wizard;
  const [step, setStep] = useState(0);
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [narrative, setNarrative] = useState("");
  const [promptTouched, setPromptTouched] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [styleId, setStyleId] = useState(
    () => getStep3Styles(PHOTO_STYLES)[0]?.id ?? DEFAULT_STYLE_ID
  );
  const [styles, setStyles] = useState<PhotoStyle[]>(PHOTO_STYLES);
  const [thumbs, setThumbs] = useState<{ id: string; url: string }[] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerThumbs, setDrawerThumbs] = useState<{ id: string; url: string }[]>([]);
  const [drawerFailed, setDrawerFailed] = useState(false);
  const [format, setFormat] = useState<Format>("photo");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoExt, setVideoExt] = useState("webm");
  const [videoStatus, setVideoStatus] = useState<
    "idle" | "recording" | "done" | "error" | "unsupported"
  >("idle");
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { brand } = useBrand();
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  // Step-3 pins key: stable across unrelated brand saves (colors, name…).
  const pinsKey = brand.step3StyleIds.join(",");
  const lastPinsKey = useRef(pinsKey);

  // Live CRM catalog: step 1 always shows the current store products.
  const { products, loaded: productsLoaded } = useStoreProducts();
  const product = useMemo(
    () => products.find((p) => p.slug === productSlug) ?? null,
    [products, productSlug]
  );
  const caption = useMemo(
    () => (product ? buildCaption(trend, product, locale) : ""),
    [trend, product, locale]
  );

  function selectProduct(slug: string) {
    setProductSlug(slug);
    const p = products.find((x) => x.slug === slug);
    if (p) {
      // The prompt is always (re)generated in the selected language.
      setNarrative(buildNarrative(trend, p, network.id, locale, brand.companyName));
      setPromptTouched(false);
    }
    setStatus("idle");
    setPreviewUrl(null);
    setVideoUrl(null);
    setVideoStatus("idle");
  }

  function regenerate() {
    if (product) {
      setNarrative(buildNarrative(trend, product, network.id, locale, brand.companyName));
      setPromptTouched(false);
    }
  }

  // The prompt must stay in the selected language: an untouched prompt follows
  // the header language; user-written text is never overwritten.
  useEffect(() => {
    if (product && !promptTouched) {
      setNarrative(buildNarrative(trend, product, network.id, locale, brand.companyName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, brand.companyName]);

  // Brand logo for the upper-right watermark (null = "B" badge fallback).
  useEffect(() => {
    let cancelled = false;
    if (!brand.logoDataUrl) {
      setLogoImg(null);
      return;
    }
    void loadArtImage(brand.logoDataUrl)
      .then((img) => {
        if (!cancelled) setLogoImg(img);
      })
      .catch(() => {
        if (!cancelled) setLogoImg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [brand.logoDataUrl]);

  // Dynamic catalog: a published JSON replaces the bundle with no rebuild.
  useEffect(() => {
    let cancelled = false;
    void loadPhotoStyles().then((remote) => {
      if (!cancelled) setStyles(remote);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // A remote catalog may not carry the selected style.
  useEffect(() => {
    if (!styles.some((s) => s.id === styleId)) {
      setStyleId(getStep3Styles(styles, brand.step3StyleIds)[0]?.id ?? DEFAULT_STYLE_ID);
    }
  }, [styles, styleId, pinsKey]);

  // The identidad page curates the step-3 strip: when the pins change,
  // preselect the first pinned style (drawer picks stay untouched).
  useEffect(() => {
    if (lastPinsKey.current === pinsKey) return;
    lastPinsKey.current = pinsKey;
    const first = getStep3Styles(styles, brand.step3StyleIds)[0];
    if (first) setStyleId(first.id);
  });

  // Real style thumbnails, refreshed with the current content.
  useEffect(() => {
    if (step !== 2 || !product) return;
    let cancelled = false;
    setThumbs(null);
    (async () => {
      try {
        const image = await loadArtImage(productImage(product));
        if (cancelled) return;
        const { width: W, height: H } = network.canvas;
        const tw = 200;
        const th = Math.max(2, Math.round((tw * H) / W));
        const art = {
          image,
          hashtag: trend.hashtag,
          productName: cleanName(product),
          overlayText,
          caption,
          width: tw,
          height: th,
          logo: logoImg,
          companyName: brand.companyName,
        };
        const list = getStep3Styles(styles, brand.step3StyleIds).map((style) => ({
          id: style.id,
          url: renderArtCanvas({ ...art, style }).toDataURL("image/png"),
        }));
        if (!cancelled) setThumbs(list);
      } catch {
        if (!cancelled) setThumbs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, product, overlayText, caption, trend, network, styles, logoImg, brand.companyName, pinsKey]);

  // Drawer thumbnails, rendered fresh on every open in small batches so a
  // large catalog never blocks the UI; a style that fails to render keeps
  // its placeholder instead of failing the whole drawer.
  useEffect(() => {
    if (!drawerOpen || !product) return;
    let cancelled = false;
    setDrawerThumbs([]);
    setDrawerFailed(false);
    (async () => {
      const image = await loadArtImage(productImage(product)).catch(() => null);
      if (!image) {
        if (!cancelled) setDrawerFailed(true);
        return;
      }
      if (cancelled) return;
      const { width: W, height: H } = network.canvas;
      const tw = 160;
      const th = Math.max(2, Math.round((tw * H) / W));
      const art = {
        image,
        hashtag: trend.hashtag,
        productName: cleanName(product),
        overlayText,
        caption,
        width: tw,
        height: th,
        logo: logoImg,
        companyName: brand.companyName,
      };
      const list: { id: string; url: string }[] = [];
      for (const style of styles) {
        try {
          list.push({
            id: style.id,
            url: renderArtCanvas({ ...art, style }).toDataURL("image/jpeg", 0.82),
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
  }, [drawerOpen, product, overlayText, caption, trend, network, styles, logoImg, brand.companyName]);

  // Release video blob URLs when replaced or unmounted.
  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  const canNextFromStep0 = product !== null;
  const canNextFromStep1 = narrative.trim().length >= 30;

  async function renderPhoto(id: string) {
    if (!product) return;
    setStatus("generating");
    setPreviewUrl(null);
    try {
      const image = await loadArtImage(productImage(product));
      const { width: W, height: H } = network.canvas;
      const canvas = renderArtCanvas({
        image,
        hashtag: trend.hashtag,
        productName: cleanName(product),
        overlayText,
        caption,
        width: W,
        height: H,
        style: getPhotoStyleFrom(styles, id),
        logo: logoImg,
        companyName: brand.companyName,
      });
      setPreviewUrl(canvas.toDataURL("image/png"));
      setStatus("done");
      requestAnimationFrame(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } catch {
      setStatus("error");
    }
  }

  function selectStyle(id: string) {
    setStyleId(id);
    // Video is slow to re-record, so it clears; the photo refreshes instantly.
    setVideoUrl(null);
    setVideoStatus("idle");
    if (previewUrl) void renderPhoto(id);
  }

  async function generateVideo() {
    if (!product || videoStatus === "recording") return;
    if (!supportsVideoExport()) {
      setVideoStatus("unsupported");
      return;
    }
    setVideoStatus("recording");
    setVideoUrl(null);
    try {
      const image = await loadArtImage(productImage(product));
      const { width, height } = videoDims(network.canvas.width, network.canvas.height);
      const base = renderArtCanvas({
        image,
        hashtag: trend.hashtag,
        productName: cleanName(product),
        overlayText,
        caption,
        width,
        height,
        style: getPhotoStyleFrom(styles, styleId),
        logo: logoImg,
        companyName: brand.companyName,
      });
      const { url, extension } = await recordArtVideo({
        base,
        width,
        height,
        durationMs: 5000,
      });
      setVideoUrl(url);
      setVideoExt(extension);
      setVideoStatus("done");
      requestAnimationFrame(() => {
        videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } catch {
      setVideoStatus("error");
    }
  }

  function clearOutputs() {
    setPreviewUrl(null);
    setVideoUrl(null);
    setStatus("idle");
    setVideoStatus("idle");
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(`${caption}\n${trend.title} — ${trend.summary}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const busy = status === "generating" || videoStatus === "recording";

  return (
    <div>
      {/* Stepper */}
      <ol className="flex items-center gap-2 font-sans text-sm" aria-label={t.stepperLabel}>
        {t.steps.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                i < step && "bg-rust-700 text-on-primary border-rust-700",
                i === step && "bg-charcoal-900 text-on-dark border-charcoal-900",
                i > step && "bg-white text-charcoal-800/50 border-charcoal-900/20"
              )}
              aria-current={i === step ? "step" : undefined}
            >
              {i + 1}
            </span>
            <span className={i === step ? "font-semibold" : "text-charcoal-800/60"}>
              {label}
            </span>
            {i < t.steps.length - 1 && <span className="mx-2 text-charcoal-800/30">—</span>}
          </li>
        ))}
      </ol>

      {/* STEP 1 — product */}
      {step === 0 && (
        <div className="mt-8">
          <h2 className="text-2xl">{t.s1Title}</h2>
          <p className="text-charcoal-800/70 mt-1">{applyBrandName(t.s1Desc, brand.companyName)}</p>
          {!productsLoaded ? (
            <p className="font-sans text-sm text-charcoal-800/60 mt-6" role="status">
              {t.productsLoading}
            </p>
          ) : products.length === 0 ? (
            <p className="text-sm text-ember mt-6" role="alert">
              {t.productsEmpty}
            </p>
          ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label={t.productsLabel}>
            {products.map((p) => {
              const selected = p.slug === productSlug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => selectProduct(p.slug)}
                  className={cn(
                    "text-left rounded-md border bg-white overflow-hidden transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust-600",
                    selected
                      ? "border-rust-700 ring-2 ring-rust-700/30"
                      : "border-charcoal-900/15 hover:border-rust-600/50"
                  )}
                >
                  <span className="photo-frame block h-32">
                    <img src={productImage(p)} alt={cleanName(p)} loading="lazy" />
                  </span>
                  <span className="block p-4">
                    <span className="block font-serif text-lg leading-snug">{cleanName(p)}</span>
                    <span className="block font-sans text-sm text-rust-700 font-semibold mt-1">
                      {formatPrice(p.priceMXN, locale)}{" "}
                      <span className="font-normal text-charcoal-800/60 text-xs">{t.priceNote}</span>
                    </span>
                    {selected && (
                      <Badge className="mt-2">{t.selected}</Badge>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button disabled={!canNextFromStep0} onClick={() => setStep(1)}>
              {t.next1}
            </Button>
          </div>
          {!canNextFromStep0 && (
            <p className="mt-2 text-sm text-charcoal-800/60 text-right">
              {t.needProduct}
            </p>
          )}
        </div>
      )}

      {/* STEP 2 — narrative + overlay */}
      {step === 1 && product && (
        <div className="mt-8">
          <h2 className="text-2xl">{t.s2Title}</h2>
          <p className="text-charcoal-800/70 mt-1">
            {t.generatedFor} <strong>{cleanName(product)}</strong> + {trend.hashtag}.{" "}
            {t.editFreely} {t.overlayIntro}
          </p>
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">{t.promptTitle}</CardTitle>
                <Badge variant="secondary">{narrative.trim().length} {t.charsLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-sans text-xs text-charcoal-800/60 mb-3">{t.promptHint}</p>
              <label htmlFor="narrative" className="sr-only">
                {t.promptLabel}
              </label>
              <textarea
                id="narrative"
                value={narrative}
                onChange={(e) => {
                  setNarrative(e.target.value);
                  setPromptTouched(true);
                }}
                rows={8}
                className="w-full rounded-md border border-charcoal-900/20 bg-cream/40 p-4 font-sans text-sm leading-relaxed focus:outline-2 focus:outline-rust-600"
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={regenerate}>
                  {t.regenerate}
                </Button>
                <Button variant="outline" size="sm" onClick={copyCaption}>
                  {copied ? t.copied : t.copyCaption}
                </Button>
              </div>
              {narrative.trim().length > 0 && narrative.trim().length < 30 && (
                <p className="mt-3 text-sm text-ember">
                  {t.minChars}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">{t.overlayTitle}</CardTitle>
                <Badge variant="secondary">{overlayText.trim().length} {t.charsLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-sans text-xs text-charcoal-800/60 mb-3">{t.overlayHint}</p>
              <label htmlFor="overlay" className="sr-only">
                {t.overlayLabel}
              </label>
              <textarea
                id="overlay"
                value={overlayText}
                onChange={(e) => {
                  setOverlayText(e.target.value);
                  clearOutputs();
                }}
                rows={3}
                placeholder={t.overlayPlaceholder}
                className="w-full rounded-md border border-charcoal-900/20 bg-cream/40 p-4 font-sans text-sm leading-relaxed focus:outline-2 focus:outline-rust-600"
              />
            </CardContent>
          </Card>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>
              {t.backProducts}
            </Button>
            <Button disabled={!canNextFromStep1} onClick={() => setStep(2)}>
              {t.next2}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 — style + photo/video */}
      {step === 2 && product && (
        <div className="mt-8">
          <h2 className="text-2xl">{t.s3Title}</h2>
          <p className="text-charcoal-800/70 mt-1">
            {t.formatLabel} {network.label}: <strong>{network.canvas.label}</strong>.{" "}
            {t.s3Desc}
          </p>

          <Card className="mt-6">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{t.styleTitle}</CardTitle>
                  <p className="font-sans text-xs text-charcoal-800/60 mt-1">{t.styleHint}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)} className="shrink-0">
                  {t.browseStyles}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {thumbs === null ? (
                <p className="font-sans text-sm text-charcoal-800/60">{t.thumbsLoading}</p>
              ) : thumbs.length === 0 ? (
                <p className="text-sm text-ember">{t.genError}</p>
              ) : (
                <div
                  role="radiogroup"
                  aria-label={t.styleTitle}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
                >
                  {thumbs.map((thumb) => {
                    const style = getPhotoStyleFrom(styles, thumb.id);
                    const selected = thumb.id === styleId;
                    return (
                      <button
                        key={thumb.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        title={style.name}
                        onClick={() => selectStyle(thumb.id)}
                        className={cn(
                          "rounded-md border bg-white overflow-hidden text-left transition-colors",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust-600",
                          selected
                            ? "border-rust-700 ring-2 ring-rust-700/30"
                            : "border-charcoal-900/15 hover:border-rust-600/50"
                        )}
                      >
                        <img
                          src={thumb.url}
                          alt={style.name}
                          className="w-full block"
                          loading="lazy"
                        />
                        <span
                          className={cn(
                            "block px-2 py-1.5 font-sans text-xs text-center",
                            selected ? "font-semibold text-rust-700" : "text-charcoal-800/70"
                          )}
                        >
                          {style.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">{t.summaryTitle}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <p><strong>{t.networkRow}</strong> {network.label}</p>
                <p><strong>{t.trendRow}</strong> {trend.title} ({trend.hashtag})</p>
                <p><strong>{t.productRow}</strong> {cleanName(product)}</p>
                <p><strong>{t.styleRow}</strong> {getPhotoStyleFrom(styles, styleId).name}</p>
                <p className="text-charcoal-800/70 leading-relaxed">
                  <strong className="text-charcoal-900">{t.promptRow}</strong> {narrative.trim().slice(0, 180)}
                  {narrative.trim().length > 180 ? "…" : ""}
                </p>
                <p className="text-charcoal-800/70 leading-relaxed">
                  <strong className="text-charcoal-900">{t.overlayRow}</strong>{" "}
                  {overlayText.trim() || t.noneValue}
                </p>
                <div
                  role="radiogroup"
                  aria-label={t.contentRow}
                  className="flex items-center gap-2 pt-1"
                >
                  <span className="font-sans font-semibold">{t.contentRow}</span>
                  <Button
                    size="sm"
                    variant={format === "photo" ? "secondary" : "outline"}
                    role="radio"
                    aria-checked={format === "photo"}
                    onClick={() => setFormat("photo")}
                  >
                    {t.photoOpt}
                  </Button>
                  <Button
                    size="sm"
                    variant={format === "video" ? "secondary" : "outline"}
                    role="radio"
                    aria-checked={format === "video"}
                    onClick={() => setFormat("video")}
                  >
                    {t.videoOpt}
                  </Button>
                </div>
                {format === "photo" ? (
                  <div className="pt-2 flex flex-wrap gap-3">
                    <Button onClick={() => renderPhoto(styleId)} disabled={busy}>
                      {status === "generating" ? t.generating : t.generate}
                    </Button>
                    {previewUrl && (
                      <a
                        href={previewUrl}
                        download={`${network.id}-${trend.id}-${product.slug}-${styleId}.png`}
                        className="inline-flex items-center justify-center rounded-md font-sans font-medium h-10 px-5 text-sm border border-charcoal-900/25 text-charcoal-900 hover:bg-charcoal-900/5"
                      >
                        {t.download}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="pt-2">
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={generateVideo} disabled={busy}>
                        {videoStatus === "recording" ? t.generatingVideo : t.generateVideo}
                      </Button>
                      {videoUrl && (
                        <a
                          href={videoUrl}
                          download={`${network.id}-${trend.id}-${product.slug}-${styleId}.${videoExt}`}
                          className="inline-flex items-center justify-center rounded-md font-sans font-medium h-10 px-5 text-sm border border-charcoal-900/25 text-charcoal-900 hover:bg-charcoal-900/5"
                        >
                          {t.downloadVideo}
                        </a>
                      )}
                    </div>
                    <p className="mt-2 font-sans text-xs text-charcoal-800/60">{t.videoNote}</p>
                  </div>
                )}
                {format === "photo" && status === "error" && (
                  <p className="text-ember">{t.genError}</p>
                )}
                {format === "video" && videoStatus === "error" && (
                  <p className="text-ember">{t.videoError}</p>
                )}
                {format === "video" && videoStatus === "unsupported" && (
                  <p className="text-ember">{t.videoUnsupported}</p>
                )}
              </CardContent>
            </Card>
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">
                      {format === "photo" ? t.previewTitle : t.previewVideoTitle}
                    </CardTitle>
                    <Badge variant="secondary">{network.canvas.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {format === "photo" ? (
                    previewUrl ? (
                      <img
                        ref={previewRef}
                        src={previewUrl}
                        alt={t.previewAlt
                          .replace("{trend}", trend.title)
                          .replace("{product}", cleanName(product))
                          .replace("{network}", network.label)}
                        className="w-full rounded-md border border-charcoal-900/15"
                      />
                    ) : (
                      <div className="rounded-md border border-dashed border-charcoal-900/25 bg-cream/50 p-10 text-center">
                        <p className="font-serif text-xl">{t.emptyTitle}</p>
                        <p className="font-sans text-sm text-charcoal-800/60 mt-1">
                          {status === "generating"
                            ? t.emptyGenerating
                            : t.emptyIdle.replace("{generate}", t.generate)}
                        </p>
                      </div>
                    )
                  ) : videoUrl ? (
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      playsInline
                      className="w-full rounded-md border border-charcoal-900/15 bg-charcoal-900"
                    />
                  ) : (
                    <div className="rounded-md border border-dashed border-charcoal-900/25 bg-cream/50 p-10 text-center">
                      <p className="font-serif text-xl">{t.emptyTitle}</p>
                      <p className="font-sans text-sm text-charcoal-800/60 mt-1">
                        {videoStatus === "recording"
                          ? t.generatingVideo
                          : t.videoEmpty.replace("{generate}", t.generateVideo)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              {t.backNarrative}
            </Button>
            <Button variant="secondary" onClick={() => setStep(0)}>
              {t.changeProduct}
            </Button>
          </div>
          <StyleDrawer
            open={drawerOpen}
            title={t.drawerTitle}
            closeLabel={t.drawerClose}
            loadingLabel={t.thumbsLoading}
            errorLabel={t.genError}
            styles={styles}
            thumbs={drawerThumbs}
            failed={drawerFailed}
            selectedId={styleId}
            onSelect={(id) => {
              selectStyle(id);
              setDrawerOpen(false);
            }}
            onClose={() => setDrawerOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
