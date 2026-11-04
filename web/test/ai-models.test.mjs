/**
 * Maintained test for the multi-model AI cores (lib/campaign-image.ts,
 * lib/voice-note.ts, lib/sam-cutout.ts, and the Wonder tier in
 * lib/product-assist.ts). Runs with the Node built-in runner:
 *
 *   npm test
 *
 * It transpiles the REAL lib sources with the project's own tsc, then
 * checks prompt building, response parsing, and guardrails for Muse
 * Image, Muse Voice Transcribe, SAM 3.1, and Muse Wonder.
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const webDir = path.resolve(import.meta.dirname, "..");
const outDir = path.join(webDir, "node_modules", ".cache", `aimodels-test-${process.pid}`);
let image;
let voice;
let sam;
let assist;
let audio;

after(() => {
  rmSync(outDir, { recursive: true, force: true });
});

before(() => {
  mkdirSync(outDir, { recursive: true });
  const webRequire = createRequire(path.join(webDir, "package.json"));
  const ts = webRequire("typescript");
  const load = (file) => {
    const source = readFileSync(path.join(webDir, "lib", file), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    });
    const js = file.replace(/\.ts$/, ".js");
    writeFileSync(path.join(outDir, js), outputText);
    return createRequire(path.join(outDir, "entry.js"))(`./${js}`);
  };
  image = load("campaign-image.ts");
  voice = load("voice-note.ts");
  sam = load("sam-cutout.ts");
  assist = load("product-assist.ts");
  audio = load("audio-convert.ts");
});

describe("campaignImage", () => {
  it("builds a bounded recipe with dish, style, and negatives", () => {
    const prompt = image.buildImagePrompt({
      productName: "Ribeye al Carbón",
      category: "corte",
      trend: "asado de viernes",
      narrative: "Fuego lento en familia con salsa de la casa.",
      styleId: "anime",
    });
    assert.ok(prompt.includes("Ribeye al Carbón"));
    assert.ok(prompt.includes("cel shading"));
    assert.ok(prompt.includes("No text"));
    assert.ok(prompt.length <= 600);
  });

  it("falls back to food photography for unknown styles", () => {
    assert.ok(image.buildImagePrompt({ productName: "X" }).includes("food photography"));
  });

  it("extracts the generated image from a responses payload", () => {
    const b64 = "a".repeat(200);
    assert.deepEqual(
      image.parseImageResponse({
        output: [
          { type: "reasoning" },
          { type: "image_generation_call", id: "ig_1", result: b64 },
        ],
      }),
      { base64: b64, editId: "ig_1" }
    );
  });

  it("rejects payloads without a finished image", () => {
    assert.equal(image.parseImageResponse({}), null);
    assert.equal(image.parseImageResponse({ output: [{ type: "message" }] }), null);
    assert.equal(
      image.parseImageResponse({ output: [{ type: "image_generation_call", id: "x" }] }),
      null
    );
  });

  it("sniffs webp/png/jpeg magic bytes", () => {
    const webp = Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 1, 2, 3, 4]).toString("base64");
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2]).toString("base64");
    const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]).toString("base64");
    assert.equal(image.sniffImageMime(webp), "image/webp");
    assert.equal(image.sniffImageMime(png), "image/png");
    assert.equal(image.sniffImageMime(jpg), "image/jpeg");
    assert.equal(image.sniffImageMime("!!!!"), "image/webp");
  });
});

describe("voiceNote", () => {
  it("maps audio extensions to encoding labels", () => {
    assert.equal(voice.audioEncodingFor("note.wav"), "WAV");
    assert.equal(voice.audioEncodingFor("note.MP3"), "MP3");
    assert.equal(voice.audioEncodingFor("note.xxx"), "WAV");
  });

  it("parses a transcribe payload with turns", () => {
    assert.deepEqual(
      voice.parseTranscribeResponse({
        sessionId: "s",
        transcript: "Hola, quiero dos ribeyes.",
        audioDurationMs: 8240.4,
        turns: [
          { turnId: 1, transcript: "Hola, quiero dos ribeyes.", speaker: "A" },
          { turnId: 2, transcript: "  " },
        ],
      }),
      {
        transcript: "Hola, quiero dos ribeyes.",
        durationMs: 8240,
        turns: [{ transcript: "Hola, quiero dos ribeyes.", speaker: "A" }],
      }
    );
  });

  it("rejects unusable transcribe payloads", () => {
    assert.equal(voice.parseTranscribeResponse({}), null);
    assert.equal(voice.parseTranscribeResponse({ transcript: 42 }), null);
  });

  it("grounds the reply draft in transcript, clerk, and context", () => {
    const [system, user] = voice.buildDraftMessages("quiero dos", "CLERK-ROLE", "CTX-SHEET");
    assert.equal(system.role, "system");
    assert.ok(system.content.includes("CLERK-ROLE"));
    assert.ok(system.content.includes("CTX-SHEET"));
    assert.ok(user.content.includes("quiero dos"));
  });
});

describe("samCutout", () => {
  const token =
    "<0f>0<|box;x1=10;y1=20;x2=110;y2=120;w=200;h=200|>" +
    "<|mask;x=0;y=0;data=4,5,!!!!!AAAAA|>" +
    "1<|box;x1=0;y1=0;x2=50;y2=60;w=200;h=200|>" +
    "<|mask;x=0;y=0;data=2,3,~xxxx|>";

  it("parses box+mask pairs with encoding detection", () => {
    assert.deepEqual(sam.parseSamRecords(token), [
      {
        box: { x1: 10, y1: 20, x2: 110, y2: 120, frameW: 200, frameH: 200 },
        mask: { encoding: "one_bit", payload: "!!!!!AAAAA", width: 5, height: 4 },
      },
      {
        box: { x1: 0, y1: 0, x2: 50, y2: 60, frameW: 200, frameH: 200 },
        mask: { encoding: "lossless", payload: "~xxxx", width: 3, height: 2 },
      },
    ]);
  });

  it("rejects empty or misaligned output", () => {
    assert.equal(sam.parseSamRecords("no tokens here"), null);
    assert.equal(
      sam.parseSamRecords("<|box;x1=1;y1=1;x2=2;y2=2;w=9;h=9|>"),
      null
    );
  });

  it("sorts largest area first", () => {
    const records = sam.parseSamRecords(token);
    const sorted = sam.sortByAreaDesc(records);
    assert.equal(sorted[0].box.x1, 10);
    assert.equal(sorted[1].box.x1, 0);
  });
});

describe("audioConvert", () => {
  it("encodes a valid 16-bit mono WAV with round-tripping samples", () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1]);
    const wav = audio.encodeWavMono(samples, 16000);
    assert.equal(wav.length, 44 + samples.length * 2);
    const ascii = (at, len) => String.fromCharCode(...wav.slice(at, at + len));
    assert.equal(ascii(0, 4), "RIFF");
    assert.equal(ascii(8, 4), "WAVE");
    assert.equal(ascii(12, 4), "fmt ");
    assert.equal(ascii(36, 4), "data");
    const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
    assert.equal(view.getUint16(22, true), 1); // mono
    assert.equal(view.getUint32(24, true), 16000); // rate
    assert.equal(view.getUint16(34, true), 16); // bits
    const back = [0, 1, 2, 3, 4].map((i) => view.getInt16(44 + i * 2, true));
    assert.deepEqual(back, [0, 16384, -16383, 32767, -32767]);
  });

  it("clamps out-of-range samples", () => {
    const wav = audio.encodeWavMono(new Float32Array([2, -2]), 8000);
    const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
    assert.equal(view.getInt16(44, true), 32767);
    assert.equal(view.getInt16(46, true), -32767);
  });

  it("downmixes channels by averaging", () => {
    assert.deepEqual(
      [...audio.downmixToMono([new Float32Array([1, 0]), new Float32Array([0, 1, 1])])],
      [0.5, 0.5]
    );
    assert.deepEqual([...audio.downmixToMono([])], []);
  });

  it("resamples 48kHz mono down to the 16kHz voice rate", () => {
    assert.equal(audio.VOICE_SAMPLE_RATE, 16000);
    const mono48k = new Float32Array(480);
    for (let i = 0; i < mono48k.length; i++) mono48k[i] = i / mono48k.length;
    const voice = audio.resampleMono(mono48k, 48000, audio.VOICE_SAMPLE_RATE);
    assert.equal(voice.length, 160);
    assert.ok(Math.abs(voice[0] - 0) < 1e-6);
    assert.ok(Math.abs(voice[159] - 159 / 160) < 0.01);
    const wav = audio.encodeWavMono(voice, audio.VOICE_SAMPLE_RATE);
    const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
    assert.equal(view.getUint32(24, true), 16000);
  });

  it("resample keeps equal rates and empties untouched", () => {
    const same = audio.resampleMono(new Float32Array([0.25]), 16000, 16000);
    assert.deepEqual([...same], [0.25]);
    assert.equal(audio.resampleMono(new Float32Array(0), 48000, 16000).length, 0);
  });
});

describe("assistTier", () => {
  it("resolves spark by default and wonder on request", () => {
    assert.equal(assist.resolveAssistModel("spark", {}), "muse-spark-1.3");
    assert.equal(assist.resolveAssistModel("wonder", {}), "muse-wonder-1.0");
    assert.equal(
      assist.resolveAssistModel("wonder", { wonder: "custom-w" }),
      "custom-w"
    );
  });
});
