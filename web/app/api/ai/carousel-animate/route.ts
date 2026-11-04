import { NextRequest, NextResponse } from "next/server";
import { loadAgentPrompt } from "@/lib/agent-docs";
import { DEFAULT_IMAGE_MODEL, parseImageResponse, sniffImageMime } from "@/lib/campaign-image";
import {
  ANIMATION_FPS,
  DEFAULT_FRAME_COUNT,
  IMAGE_ANIMATION_BRIEFS,
  MAX_FRAME_COUNT,
  buildFramePrompts,
} from "@/lib/carousel-animate";

export const dynamic = "force-dynamic";

const MODEL_TIMEOUT_MS = 180000;

/**
 * POST /api/ai/carousel-animate
 * Body: { imageId: string, frames?: number }
 * Generates a looping frame set for a carousel image with Muse Image,
 * directed by the gif-animator agent (one brief per image id).
 * Answers `{ imageId, fps, frames: [{ imageBase64, mimeType }],
 * prompt, model }` or an honest error (generative features have no
 * local fallback).
 */
export async function POST(req: NextRequest) {
  let body: { imageId?: unknown; frames?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const imageId = typeof body.imageId === "string" ? body.imageId.trim() : "";
  if (!IMAGE_ANIMATION_BRIEFS[imageId]) {
    return NextResponse.json(
      { error: `unknown imageId (expected one of ${Object.keys(IMAGE_ANIMATION_BRIEFS).join(", ")})` },
      { status: 400 }
    );
  }
  const frames =
    typeof body.frames === "number" && Number.isFinite(body.frames)
      ? Math.floor(body.frames)
      : DEFAULT_FRAME_COUNT;
  const framePrompts = buildFramePrompts(imageId, frames);
  if (!framePrompts) {
    return NextResponse.json(
      { error: `frames must be 1-${MAX_FRAME_COUNT}` },
      { status: 400 }
    );
  }

  const baseUrl = process.env.META_MODEL_BASE_URL;
  const apiKey = process.env.META_MODEL_API_KEY;
  const model = process.env.META_MODEL_IMAGE_NAME || DEFAULT_IMAGE_MODEL;
  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "image model not configured (META_MODEL_BASE_URL/META_MODEL_API_KEY)" },
      { status: 503 }
    );
  }
  // Agent direction is part of the audit trail and prepended to each input.
  const direction = loadAgentPrompt("gif-animator");
  const prefix = direction
    ? `Following this art direction: ${direction.split("\n").slice(0, 6).join(" ").slice(0, 400)}\n`
    : "";
  const endpoint = `${baseUrl.replace(/\/$/, "")}/responses`;
  const out: { imageBase64: string; mimeType: string }[] = [];
  for (let i = 0; i < framePrompts.length; i++) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, input: `${prefix}${framePrompts[i]}` }),
        signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`image model HTTP ${res.status}`);
      const parsed = parseImageResponse(await res.json());
      if (!parsed) throw new Error("image model returned no finished image");
      out.push({ imageBase64: parsed.base64, mimeType: sniffImageMime(parsed.base64) });
      console.log(`[carousel-animate] ok image=${imageId} frame=${i + 1}/${framePrompts.length}`);
    } catch (err) {
      console.error(`[carousel-animate] frame ${i + 1}/${framePrompts.length} failed`, err);
      return NextResponse.json(
        { error: `frame ${i + 1}/${framePrompts.length} failed, try again` },
        { status: 502 }
      );
    }
  }
  return NextResponse.json({
    imageId,
    fps: ANIMATION_FPS,
    frames: out,
    prompt: IMAGE_ANIMATION_BRIEFS[imageId].base,
    model,
  });
}
