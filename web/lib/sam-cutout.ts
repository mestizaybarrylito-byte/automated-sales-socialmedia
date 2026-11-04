/**
 * SAM cutout core: parse the special-token segmentation grammar from a
 * /v1/responses output_text lane into box+mask records. Pure functions —
 * covered by `npm test`. Mask raster decoding uses the official
 * @meta-sam/parser decoder in the server route only.
 */

export const DEFAULT_SAM_MODEL = "sam-3.1";

export interface SamBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  frameW: number;
  frameH: number;
}

export type SamMaskEncoding = "lossless" | "one_bit";

export interface SamMaskRef {
  encoding: SamMaskEncoding;
  payload: string;
  width: number;
  height: number;
}

export interface SamRecord {
  box: SamBox;
  mask: SamMaskRef;
}

const BOX_RE =
  /<\|box;x1=(\d+);y1=(\d+);x2=(\d+);y2=(\d+);w=(\d+);h=(\d+)(?:;c=[\d.]+)?\|>/g;
const MASK_RE = /<\|mask;x=0;y=0(?:;c=[\d.]+)?;data=(\d+),(\d+),(.+?)\|>/g;

/**
 * Parse all box+mask pairs in grammar order. Returns null when the text
 * holds no complete pair or boxes and masks do not line up.
 */
export function parseSamRecords(text: string): SamRecord[] | null {
  const boxes = Array.from(text.matchAll(BOX_RE));
  const masks = Array.from(text.matchAll(MASK_RE));
  if (boxes.length === 0 || boxes.length !== masks.length) return null;
  return boxes.map((b, i) => {
    const m = masks[i];
    const payload = m[3];
    return {
      box: {
        x1: Number(b[1]),
        y1: Number(b[2]),
        x2: Number(b[3]),
        y2: Number(b[4]),
        frameW: Number(b[5]),
        frameH: Number(b[6]),
      },
      mask: {
        encoding: payload.startsWith("~") ? "lossless" : "one_bit",
        payload,
        width: Number(m[2]),
        height: Number(m[1]),
      },
    };
  });
}

/** Largest-area record first (the "prefer largest match" brief rule). */
export function sortByAreaDesc(records: SamRecord[]): SamRecord[] {
  return [...records].sort((a, b) => area(b.box) - area(a.box));
}

function area(box: SamBox): number {
  return Math.max(0, box.x2 - box.x1) * Math.max(0, box.y2 - box.y1);
}
