/**
 * Campaign art composer (browser-only: uses canvas/Image).
 * Renders the publish-ready photo for any size, style and content, so the
 * wizard can show real style thumbnails plus the full-size preview.
 */
import type { ArtEffect, PhotoStyle } from "./photo-styles";

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadArtImage(src: string): Promise<HTMLImageElement> {
  const hit = imageCache.get(src);
  if (hit) return hit;
  const pending = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
  imageCache.set(src, pending);
  return pending;
}

export interface ArtInput {
  image: HTMLImageElement;
  hashtag: string;
  productName: string;
  overlayText: string;
  caption: string;
  width: number;
  height: number;
  style: PhotoStyle;
  /** Brand logo for the upper-right watermark; "B" badge fallback when absent. */
  logo?: HTMLImageElement | null;
  /** Company name for the upper-left brand line. */
  companyName?: string;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width > maxWidth && line) {
      lines.push(line);
      if (lines.length >= maxLines) return lines;
      line = word;
    } else {
      line = trial;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function convolveSharpen(img: ImageData, k: number): void {
  const W = img.width;
  const H = img.height;
  const data = img.data;
  const src = new Uint8ClampedArray(data);
  const center = 1 + 4 * k;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        const l = x > 0 ? src[i - 4 + ch] : src[i + ch];
        const r = x < W - 1 ? src[i + 4 + ch] : src[i + ch];
        const u = y > 0 ? src[i - W * 4 + ch] : src[i + ch];
        const d = y < H - 1 ? src[i + W * 4 + ch] : src[i + ch];
        data[i + ch] = center * src[i + ch] - k * (l + r + u + d);
      }
    }
  }
}

function posterize(img: ImageData, levels: number): void {
  const data = img.data;
  const bands = Math.max(2, Math.round(levels));
  const step = 255 / (bands - 1);
  for (let i = 0; i < data.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      data[i + ch] = Math.round((data[i + ch] / 255) * (bands - 1)) * step;
    }
  }
}

function sobelDarken(img: ImageData, threshold: number): void {
  const W = img.width;
  const H = img.height;
  const data = img.data;
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  const at = (x: number, y: number) => lum[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const gx =
        -at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1) +
        at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1);
      const gy =
        -at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1) +
        at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1);
      if (Math.sqrt(gx * gx + gy * gy) > threshold) {
        const i = (y * W + x) * 4;
        data[i] *= 0.12;
        data[i + 1] *= 0.12;
        data[i + 2] *= 0.12;
      }
    }
  }
}

function warpRemap(img: ImageData, amp: number): void {
  const W = img.width;
  const H = img.height;
  const data = img.data;
  const src = new Uint8ClampedArray(data);
  const freq = 0.02;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = Math.min(W - 1, Math.max(0, Math.round(x + amp * Math.sin(y * freq + 1.3))));
      const ny = Math.min(H - 1, Math.max(0, Math.round(y + amp * Math.cos(x * freq))));
      const from = (ny * W + nx) * 4;
      const to = (y * W + x) * 4;
      data[to] = src[from];
      data[to + 1] = src[from + 1];
      data[to + 2] = src[from + 2];
    }
  }
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function threshold(img: ImageData, level: number): void {
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = luminance(data[i], data[i + 1], data[i + 2]) > level ? 255 : 0;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
}

function emboss(img: ImageData): void {
  const W = img.width;
  const H = img.height;
  const data = img.data;
  const src = new Uint8ClampedArray(data);
  const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
  const at = (x: number, y: number, ch: number) =>
    src[(Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 4 + ch];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        data[i + ch] =
          128 +
          kernel[0] * at(x - 1, y - 1, ch) + kernel[1] * at(x, y - 1, ch) + kernel[2] * at(x + 1, y - 1, ch) +
          kernel[3] * at(x - 1, y, ch) + kernel[4] * at(x, y, ch) + kernel[5] * at(x + 1, y, ch) +
          kernel[6] * at(x - 1, y + 1, ch) + kernel[7] * at(x, y + 1, ch) + kernel[8] * at(x + 1, y + 1, ch);
      }
    }
  }
}

