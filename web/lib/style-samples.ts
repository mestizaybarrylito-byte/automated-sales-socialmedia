/**
 * Sample imagery for the style gallery (wizard step 3 + identidad curation).
 *
 * These are Meta's own example photos from https://www.meta.ai/ (the public
 * "create images / edit photos" demo pair: the original ramen bowl and its
 * Meta-AI-edited blue-background version), vendored so the canvas renderer
 * can paint each style's filter/effect over them same-origin. (c) Meta.
 * Each style maps deterministically to one sample, so the wizard strip,
 * the drawer and the identidad curation always agree.
 * Pure data — covered by `npm test`.
 */

export const STYLE_SAMPLE_IMAGES: string[] = [
  "/images/meta-ai/ramen.webp",
  "/images/meta-ai/ramen-blue.webp",
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
