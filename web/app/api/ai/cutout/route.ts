import { NextRequest, NextResponse } from "next/server";
import { decodeMaskToRaster } from "@meta-sam/parser";
import {
  DEFAULT_SAM_MODEL,
  parseSamRecords,
  sortByAreaDesc,
} from "@/lib/sam-cutout";

export const dynamic = "force-dynamic";

const MODEL_TIMEOUT_MS = 180000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_OBJECTS = 8;
const MAX_MASK_AREA = 1500000;

/**
 * POST /api/ai/cutout
 * Body: { imageDataUrl: string (data:image/...;base64), prompt?: string }
 * Segments the named subject with SAM 3.1 and decodes every mask
 * server-side with the official parser. Answers:
 * `{ frame: {w,h}, objects: [{ box, maskW, maskH, rasterBase64 }] }`
 * where rasterBase64 is maskW*maskH bytes (0/1, row-major) for
 * client-side canvas compositing.
 */
export async function POST(req: NextRequest) {
  let body: { imageDataUrl?: unknown; prompt?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const imageDataUrl = typeof body.imageDataUrl === "string" ? body.imageDataUrl : "";
  const prompt =
    typeof body.prompt === "string" && body.prompt.trim()
      ? body.prompt.trim().slice(0, 80)
      : "dish";
  const dataMatch = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(
    imageDataUrl.replace(/\s+/g, "")
  );
  if (!dataMatch) {
    return NextResponse.json(
      { error: "imageDataUrl must be a jpeg/png/webp data URL" },
      { status: 400 }
    );
  }
  if (Math.round((dataMatch[2].length * 3) / 4) > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "image exceeds 4 MB" }, { status: 400 });
  }

  const baseUrl = process.env.META_MODEL_BASE_URL;
  const apiKey = process.env.META_MODEL_API_KEY;
  const model = process.env.META_MODEL_SAM_NAME || DEFAULT_SAM_MODEL;
  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "segmentation model not configured (META_MODEL_BASE_URL/META_MODEL_API_KEY)" },
      { status: 503 }
    );
  }
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            type: "message",
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              { type: "input_image", image_url: imageDataUrl },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`segmentation HTTP ${res.status}`);
    const payload = (await res.json()) as {
      output?: { type?: string; content?: { type?: string; text?: string }[] }[];
    };
    const text =
      payload.output
        ?.find((i) => i.type === "message")
        ?.content?.find((c) => c.type === "output_text")?.text ?? "";
    const records = parseSamRecords(text);
    if (!records) {
      return NextResponse.json({ frame: null, objects: [], model });
    }
    const objects = [];
    for (const record of sortByAreaDesc(records).slice(0, MAX_OBJECTS)) {
      const area = record.mask.width * record.mask.height;
      if (area <= 0 || area > MAX_MASK_AREA) continue;
      const raster = decodeMaskToRaster({
        encoding: record.mask.encoding,
        payload: record.mask.payload,
        width: record.mask.width,
        height: record.mask.height,
      });
      objects.push({
        box: record.box,
        maskW: record.mask.width,
        maskH: record.mask.height,
        rasterBase64: Buffer.from(raster).toString("base64"),
      });
    }
    console.log(`[cutout] ok model=${model} prompt="${prompt}" objects=${objects.length}`);
    return NextResponse.json({
      frame: { w: records[0].box.frameW, h: records[0].box.frameH },
      objects,
      model,
    });
  } catch (err) {
    console.error("[cutout] failed", err);
    return NextResponse.json({ error: "segmentation failed" }, { status: 502 });
  }
}
