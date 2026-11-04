"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VOICE_SAMPLE_RATE, downmixToMono, encodeWavMono, resampleMono } from "@/lib/audio-convert";

interface VoiceResult {
  transcript: string;
  durationMs: number;
  turns: { transcript: string; speaker?: string }[];
  draftReply: string;
  model: string;
}

/** Voice-note intake: transcribe + draft a WhatsApp reply (drafts only). */
export function VoiceNoteBox() {
  const [file, setFile] = useState<File | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Decode any upload (ogg, mp3, m4a…) and re-encode as mono WAV. */
  async function convertToWav(source: File): Promise<File> {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error("no-webaudio");
    const ctx = new Ctor();
    try {
      const decoded = await ctx.decodeAudioData(await source.arrayBuffer());
      const channels: Float32Array[] = [];
      for (let c = 0; c < decoded.numberOfChannels; c++) {
        channels.push(decoded.getChannelData(c));
      }
      const mono = downmixToMono(channels);
      if (mono.length === 0) throw new Error("empty");
      const voice = resampleMono(mono, decoded.sampleRate, VOICE_SAMPLE_RATE);
      const wav = encodeWavMono(voice, VOICE_SAMPLE_RATE);
      const copy = new Uint8Array(wav.length);
      copy.set(wav);
      const base = source.name.includes(".")
        ? source.name.slice(0, source.name.lastIndexOf("."))
        : source.name;
      return new File([copy], `${base || "nota"}.wav`, { type: "audio/wav" });
    } finally {
      void ctx.close();
    }
  }

  async function transcribe() {
    if (!file || running) return;
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      let wav: File;
      try {
        wav = await convertToWav(file);
      } catch {
        setError("No se pudo leer el audio. Usa WAV, MP3, OGG o M4A de menos de 8 MB.");
        return;
      }
      const form = new FormData();
      form.append("audio", wav, wav.name);
      const res = await fetch("/api/ai/voice-note", { method: "POST", body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult((await res.json()) as VoiceResult);
    } catch {
      setError(
        "El modelo no pudo transcribir el audio. Revisa que contenga voz e inténtalo de nuevo."
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl">Nota de voz → borrador</CardTitle>
        <p className="font-sans text-sm text-charcoal-800/60">
          Transcribe una nota de voz del cliente y redacta una respuesta de WhatsApp lista para
          revisar. Solo borradores: nada se envía solo.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="audio/*"
            disabled={running}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="font-sans text-sm text-charcoal-800/80"
          />
          <Button onClick={transcribe} disabled={running || !file}>
            {running ? "Transcribiendo…" : "Transcribir y redactar"}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-ember mt-4" role="alert">
            {error}
          </p>
        )}
        {result && (
          <div className="mt-4 grid gap-4">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal-800/60">
                Transcripción ({(result.durationMs / 1000).toFixed(1)}s · {result.model})
              </p>
              <p className="text-sm mt-1">
                {result.transcript || <em className="text-charcoal-800/50">Sin habla detectada</em>}
              </p>
              {result.turns.length > 1 && (
                <ul className="mt-2 grid gap-1 text-sm text-charcoal-800/80">
                  {result.turns.map((turn, i) => (
                    <li key={i}>
                      <strong>{turn.speaker ?? `#${i + 1}`}:</strong> {turn.transcript}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal-800/60">
                Borrador de respuesta
              </p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{result.draftReply}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
