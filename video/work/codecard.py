"""Render a 1280x720 dark code card from REAL repo excerpts for scene 7."""
import pathlib

from PIL import Image, ImageDraw, ImageFont

WORK = pathlib.Path(__file__).resolve().parent
REPO = WORK.parent.parent
FONT = "C:/Windows/Fonts/consola.ttf"

LINES = [
    ("$  agents_orig/", (255, 255, 255)),
    ("   product-creator/  campaign-artist/", (153, 213, 133)),
    ("   voice-clerk/      photo-editor/", (153, 213, 133)),
    ("", (255, 255, 255)),
    ("// web/lib/audio-convert.ts — REAL CODE", (130, 170, 255)),
    ("export const VOICE_SAMPLE_RATE = 16000;", (230, 230, 230)),
    ("resampleMono(mono, decoded.sampleRate,", (230, 230, 230)),
    ("               VOICE_SAMPLE_RATE);", (230, 230, 230)),
    ("", (255, 255, 255)),
    ("// POST /api/ai/voice-note — REAL ROUTE", (130, 170, 255)),
    ("mode: DIARIZATION, model:", (230, 230, 230)),
    ("  muse-voice-transcribe-1.0", (255, 214, 140)),
    ("draft: muse-spark-1.3 + voice-clerk", (255, 214, 140)),
]


def main() -> None:
    img = Image.new("RGB", (1280, 720), (18, 20, 24))
    dr = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT, 34)
    title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 40)
    dr.text((80, 56), "AGENTS + META MODEL API", font=title, fill=(247, 242, 234))
    y = 140
    for text, color in LINES:
        dr.text((80, y), text, font=font, fill=color)
        y += 44
    out = WORK / "codecard.png"
    img.save(out)
    print("wrote", out.name)


if __name__ == "__main__":
    main()
