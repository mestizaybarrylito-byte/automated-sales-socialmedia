/**
 * Sample imagery for the identidad style gallery (drawer + pinned strip).
 *
 * Bright, vivid, daylight food photography — deliberately NOT the dark
 * moody catalog shots — so every style thumbnail reads at a glance, in the
 * spirit of a multimedia style gallery. Each style maps deterministically
 * to one sample, so the strip and the drawer always agree.
 * Pure data — covered by `npm test`.
 */

export const STYLE_SAMPLE_IMAGES: string[] = [
  "/images/samples/tacos-al-pastor.jpg",
  "/images/samples/elotes.jpg",
  "/images/samples/salsas-trio.jpg",
  "/images/samples/arrachera-dia.jpg",
  "/images/samples/verduras-asadas.jpg",
  "/images/samples/queso-fundido.jpg",
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Deterministic sample image for a style id (stable across renders). */
export function sampleImageForStyle(styleId: string): string {
  if (STYLE_SAMPLE_IMAGES.length === 0) return "";
  return STYLE_SAMPLE_IMAGES[hashId(styleId) % STYLE_SAMPLE_IMAGES.length];
}
