import { NextRequest, NextResponse } from "next/server";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const MAX_PNG_BYTES = 3 * 1024 * 1024;

/**
 * POST /api/ai/save-cutout
 * Body: { slug: string, pngBase64: string, kind?: "cutout" | "product" }
 * Persists a client-composited PNG under
 * public/images/products/<slug>[-cutout].png and answers `{ path }`.
 * Dev/studio helper: strict slug charset, PNG magic check, size cap.
 */
export async function POST(req: NextRequest) {
  let body: { slug?: unknown; pngBase64?: unknown; kind?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const kind = body.kind === "product" ? "product" : "cutout";
  const slug = typeof body.slug === "string" ? body.slug : "";
  const pngBase64 = typeof body.pngBase64 === "string" ? body.pngBase64 : "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  let bytes: Buffer;
  try {
    bytes = Buffer.from(pngBase64, "base64");
  } catch {
    return NextResponse.json({ error: "invalid base64" }, { status: 400 });
  }
  if (
    bytes.length === 0 ||
    bytes.length > MAX_PNG_BYTES ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47
  ) {
    return NextResponse.json({ error: "not a PNG under 3 MB" }, { status: 400 });
  }
  try {
    const dir = path.resolve(process.cwd(), "public", "images", "products");
    mkdirSync(dir, { recursive: true });
    const filename = kind === "product" ? `${slug}.png` : `${slug}-cutout.png`;
    writeFileSync(path.join(dir, filename), bytes);
    const publicPath = `/images/products/${filename}`;
    console.log(`[save-cutout] ok ${publicPath} bytes=${bytes.length}`);
    return NextResponse.json({ path: publicPath });
  } catch (err) {
    console.error("[save-cutout] failed", err);
    return NextResponse.json({ error: "could not save cutout" }, { status: 500 });
  }
}