function mosaic(img: ImageData, size: number): void {
  const W = img.width;
  const H = img.height;
  const data = img.data;
  const s = Math.max(2, Math.round(size));
  for (let by = 0; by < H; by += s) {
    for (let bx = 0; bx < W; bx += s) {
      const src = (by * W + bx) * 4;
      const r = data[src];
      const g = data[src + 1];
      const b = data[src + 2];
      for (let y = by; y < Math.min(H, by + s); y++) {
        for (let x = bx; x < Math.min(W, bx + s); x++) {
          const i = (y * W + x) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }
      }
    }
  }
}

function solarize(img: ImageData): void {
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      if (data[i + ch] > 128) data[i + ch] = 255 - data[i + ch];
    }
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function duotone(img: ImageData, dark: string, light: string): void {
  const [dr, dg, db] = hexToRgb(dark);
  const [lr, lg, lb] = hexToRgb(light);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const t = luminance(data[i], data[i + 1], data[i + 2]) / 255;
    data[i] = dr + (lr - dr) * t;
    data[i + 1] = dg + (lg - dg) * t;
    data[i + 2] = db + (lb - db) * t;
  }
}

const THERMAL_STOPS: [number, number, number][] = [
  [8, 8, 20],
  [120, 10, 40],
  [220, 60, 20],
  [250, 180, 30],
  [255, 250, 230],
];

function thermal(img: ImageData): void {
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const t = (luminance(data[i], data[i + 1], data[i + 2]) / 255) * (THERMAL_STOPS.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(THERMAL_STOPS.length - 1, lo + 1);
    const f = t - lo;
    const [r0, g0, b0] = THERMAL_STOPS[lo];
    const [r1, g1, b1] = THERMAL_STOPS[hi];
    data[i] = r0 + (r1 - r0) * f;
    data[i + 1] = g0 + (g1 - g0) * f;
    data[i + 2] = b0 + (b1 - b0) * f;
  }
}

function neonEdges(img: ImageData, thresholdLevel: number, color: string): void {
  const W = img.width;
  const H = img.height;
  const data = img.data;
  const [cr, cg, cb] = hexToRgb(color);
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    lum[i] = luminance(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  }
  const at = (x: number, y: number) => lum[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const gx = at(x + 1, y) - at(x - 1, y);
      const gy = at(x, y + 1) - at(x, y - 1);
      if (Math.sqrt(gx * gx + gy * gy) > thresholdLevel) {
        data[i] = cr;
        data[i + 1] = cg;
        data[i + 2] = cb;
      } else {
        data[i] *= 0.15;
        data[i + 1] *= 0.15;
        data[i + 2] *= 0.15;
      }
    }
  }
}

function grain(img: ImageData, amount: number): void {
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() * 2 - 1) * amount;
    data[i] += n;
    data[i + 1] += n;
    data[i + 2] += n;
  }
}

function halftone(img: ImageData, size: number): void {
  const W = img.width;
  const H = img.height;
  const data = img.data;
  const s = Math.max(3, Math.round(size * (W / 1080)));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Dot grid rotated ~20° for a print feel.
      const nx = x * 0.94 - y * 0.34;
      const ny = x * 0.34 + y * 0.94;
      const cx = ((((nx % s) + s) % s) / s) - 0.5;
      const cy = ((((ny % s) + s) % s) / s) - 0.5;
      const dot = Math.sqrt(cx * cx + cy * cy) * 2;
      const i = (y * W + x) * 4;
      if (luminance(data[i], data[i + 1], data[i + 2]) / 255 < dot * 0.9) {
        data[i] *= 0.12;
        data[i + 1] *= 0.12;
        data[i + 2] *= 0.12;
      }
    }
  }
}

