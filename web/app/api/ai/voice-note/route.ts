import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { loadAgentPrompt, loadContextSheet } from "@/lib/agent-docs";
import {
  DEFAULT_VOICE_MODEL,
  audioEncodingFor,
  buildDraftMessages,
  parseTranscribeResponse,
} from "@/lib/voice-note";
import { resolveAssistModel } from "@/lib/product-assist";

export const dynamic = "force-dynamic";

const MODEL_TIMEOUT_MS = 120000;
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

/**
 * POST /api/ai/voice-note (multipart: audio file + optional context)
 * Transcribes a customer voice note with Muse Voice Transcribe, then has
 * Spark draft one WhatsApp reply following the voice-clerk agent.
 * Answers `{ transcript, durationMs, turns, draftReply, model }` or an
 * honest error. Drafts only — nothing is ever sent.
 */
export async function POST(req: NextRequest) {
  const baseUrl = process.env.META_MODEL_BASE_URL;
  const apiKey = process.env.META_MODEL_API_KEY;
  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "voice model not configured (META_MODEL_BASE_URL/META_MODEL_API_KEY)" },
      { status: 503 }
    );
  }
  let audio: File | null = null;
  try {
    const form = await req.formData();
    const part = form.get("audio");
    audio = part instanceof File ? part : null;
  } catch {
    return NextResponse.json({ error: "expected multipart audio file" }, { status: 400 });
  }
  if (!audio || audio.size === 0) {
    return NextResponse.json({ error: "empty audio file" }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "audio exceeds 8 MB" }, { status: 400 });
  }

  const voiceModel = process.env.META_MODEL_VOICE_NAME || DEFAULT_VOICE_MODEL;
  const sessionId = `voice-${randomUUID()}`;
  try {
    const forward = new FormData();
    forward.append(
      "request",
      JSON.stringify({
        mode: "DIARIZATION",
        model: voiceModel,
        audioEncoding: audioEncodingFor(audio.name || "note.wav"),
      })
    );
    forward.append("audio", audio, audio.name || "note.wav");
    const res = await fetch(
      `${baseUrl.replace(/\/$/, "")}/asr/transcribe?sessionId=${sessionId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: forward,
        signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      throw new Error(`transcribe HTTP ${res.status}: ${detail}`);
    }
    const parsed = parseTranscribeResponse(await res.json());
    if (!parsed) throw new Error("transcribe returned no usable transcript");

    // Draft one grounded reply with Spark + the voice-clerk agent.
    const clerk = loadAgentPrompt("voice-clerk");
    const sparkModel = resolveAssistModel("spark", { spark: process.env.META_MODEL_NAME });
    const draftBody = JSON.stringify({
      model: sparkModel,
      messages: buildDraftMessages(parsed.transcript, clerk ?? "", loadContextSheet()),
      temperature: 0.3,
      max_tokens: 2000,
    });
    let draftReply = "";
    for (let attempt = 1; attempt <= 2 && !draftReply; attempt++) {
      const draftRes = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: draftBody,
        signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
      });
      if (!draftRes.ok) {
        const detail = (await draftRes.text()).slice(0, 300);
        throw new Error(`draft HTTP ${draftRes.status}: ${detail}`);
      }
      const draftPayload = (await draftRes.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      draftReply = draftPayload.choices?.[0]?.message?.content?.trim() ?? "";
      if (!draftReply) console.warn(`[voice-note] draft attempt ${attempt} returned no content`);
    }
    if (!draftReply) throw new Error("draft model returned no content");
    console.log(
      `[voice-note] ok model=${voiceModel} durationMs=${parsed.durationMs} ` +
        `turns=${parsed.turns.length} draftChars=${draftReply.length}`
    );
    return NextResponse.json({ ...parsed, draftReply, model: voiceModel });
  } catch (err) {
    console.error("[voice-note] failed", err);
    return NextResponse.json({ error: "voice processing failed" }, { status: 502 });
  }
}
