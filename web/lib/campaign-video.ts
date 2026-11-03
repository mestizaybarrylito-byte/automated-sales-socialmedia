/**
 * Campaign video export (browser-only).
 * Records a short slow-zoom clip over the styled artwork with the platform
 * MediaRecorder — a real playable video file, no external API needed.
 */

export function supportsVideoExport(): boolean {
  if (typeof MediaRecorder === "undefined") return false;
  try {
    const probe = document.createElement("canvas");
    return typeof probe.captureStream === "function";
  } catch {
    return false;
  }
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

/** Fit artwork into recording dims: longest side capped at 1280, even sizes. Pure. */
export function videoDims(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(1, 1280 / Math.max(width, height));
  return { width: even(width * scale), height: even(height * scale) };
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}

export async function recordArtVideo(options: {
  base: HTMLCanvasElement;
  width: number;
  height: number;
  durationMs?: number;
  fps?: number;
}): Promise<{ url: string; extension: string }> {
  const { base, width, height, durationMs = 5000, fps = 30 } = options;
  if (!supportsVideoExport()) throw new Error("video-unsupported");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  const stream = canvas.captureStream(fps);
  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType, videoBitsPerSecond: 8_000_000 } : undefined
  );
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data);
  };
  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  const draw = (progress: number) => {
    const eased = progress < 0.5 ? 2 * progress * progress : 1 - 2 * (1 - progress) * (1 - progress);
    const zoom = 1 + 0.12 * eased;
    const dw = width * zoom;
    const dh = height * zoom;
    ctx.fillStyle = "#1a1c1e";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(base, (width - dw) / 2, (height - dh) / 2 - progress * height * 0.02, dw, dh);
  };

  recorder.start();
  const startedAt = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = performance.now() - startedAt;
      draw(Math.min(1, elapsed / durationMs));
      if (elapsed < durationMs) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
    // Safety net if frames stall (e.g. hidden tab): never record forever.
    setTimeout(resolve, durationMs + 2000);
  });
  if (recorder.state !== "inactive") recorder.stop();
  await stopped;
  stream.getTracks().forEach((track) => track.stop());

  const blob = new Blob(chunks, { type: mimeType || "video/webm" });
  if (blob.size === 0) throw new Error("video-empty");
  return {
    url: URL.createObjectURL(blob),
    extension: mimeType.includes("mp4") ? "mp4" : "webm",
  };
}