function tiltShift(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  blur: number,
  band: number
): void {
  // Miniature/aerial look: blurred top and bottom, sharp middle band.
  const sharp = snapshot(canvas, W, H);
  const layer = document.createElement("canvas");
  layer.width = W;
  layer.height = H;
  const lctx = layer.getContext("2d");
  if (!lctx) return;
  try {
    lctx.filter = `blur(${Math.max(2, Math.round(blur * (W / 1080)))}px) saturate(1.3)`;
  } catch {
    return; // Older engines: keep the photo unblurred.
  }
  lctx.drawImage(sharp, 0, 0);
  const kept = Math.min(0.8, Math.max(0.1, band));
  const m0 = 0.5 - kept / 2;
  const m1 = 0.5 + kept / 2;
  const feather = 0.12;
  const mask = lctx.createLinearGradient(0, 0, 0, H);
  mask.addColorStop(0, "rgba(0,0,0,0)");
  mask.addColorStop(Math.max(0, m0 - feather), "rgba(0,0,0,0)");
  mask.addColorStop(m0, "rgba(0,0,0,1)");
  mask.addColorStop(m1, "rgba(0,0,0,1)");
  mask.addColorStop(Math.min(1, m1 + feather), "rgba(0,0,0,0)");
  mask.addColorStop(1, "rgba(0,0,0,0)");
  lctx.globalCompositeOperation = "destination-out";
  lctx.fillStyle = mask;
  lctx.fillRect(0, 0, W, H);
  ctx.drawImage(layer, 0, 0);
}

