/**
 * Audio conversion core: encode mono float samples as 16-bit PCM WAV so
 * any browser-decodable upload (ogg, mp3, m4a, webm) reaches the voice
 * model in its documented WAV encoding. Pure functions — covered by
 * `npm test`. Decoding (AudioContext) stays in the component.
 */

/** Encode mono [-1,1] float samples as a 16-bit PCM WAV file. */
export function encodeWavMono(samples: Float32Array, sampleRate: number): Uint8Array {
  const rate = Math.max(1, Math.floor(sampleRate));
  const dataBytes = samples.length * 2;
  const buf = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buf);
  const writeAscii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(36, "data");
  view.setUint32(40, dataBytes, true);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, Math.round(clamped * 32767), true);
  }
  return new Uint8Array(buf);
}

/** Sample rate the voice model accepts (mono s16le at 16 or 24 kHz). */
export const VOICE_SAMPLE_RATE = 16000;

/** Linear-interpolation resample of mono samples to a target rate. */
export function resampleMono(
  samples: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  const from = Math.max(1, Math.floor(fromRate));
  const to = Math.max(1, Math.floor(toRate));
  if (samples.length === 0) return new Float32Array(0);
  if (from === to) return samples.slice();
  const outLen = Math.max(1, Math.round((samples.length * to) / from));
  const out = new Float32Array(outLen);
  const ratio = from / to;
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const lo = Math.floor(pos);
    const hi = Math.min(samples.length - 1, lo + 1);
    const frac = pos - lo;
    out[i] = samples[lo] * (1 - frac) + samples[hi] * frac;
  }
  return out;
}

/** Average channel sample arrays down to mono (uses the shortest). */
export function downmixToMono(channels: Float32Array[]): Float32Array {
  if (channels.length === 0) return new Float32Array(0);
  if (channels.length === 1) return channels[0].slice();
  const len = Math.min(...channels.map((c) => c.length));
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let sum = 0;
    for (const c of channels) sum += c[i];
    out[i] = sum / channels.length;
  }
  return out;
}
