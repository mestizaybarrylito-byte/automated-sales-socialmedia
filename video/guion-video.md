# Guion — Video showcase "Casa de Brasas: comercio autónomo con IA de Meta"
Duración total: 3:00 min exactos · Narración: inglés (~373 palabras) · Música: épica inspiradora

> Regla del video: solo características reales, código real y funcionalidad real del sistema.
> Visuales: capturas reales de la app + extractos de código del repo. Las imágenes IA son
> solo portada/cierre.

---

## ESCENA 1 — Protagonista / Hook (0:00–0:22, 22s) · Visual: foto real del negocio / portada generada + logo
**Dirección:** Protagonista: Dany, mujer empoderada, latina, robusta, jovial, de 40 años, dueña de Casa de Brasas.
**Narración (EN):**
> "Meet Dany, the owner of Casa de Brasas. Every day, she faces the same challenge:
> answering customer messages on WhatsApp and creating posts for social media takes
> up her entire day. With Meta's AI, she saves time, automates her business, and keeps
> her content always up to date."

## ESCENA 2 — Sistema autónomo (0:22–0:40, 18s) · Visual: plano general de la app / dashboard
**Narración (EN):**
> "Casa de Brasas is a fully autonomous commerce system, where Meta's AI models
> and a team of specialized agents run the entire business — brand, products,
> campaigns, and customer service — from one single place. Let us show you how it works."

## ESCENA 3 — Identidad de marca (0:40–1:00, 20s) · Visual: captura `/identidad`
**Narración (EN):**
> "It all starts with identity. Upload your logo, and the system extracts a six-color
> palette, applies readable high-contrast themes across every page, cascades three
> brand fonts, and stamps your logo as watermark and browser icon. Everything is
> saved to the database."

## ESCENA 4 — Productos con IA (1:00–1:22, 22s) · Visual: captura `/crm/productos` + asistente IA
**Narración (EN):**
> "Adding a new product takes seconds. Muse Spark and Muse Wonder write the
> professional description, suggest the right price, and generate a matching product
> photo. Your CRM catalog becomes the single source of truth for the online store
> and for every campaign. No copy-paste, no manual uploads."

## ESCENA 5 — Estudio de campaña (1:22–1:44, 22s) · Visual: captura wizard tendencias pasos 1 y 3
**Narración (EN):**
> "The campaign studio pulls your real products into step one, styles them with
> presets inspired by Meta AI, and exports each photo with watermark, headline,
> hashtags, and the exact size for every social network. On-brand creatives, ready
> to publish in one click, in minutes, not hours."

## ESCENA 6 — Voice clerk (1:44–2:06, 22s) · Visual: captura `/crm/whatsapp` con transcripción
**Narración (EN):**
> "When a customer sends a voice note on WhatsApp, Muse Voice Transcribe converts
> it to text — any format, resampled to studio quality — and the Voice Clerk drafts
> a grounded reply in seconds, using only your real catalog data. Drafts only:
> nothing is ever sent alone."

## ESCENA 7 — Visión con SAM (2:06–2:22, 16s) · Visual: captura cutout + imagen generada
**Narración (EN):**
> "With SAM image segmentation, any product photo becomes a clean cutout for
> catalogs and ads in seconds, while Muse Image generates fresh campaign visuals
> on demand, always matching your brand style."

## ESCENA 8 — Agentes y skills (2:22–2:44, 22s) · Visual: código real `agents_orig/` + rutas `/api/ai/*`
**Narración (EN):**
> "Behind it all: four custom agents — product creator, campaign artist, voice
> clerk, and photo editor — each with its own skills, orchestrated through the Meta
> Model API. Local-first, server-side keys, honest errors, and every core flow
> covered by automated tests."

## ESCENA 9 — Cierre (2:44–3:00, 16s) · Visual: portada generada + titular + logo
**Narración (EN):**
> "Casa de Brasas: real products, real customers, and Meta AI doing the heavy
> lifting. Autonomous commerce — built, tested, and running today. Dany got her
> time back. Your business can too."

---

## Notas de producción
- Tiempos continuos y sin solapes: 22 + 18 + 20 + 22 + 22 + 22 + 16 + 22 + 16 = 180s (3:00).
- ~373 palabras ≈ 2:40 a 140 wpm; el resto hasta 3:00 son pausas, transiciones y cierre musical.
- Ritmo sugerido: 130–140 wpm, con pausa breve entre escenas.
- Música: pista épica inspiradora a bajo volumen bajo la narración, sube en el cierre (2:44–3:00).
- Código en pantalla: `web/lib/audio-convert.ts` (resampleMono), `web/app/api/ai/voice-note/route.ts`,
  `agents_orig/voice-clerk/`, `web/lib/brand.ts`.
