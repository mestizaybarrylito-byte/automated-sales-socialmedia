/**
 * Voice-note core (Muse Voice Transcribe + Spark drafts): transcription
 * parsing and reply-draft prompts for WhatsApp customer service. Pure
 * functions — covered by `npm test`. Drafting follows the voice-clerk
 * agent (agents_orig/voice-clerk).
 */

export const DEFAULT_VOICE_MODEL = "muse-voice-transcribe-1.0";

/** Best-effort extension → audioEncoding label (WAV is the documented one). */
export function audioEncodingFor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    wav: "WAV",
    mp3: "MP3",
    m4a: "M4A",
    aac: "AAC",
    ogg: "OGG",
    oga: "OGG",
    webm: "WEBM",
    mp4: "MP4",
  };
  return map[ext] ?? "WAV";
}

export interface VoiceTurn {
  transcript: string;
  speaker?: string;
}

export interface ParsedTranscript {
  transcript: string;
  durationMs: number;
  turns: VoiceTurn[];
}

/** Parse a /v1/asr/transcribe JSON payload; null when unusable. */
export function parseTranscribeResponse(payload: unknown): ParsedTranscript | null {
  if (!payload || typeof payload !== "object") return null;
  const { transcript, audioDurationMs, turns } = payload as {
    transcript?: unknown;
    audioDurationMs?: unknown;
    turns?: unknown;
  };
  if (typeof transcript !== "string") return null;
  const durationMs =
    typeof audioDurationMs === "number" && Number.isFinite(audioDurationMs)
      ? Math.max(0, Math.round(audioDurationMs))
      : 0;
  const cleanTurns: VoiceTurn[] = [];
  if (Array.isArray(turns)) {
    for (const t of turns) {
      if (!t || typeof t !== "object") continue;
      const { transcript: tt, speaker } = t as { transcript?: unknown; speaker?: unknown };
      if (typeof tt !== "string" || tt.trim().length === 0) continue;
      cleanTurns.push({
        transcript: tt.trim(),
        ...(typeof speaker === "string" && speaker ? { speaker } : {}),
      });
    }
  }
  return { transcript: transcript.trim(), durationMs, turns: cleanTurns };
}

export interface DraftMessage {
  role: "system" | "user";
  content: string;
}

/** Chat messages for the Spark reply draft grounded in the transcript. */
export function buildDraftMessages(
  transcript: string,
  clerkPrompt: string,
  context: string
): DraftMessage[] {
  const system = [
    "You are the Voice Clerk drafting ONE concise WhatsApp reply in Spanish.",
    "Answer strictly from the business context; never invent prices, stock, or delivery terms.",
    "Keep payment links as the placeholder [Clip-Link]; never send — this is a draft.",
    "--- VOICE CLERK SYSTEM PROMPT ---",
    clerkPrompt.slice(0, 6000),
    "--- BUSINESS CONTEXT ---",
    context.slice(0, 4000),
  ].join("\n");
  return [
    { role: "system", content: system },
    { role: "user", content: `Customer voice note transcript:\n${transcript}` },
  ];
}
