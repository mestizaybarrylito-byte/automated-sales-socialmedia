import { NextRequest, NextResponse } from "next/server";
import { loadAgentPrompt } from "@/lib/agent-docs";
import {
  DEFAULT_IMAGE_MODEL,
  buildImagePrompt,
  parseImageResponse,
  sniffImageMime,
} from "@/lib/campaign-image";

export const dynamic = "force-dynamic";

const MODEL_TIMEOUT_MS = 180000;

/**
 * POST /api/ai/campaign-image
 * Body: { productName: string, category?: string, trend?: string,
 *         narrative?: string, styleId?: string }
 * Generates a campaign creative with Muse Image, art-directed by the
 * campaign-artist agent. Answers `{ imageBase64, mimeType, editId,
 * prompt, model }` or an honest error (generative features have no
 * local fallback; the canvas renderer remains available in the UI).
 */
export async function POST(req: NextRequest) {
  let body: {
    productName?: unknown;
    category?: unknown;
    trend?: unknown;
    narrative?: unknown;
    styleId?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const productName = typeof body.productName === "string" ? body.productName.trim() : "";
  if (productName.length < 2 || productName.length > 120) {
    return NextResponse.json({ error: "productName must be 2-120 characters" }, { status: 400 });
  }
  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : undefined;
  const prompt = buildImagePrompt({
    productName,
    category: str(body.category, 40),
    trend: str(body.trend, 140),
    narrative: str(body.narrative, 300),
    styleId: str(body.styleId, 40),
  });

  const baseUrl = process.env.META_MODEL_BASE_URL;
  const apiKey = process.env.META_MODEL_API_KEY;
  const model = process.env.META_MODEL_IMAGE_NAME || DEFAULT_IMAGE_MODEL;
  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "image model not configured (META_MODEL_BASE_URL/META_MODEL_API_KEY)" },
      { status: 503 }
    );
  }
  // Agent direction is part of the audit trail and prepended to the input.
  const direction = loadAgentPrompt("campaign-artist");
  const input = direction
    ? `Following this art direction: ${(direction.split("\n").slice(0, 6).join(" ").slice(0, 400))}\n${prompt}`
    : prompt;
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, input }),
      signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`image model HTTP ${res.status}`);
    const parsed = parseImageResponse(await res.json());
    if (!parsed) throw new Error("image model returned no finished image");
    console.log(
      `[campaign-image] ok model=${model} bytes~${Math.round((parsed.base64.length * 3) / 4)}`
    );
    return NextResponse.json({
      imageBase64: parsed.base64,
      mimeType: sniffImageMime(parsed.base64),
      editId: parsed.editId,
      prompt,
      model,
    });
  } catch (err) {
    console.error("[campaign-image] generation failed", err);
    return NextResponse.json(
      { error: "image generation failed, try the canvas render instead" },
      { status: 502 }
    );
  }
}
