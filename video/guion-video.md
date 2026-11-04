# Guion — Video showcase "Casa de Brasas: comercio autónomo con IA de Meta"
Duración objetivo: ≤ 3:00 min · Narración: inglés (~400 palabras) · Música: épica inspiradora

> Regla del video: solo características reales, código real y funcionalidad real del sistema.
> Visuales: capturas reales de la app + extractos de código del repo. Las imágenes IA son
> solo portada/cierre.

---

## ESCENA 1 — Hook (0:00–0:20) · Visual: foto real del negocio / portada generada + logo
**Narración (EN):**
> "Meet Casa de Brasas: a fully autonomous commerce system where Meta's AI models
> and a team of specialized agents run the entire business — brand, products,
> campaigns, and customer service — from one place."

## ESCENA 2 — Identidad de marca (0:20–0:45) · Visual: captura `/identidad`
**Narración (EN):**
> "It starts with identity. Upload a logo, and the system extracts a six-color
> palette, applies readable, high-contrast themes across every page, cascades three
> brand fonts, and stamps your logo as watermark and browser icon. All saved to
> the database."

## ESCENA 3 — Productos con IA (0:45–1:10) · Visual: captura `/crm/productos` + asistente IA
**Narración (EN):**
> "Adding a product? Muse Spark and Muse Wonder write the professional
> description, suggest prices, and generate a matching product photo. The CRM catalog
> becomes the single source of truth for the online store and every campaign."

## ESCENA 4 — Estudio de campaña (1:10–1:35) · Visual: captura wizard tendencias pasos 1 y 3
**Narración (EN):**
> "The campaign studio pulls real products into step one, styles them with presets
> inspired by Meta AI, and exports each photo with watermark, headline, hashtag, and
> the exact size for every social network."

## ESCENA 5 — Voice clerk (1:35–2:00) · Visual: captura `/crm/whatsapp` con transcripción
**Narración (EN):**
> "When a customer sends a voice note, Muse Voice Transcribe converts it to text —
> any format, resampled to studio quality — and the Voice Clerk drafts a grounded
> WhatsApp reply in seconds. Drafts only. Nothing is ever sent alone."

## ESCENA 6 — Visión con SAM (2:00–2:20) · Visual: captura cutout + imagen generada
**Narración (EN):**
> "With SAM image segmentation, any product photo becomes a clean cutout for
> catalogs and ads, while Muse Image generates campaign visuals on demand."

## ESCENA 7 — Agentes y skills (2:20–2:42) · Visual: código real `agents_orig/` + rutas `/api/ai/*`
**Narración (EN):**
> "Behind it all: four custom agents — product creator, campaign artist, voice
> clerk, and photo editor — with their own skills, orchestrated through the Meta
> Model API. Local-first, server-side keys, honest errors, and every core covered
> by automated tests."

## ESCENA 8 — Cierre (2:42–3:00) · Visual: portada generada + titular + logo
**Narración (EN):**
> "Casa de Brasas: real products, real customers, and Meta AI doing the heavy
> lifting. Autonomous commerce — built, tested, and running today."

---

## Notas de producción
- ~400 palabras ≈ 2:55 a 140 wpm.
- Música: pista épica inspiradora a bajo volumen bajo la narración.
- Código en pantalla: `web/lib/audio-convert.ts` (resampleMono), `web/app/api/ai/voice-note/route.ts`,
  `agents_orig/voice-clerk/`, `web/lib/brand.ts`.
