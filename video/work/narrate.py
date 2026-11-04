"""Generate English narration MP3s, one per scene. Needs network (edge-tts)."""
import asyncio
import pathlib

import edge_tts

WORK = pathlib.Path(__file__).resolve().parent
VOICE = "en-US-GuyNeural"
RATE = "+8%"

SCENES = {
    "s1": "Meet Casa de Brasas: a fully autonomous commerce system where Meta's AI models "
    "and a team of specialized agents run the entire business — brand, products, "
    "campaigns, and customer service — from one place.",
    "s2": "It starts with identity. Upload a logo, and the system extracts a six-color "
    "palette, applies readable, high-contrast themes across every page, cascades three "
    "brand fonts, and stamps your logo as watermark and browser icon. All saved to "
    "the database.",
    "s3": "Adding a product? Muse Spark and Muse Wonder write the professional "
    "description, suggest prices, and generate a matching product photo. The CRM catalog "
    "becomes the single source of truth for the online store and every campaign.",
    "s4": "The campaign studio pulls real products into step one, styles them with presets "
    "inspired by Meta AI, and exports each photo with watermark, headline, hashtag, and "
    "the exact size for every social network.",
    "s5": "When a customer sends a voice note, Muse Voice Transcribe converts it to text — "
    "any format, resampled to studio quality — and the Voice Clerk drafts a grounded "
    "WhatsApp reply in seconds. Drafts only. Nothing is ever sent alone.",
    "s6": "With SAM image segmentation, any product photo becomes a clean cutout for "
    "catalogs and ads, while Muse Image generates campaign visuals on demand.",
    "s7": "Behind it all: four custom agents — product creator, campaign artist, voice "
    "clerk, and photo editor — with their own skills, orchestrated through the Meta "
    "Model API. Local-first, server-side keys, honest errors, and every core covered "
    "by automated tests.",
    "s8": "Casa de Brasas: real products, real customers, and Meta AI doing the heavy "
    "lifting. Autonomous commerce — built, tested, and running today.",
}


async def one(key: str, text: str) -> None:
    out = WORK / f"{key}.mp3"
    await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(out))
    print(f"wrote {out.name} ({len(text.split())} words)")


async def main() -> None:
    for key, text in SCENES.items():
        await one(key, text)


if __name__ == "__main__":
    asyncio.run(main())
