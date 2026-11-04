"use client";

import { useEffect, useRef, useState } from "react";
import { DRAWER_CAROUSEL_IMAGES } from "@/lib/drawer-media";
import { ANIMATION_FPS } from "@/lib/carousel-animate";
import { loadArtImage } from "@/lib/campaign-art";
import { recordFrameLoop, supportsVideoExport, videoDims } from "@/lib/campaign-video";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoopResult {
  imageId: string;
  frames: string[];
  fps: number;
}

/**
 * Featured-media carousel at the top of the style drawer: Meta AI's
 * animated creations in a snap strip with previous/next controls and
 * position dots. Clicking a creation asks the gif-animator agent for a
 * fresh 6 FPS loop of it, played inline with a video download.
 * Respects prefers-reduced-motion for the strip scroll.
 */
export function DrawerCarousel({
  title,
  prevLabel,
  nextLabel,
  animateActionLabel,
  animatingLabel,
  animateErrorLabel,
  backLabel,
  downloadLabel,
}: {
  title: string;
  prevLabel: string;
  nextLabel: string;
  animateActionLabel: string;
  animatingLabel: string;
  animateErrorLabel: string;
  backLabel: string;
  downloadLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loop, setLoop] = useState<LoopResult | null>(null);
  const [frame, setFrame] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [canDownload] = useState(() => supportsVideoExport());
  const count = DRAWER_CAROUSEL_IMAGES.length;

  function go(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  }

  function onScroll() {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(
      Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)))
    );
  }

  // Loop playback at the animation fps.
  useEffect(() => {
    if (!loop) return;
    setFrame(0);
    const timer = setInterval(() => {
      setFrame((i) => (i + 1) % loop.frames.length);
    }, 1000 / loop.fps);
    return () => clearInterval(timer);
  }, [loop]);

  async function animate(imageId: string) {
    if (busyId) return;
    setBusyId(imageId);
    setFailed(false);
    setLoop(null);
    try {
      const res = await fetch("/api/ai/carousel-animate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        frames?: { imageBase64: string; mimeType: string }[];
        fps?: number;
      };
      if (!Array.isArray(data.frames) || data.frames.length === 0) {
        throw new Error("no frames");
      }
      setLoop({
        imageId,
        frames: data.frames.map((f) => `data:${f.mimeType};base64,${f.imageBase64}`),
        fps: typeof data.fps === "number" && data.fps > 0 ? data.fps : ANIMATION_FPS,
      });
    } catch {
      setFailed(true);
    } finally {
      setBusyId(null);
    }
  }

  async function download() {
    if (!loop || downloading) return;
    setDownloading(true);
    try {
      const images = await Promise.all(loop.frames.map((src) => loadArtImage(src)));
      const first = images[0];
      const { width, height } = videoDims(first.naturalWidth, first.naturalHeight);
      const { url, extension } = await recordFrameLoop({
        images,
        width,
        height,
        fps: loop.fps,
        loops: 3,
      });
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${loop.imageId}-loop.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      setFailed(true);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section aria-roledescription="carousel" aria-label={title}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal-800/60">
          {title}
        </h3>
        {loop ? (
          <Button variant="outline" size="sm" onClick={() => setLoop(null)}>
            {backLabel}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label={prevLabel}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => go(1)}
              disabled={index === count - 1}
              aria-label={nextLabel}
            >
              →
            </Button>
          </div>
        )}
      </div>
      {failed && !loop && (
        <p className="text-sm text-ember mb-2" role="alert">
          {animateErrorLabel}
        </p>
      )}
      {loop ? (
        <div>
          <div className="relative rounded-xl border border-charcoal-900/15 bg-white overflow-hidden">
            <img
              src={loop.frames[frame]}
              alt={DRAWER_CAROUSEL_IMAGES.find((m) => m.id === loop.imageId)?.alt ?? loop.imageId}
              className="w-full block"
            />
            <span className="absolute top-2 right-2 rounded bg-charcoal-900/80 px-2 py-0.5 font-sans text-[11px] font-semibold text-cream">
              {loop.fps} FPS · {frame + 1}/{loop.frames.length}
            </span>
          </div>
          {failed && (
            <p className="text-sm text-ember mt-2" role="alert">
              {animateErrorLabel}
            </p>
          )}
          {canDownload && (
            <div className="mt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={download} disabled={downloading}>
                {downloadLabel}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory rounded-xl"
          >
            {DRAWER_CAROUSEL_IMAGES.map((media) => (
              <button
                key={media.id}
                type="button"
                title={animateActionLabel}
                aria-label={`${media.alt}. ${animateActionLabel}`}
                disabled={busyId !== null}
                onClick={() => animate(media.id)}
                className={cn(
                  "relative w-full shrink-0 snap-center rounded-xl border overflow-hidden text-left transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust-600",
                  "disabled:cursor-wait border-charcoal-900/15 hover:border-rust-600/50"
                )}
              >
                <img src={media.src} alt={media.alt} loading="lazy" className="w-full block" />
                <span className="absolute top-2 right-2 rounded bg-charcoal-900/80 px-2 py-0.5 font-sans text-[11px] font-semibold text-cream">
                  {ANIMATION_FPS} FPS
                </span>
                {busyId === media.id && (
                  <span className="absolute inset-0 flex items-center justify-center bg-charcoal-950/60 px-4 text-center font-sans text-sm font-medium text-cream">
                    {animatingLabel}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div aria-hidden="true" className="mt-2 flex justify-center gap-1.5">
            {DRAWER_CAROUSEL_IMAGES.map((media, i) => (
              <span
                key={media.id}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  i === index ? "bg-rust-700" : "bg-charcoal-900/20"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