function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function doodleOverlay(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  count: number
): void {
  // Fixed seed: thumbnails and the full render doodle identically.
  const rnd = mulberry32(20261102);
  const inks = ["#ffffff", "#ffd166", "#ff6b6b", "#4ecdc4"];
  ctx.save();
  ctx.lineWidth = Math.max(2, W / 300);
  ctx.lineCap = "round";
  const n = Math.max(1, Math.round(count));
  for (let i = 0; i < n; i++) {
    ctx.strokeStyle = inks[Math.floor(rnd() * inks.length) % inks.length];
    ctx.globalAlpha = 0.9;
    const kind = Math.floor(rnd() * 4);
    const x = rnd() * W;
    const y = rnd() * H * 0.7;
    const r = W * (0.02 + rnd() * 0.05);
    ctx.beginPath();
    if (kind === 0) {
      ctx.arc(x, y, r, 0, Math.PI * (1.2 + rnd()));
    } else if (kind === 1) {
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 - Math.PI / 2 + rnd() * 0.3;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (kind === 2) {
      ctx.moveTo(x, y);
      const segs = 3 + Math.floor(rnd() * 3);
      for (let k = 1; k <= segs; k++) {
        ctx.lineTo(x + (k / segs) * r * 3, y + (rnd() - 0.5) * r * 2);
      }
    } else {
      const len = r * (2 + rnd() * 2);
      const a = rnd() * Math.PI * 2;
      const hx = x + Math.cos(a) * len;
      const hy = y + Math.sin(a) * len;
      ctx.moveTo(x, y);
      ctx.lineTo(hx, hy);
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - Math.cos(a - 0.5) * r * 0.8, hy - Math.sin(a - 0.5) * r * 0.8);
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - Math.cos(a + 0.5) * r * 0.8, hy - Math.sin(a + 0.5) * r * 0.8);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function snapshot(canvas: HTMLCanvasElement, W: number, H: number): HTMLCanvasElement {
  const tmp = document.createElement("canvas");
  tmp.width = W;
  tmp.height = H;
  const tctx = tmp.getContext("2d");
  if (!tctx) throw new Error("Canvas 2D unavailable");
  tctx.drawImage(canvas, 0, 0);
  return tmp;
}

function applyEffect(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  effect: ArtEffect
): void {
  switch (effect.kind) {
    case "sharpen": {
      const img = ctx.getImageData(0, 0, W, H);
      convolveSharpen(img, effect.amount);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "anime": {
      const img = ctx.getImageData(0, 0, W, H);
      posterize(img, effect.levels);
      sobelDarken(img, effect.edge);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "pop": {
      const img = ctx.getImageData(0, 0, W, H);
      posterize(img, effect.levels);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "watercolor": {
      const img = ctx.getImageData(0, 0, W, H);
      posterize(img, 7);
      grain(img, effect.grain);
      ctx.putImageData(img, 0, 0);
      // Soft wash blended over the detail.
      const tmp = snapshot(canvas, W, H);
      ctx.save();
      ctx.globalAlpha = 0.45;
      try {
        ctx.filter = `blur(${Math.max(1, Math.round(effect.soft * (W / 1080)))}px) saturate(1.1)`;
      } catch {
        /* older engines: keep the detail pass only */
      }
      ctx.drawImage(tmp, 0, 0);
      ctx.restore();
      break;
    }
    case "pixel": {
      const img = ctx.getImageData(0, 0, W, H);
      mosaic(img, effect.size * (W / 1080));
      posterize(img, effect.levels);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "threshold": {
      const img = ctx.getImageData(0, 0, W, H);
      threshold(img, effect.level);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "emboss": {
      const img = ctx.getImageData(0, 0, W, H);
      emboss(img);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "mosaic": {
      const img = ctx.getImageData(0, 0, W, H);
      mosaic(img, effect.size * (W / 1080));
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "solarize": {
      const img = ctx.getImageData(0, 0, W, H);
      solarize(img);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "duotone": {
      const img = ctx.getImageData(0, 0, W, H);
      duotone(img, effect.dark, effect.light);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "thermal": {
      const img = ctx.getImageData(0, 0, W, H);
      thermal(img);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "neon": {
      const img = ctx.getImageData(0, 0, W, H);
      neonEdges(img, effect.edge, effect.color);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "grain": {
      const img = ctx.getImageData(0, 0, W, H);
      grain(img, effect.amount);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "halftone": {
      const img = ctx.getImageData(0, 0, W, H);
      halftone(img, effect.size);
      ctx.putImageData(img, 0, 0);
      break;
    }
    case "tiltshift": {
      tiltShift(canvas, ctx, W, H, effect.blur, effect.band);
      break;
    }
    case "doodle": {
      doodleOverlay(ctx, W, H, effect.count);
      break;
    }
    case "soft": {
      const tmp = snapshot(canvas, W, H);
      ctx.save();
      try {
        ctx.filter = `blur(${Math.max(1, Math.round(effect.radius * (W / 1080)))}px)`;
      } catch {
        /* older engines: keep the photo as is */
      }
      ctx.drawImage(tmp, 0, 0);
      ctx.restore();
      break;
    }
    case "none":
      break;
    case "surreal": {
      const img = ctx.getImageData(0, 0, W, H);
      warpRemap(img, effect.warp * (W / 1080));
      ctx.putImageData(img, 0, 0);
      const tmp = snapshot(canvas, W, H);
      ctx.save();
      try {
        ctx.filter = `hue-rotate(${effect.hue}deg) saturate(1.6)`;
      } catch {
        /* older engines: keep the warp only */
      }
      ctx.drawImage(tmp, 0, 0);
      ctx.restore();
      break;
    }
    case "fantasy": {
      const tmp = snapshot(canvas, W, H);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = effect.glow;
      try {
        ctx.filter = `blur(${Math.max(4, Math.round(W / 90))}px) saturate(1.6) brightness(1.1)`;
      } catch {
        /* older engines: unblurred glow still reads as glow */
      }
      ctx.drawImage(tmp, 0, 0);
      ctx.restore();
      const g = ctx.createRadialGradient(
        W / 2, H / 2, Math.min(W, H) * 0.35,
        W / 2, H / 2, Math.max(W, H) * 0.75
      );
      g.addColorStop(0, "rgba(8,8,14,0)");
      g.addColorStop(1, "rgba(8,8,14,0.5)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      break;
    }
  }
}

/** Active brand font stack from the theme variables (browser-only). */
function brandFont(varName: string, fallback: string): string {
  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    return value || fallback;
  } catch {
    return fallback;
  }
}

export function renderArtCanvas(input: ArtInput): HTMLCanvasElement {
  const { image, hashtag, productName, overlayText, caption, width, height } = input;
  const { style } = input;
  const W = width;
  const H = height;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  // Base photo with the style filter + tint.
  ctx.fillStyle = "#1a1c1e";
  ctx.fillRect(0, 0, W, H);
  try {
    ctx.filter = style.filter;
  } catch {
    // Older engines ignore ctx.filter; tint + shading still carry the style.
  }
  drawCover(ctx, image, W, H);
  try {
    ctx.filter = "none";
  } catch {
    /* noop */
  }
  // Artistic render effect (photo only — text is drawn afterwards).
  applyEffect(canvas, ctx, W, H, style.effect);
  if (style.tint) {
    ctx.fillStyle = style.tint;
    ctx.fillRect(0, 0, W, H);
  }

  // Bottom gradient for legibility.
  const grad = ctx.createLinearGradient(0, H * 0.35, 0, H);
  grad.addColorStop(0, style.shadeTop);
  grad.addColorStop(0.55, style.shadeMid);
  grad.addColorStop(1, style.shadeBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const pad = Math.round(W * 0.06);
  const scale = W / 1080;

  // Watermark, upper-right corner (brand rule): the uploaded logo when
  // available, otherwise the "B" badge placeholder.
  drawWatermark(ctx, input.logo ?? null, W, pad, scale);

  // Brand line, upper-left (company name + heading font cascade).
  const headingStack = brandFont("--brand-font-heading", "Georgia, serif");
  const bodyStack = brandFont(
    "--brand-font-body",
    '-apple-system, "Segoe UI", sans-serif'
  );
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = style.titleColor;
  ctx.font = `${Math.round(30 * scale)}px ${headingStack}`;
  ctx.fillText(
    input.companyName?.trim() || "Casa de Brasas",
    pad,
    pad + Math.round(30 * scale)
  );

  // Bottom block.
  let y = H - pad;
  const footerSize = Math.round(26 * scale);
  ctx.font = `${footerSize}px ${bodyStack}`;
  ctx.fillStyle = style.footerColor;
  const footerLines = wrapText(ctx, caption, W - pad * 2, 2);
  y -= (footerLines.length - 1) * (footerSize * 1.35);
  footerLines.forEach((line, i) => {
    ctx.fillText(line, pad, y + i * footerSize * 1.35 - footerSize * 0.2);
  });
  y -= footerSize * 1.6;

  // Overlay text only: the prompt guides generation but is never drawn.
  const overlaySize = Math.round(30 * scale);
  ctx.font = `${overlaySize}px ${bodyStack}`;
  ctx.fillStyle = style.bodyColor;
  const overlayLines = overlayText.trim()
    ? wrapText(ctx, overlayText.trim().slice(0, 140), W - pad * 2, 3)
    : [];
  for (let i = overlayLines.length - 1; i >= 0; i--) {
    ctx.fillText(overlayLines[i], pad, y);
    y -= overlaySize * 1.4;
  }
  if (overlayLines.length > 0) y -= overlaySize * 0.4;

  // Product name + hashtag.
  const nameSize = Math.round(64 * scale);
  ctx.font = `bold ${nameSize}px ${headingStack}`;
  ctx.fillStyle = style.titleColor;
  const nameLines = wrapText(ctx, productName, W - pad * 2, 2);
  for (let i = nameLines.length - 1; i >= 0; i--) {
    ctx.fillText(nameLines[i], pad, y);
    y -= nameSize * 1.15;
  }
  ctx.font = `bold ${Math.round(44 * scale)}px ${bodyStack}`;
  ctx.fillStyle = style.hashtagColor;
  ctx.fillText(hashtag, pad, y);
  y -= Math.round(44 * scale) * 0.9;

  // Accent rule above the text block.
  ctx.fillStyle = style.accent;
  ctx.fillRect(pad, y, Math.round(140 * scale), Math.round(8 * scale));

  if (style.frame === "tarot") drawTarotFrame(ctx, W, H, pad, scale);

  return canvas;
}

export interface StyleArtInput {
  image: HTMLImageElement;
  width: number;
  height: number;
  style: PhotoStyle;
}

/**
 * Preset-gallery tile matching meta.ai/create's "Valores predefinidos":
 * the style's filter/effect/tint (plus its ornamental frame) over Meta's
 * sample photo, with NO campaign copy — no watermark, brand line,
 * caption, product name or hashtag. The style name is overlaid by
 * StyleThumbImage, so drawer, wizard strip and identidad curation show
 * tiles identical in structure to Meta's predefined-value previews.
 */
export function renderStyleArt(input: StyleArtInput): HTMLCanvasElement {
  const { image, width: W, height: H, style } = input;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  ctx.fillStyle = "#1a1c1e";
  ctx.fillRect(0, 0, W, H);
  try {
    ctx.filter = style.filter;
  } catch {
    // Older engines ignore ctx.filter; tint + effect still carry the style.
  }
  drawCover(ctx, image, W, H);
  try {
    ctx.filter = "none";
  } catch {
    /* noop */
  }
  applyEffect(canvas, ctx, W, H, style.effect);
  if (style.tint) {
    ctx.fillStyle = style.tint;
    ctx.fillRect(0, 0, W, H);
  }
  if (style.frame === "tarot") {
    drawTarotFrame(ctx, W, H, Math.round(W * 0.06), W / 1080);
  }
  return canvas;
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  W: number,
  pad: number,
  scale: number
): void {
  if (logo && logo.width > 0 && logo.height > 0) {
    // Contained logo on a light pill so transparent artwork stays legible.
    const boxH = Math.round(76 * scale);
    const boxW = Math.round(220 * scale);
    const inner = Math.round(10 * scale);
    const fit = Math.min(
      (boxW - inner * 2) / logo.width,
      (boxH - inner * 2) / logo.height
    );
    const dw = Math.max(1, Math.round(logo.width * fit));
    const dh = Math.max(1, Math.round(logo.height * fit));
    const pillW = dw + inner * 2;
    const pillH = dh + inner * 2;
    const x = W - pad - pillW;
    const y = pad;
    ctx.save();
    ctx.fillStyle = "rgba(247,242,234,0.94)";
    ctx.strokeStyle = "rgba(18,19,20,0.35)";
    ctx.lineWidth = Math.max(1, Math.round(2 * scale));
    const r = Math.round(10 * scale);
    const withRoundRect = ctx as CanvasRenderingContext2D & {
      roundRect?: (x: number, y: number, w: number, h: number, r: number) => void;
    };
    ctx.beginPath();
    if (typeof withRoundRect.roundRect === "function") {
      withRoundRect.roundRect(x, y, pillW, pillH, r);
    } else {
      ctx.rect(x, y, pillW, pillH);
    }
    ctx.fill();
    ctx.stroke();
    ctx.drawImage(logo, x + inner, y + inner, dw, dh);
    ctx.restore();
    return;
  }
  const logoR = Math.round(34 * scale);
  const logoX = W - pad - logoR;
  const logoY = pad + logoR;
  ctx.save();
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(247,242,234,0.92)";
  ctx.fill();
  ctx.fillStyle = "#563526";
  ctx.font = `bold ${Math.round(30 * scale)}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("B", logoX, logoY + 1);
  ctx.restore();
}

function drawTarotFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  pad: number,
  scale: number
): void {
  const gold = "#c9a227";
  const dark = "#2e1a13";
  const inset = Math.round(pad * 0.45);
  ctx.save();
  ctx.strokeStyle = dark;
  ctx.lineWidth = Math.max(2, Math.round(10 * scale));
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  ctx.strokeStyle = gold;
  ctx.lineWidth = Math.max(1, Math.round(4 * scale));
  const inner = inset + Math.round(10 * scale);
  ctx.strokeRect(inner, inner, W - inner * 2, H - inner * 2);
  // Corner diamonds.
  ctx.fillStyle = gold;
  const r = Math.max(2, Math.round(7 * scale));
  const corners: [number, number][] = [
    [inset, inset],
    [W - inset, inset],
    [inset, H - inset],
    [W - inset, H - inset],
  ];
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
