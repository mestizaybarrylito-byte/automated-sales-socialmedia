# Casa de Brasas — Web prototipo

Premium artisanal meat + homemade sauces e-commerce prototype.
Next.js 14 (App Router) · Tailwind CSS · shadcn-style UI (hand-written) · Supabase-ready.

## Requisitos

- Node.js 18+ y npm (verificado con Node 24 / npm 11)

## Start (exact commands, from repo root)

```powershell
cd web
npm install
npm run dev
```

Then open **http://localhost:3000** in a browser.

Production build check:

```powershell
cd web
npm run build
npm run start
```

## Rutas

- `/` — storefront demo: hero + catálogo de 6 productos placeholder + reglas de lote.
- `/identidad` — identidad corporativa viva: paleta rust/charcoal, tipografía
  serif/sans, fotografía de alto contraste, regla de watermark (demo en vivo) y
  proporción 80/20 core-vs-tendencia.
- `/catalogo` — catálogo en línea con pedidos por WhatsApp (precios placeholder).
- `/crm` — mini CRM mock (clientes, productos, ventas con estado Clip, payloads WhatsApp).
- `/owner` — panel del dueño: KPIs DEMO con Recharts, hub de aprobación de
  campaña, segmentación de clientes y stub del mapa de entregas.
- `/owner/trends` — top 5 tendencias EN VIVO por red (Facebook, Instagram,
  TikTok, WhatsApp, Threads, X) en columnas de tarjetas. Cada tarjeta abre el
  asistente de campaña.
- `/owner/trends/[network]/[trendId]` — asistente guiado en 3 pasos: (1) elegir
  producto del catálogo, (2) editar el prompt en tu idioma (guía la generación, no se dibuja)
  y escribir el texto visible en la imagen, (3) elegir estilo (tira de 5 +
  botón que abre un Drawer con los 53) y generar foto (PNG descargable) o
  video de 5 s, formato por red: FB 1200×630, IG 1080×1350, TikTok 1080×1920,
  WhatsApp 1080×1080, Threads 1080×1350, X 1200×675. Sin API keys: la
  narrativa usa plantillas locales y la imagen se compone en canvas con la foto
  del producto + identidad rust/charcoal + watermark.

## Datos demo

- `data/products.json` — 6 productos placeholder (nombres, precios MXN y
  descripciones marcados `[PLACEHOLDER]`). Slugs:
  `ribeye-al-carbon`, `arrachera-marinada`, `chorizo-artesanal`,
  `salsa-tatemada`, `salsa-macha-premium`, `paquete-asado-familiar`.
- Tendencias en vivo (sin archivo de datos): `lib/trends-live.ts` obtiene temas
  reales del feed público "Trending Now" de Google Trends para el país
  seleccionado (sin API key), con caché de 30 min en servidor. Las páginas
  `/owner/trends*` son dinámicas (`force-dynamic`): si el feed no responde,
  muestran un aviso con reintento en lugar de datos inventados.
- País e idioma: el header de todas las páginas incluye selectores de país
  (21 países con bandera: MX, US, ES, AR, CO, CL, AU, NG, PH, KZ, KE, TR, IE,
  IN, CD, VN, ML, KR, PT, HU, PE) e idioma (13: español, English, Filipino,
  Қазақша, Kiswahili, Türkçe, हिन्दी, Français, Tiếng Việt, Bamanankan,
  한국어, Português, Magyar), persistidos en cookies. El país define el feed
  de tendencias; el idioma define la narrativa/prompt generada y los textos
  del área de tendencias (`lib/settings.ts`, `lib/i18n.ts`). El resto del
  sitio permanece en español.
- Estilos fotográficos: 53 estilos en datos (no en código) renderizados por un
  motor paramétrico de canvas + efectos por píxel (`lib/photo-styles.ts`,
  `lib/campaign-art.ts`), sin APIs externas. Los primeros 5 son los presets
  documentados de Meta AI Restyle (anime, acuarela, 8-bit pixel, ilustrado,
  glowy); el resto extiende las categorías publicadas por Meta (Styles,
  Moods, Lighting, Colors, Backdrops), ya que Meta no publica una lista de
  50 ni una API de estilos. El catálogo activo es dinámico: publica un JSON
  propio (`{ "styles": [...] }`, ver `lib/style-catalog.ts`) y apúntalo con
  `NEXT_PUBLIC_STYLE_CATALOG_URL` para reemplazarlo sin recompilar; si falla,
  se usa el incluido. El video graba el estilo elegido con MediaRecorder
  (`lib/campaign-video.ts`). Nombres de estilo y categoría propios
  universales (un solo idioma).
- Banderas: el selector de país del header muestra iconos de bandera reales
  (flagcdn, con emoji como respaldo sin conexión).

## Si ves «Tendencias no disponibles»

Ese mensaje significa que el servidor no pudo contactar el feed en vivo. Pasos:

1. Mira la terminal donde corre `npm run dev`: el motivo exacto por feed
   aparece como `[trends-live] ...` (p. ej. `HTTP 403`, timeout, error DNS).
   En desarrollo el detalle también se muestra en la propia página.
2. Abre en tu navegador
   `https://trends.google.com/trending/rss?geo=MX`
   - Si ves XML: tu red llega a Google; anota el error del paso 1 y reintenta
     (a veces es un bloqueo temporal anti-bots).
   - Si también falla: tu red, DNS, VPN o proxy bloquea Google Trends; prueba
     otra red o VPN.
3. Override manual: copia `.env.example` a `.env`, define `TRENDS_FEED_MX` /
   `TRENDS_FEED_US` con URLs de feed accesibles desde tu red y reinicia
   `npm run dev` (las variables se leen al arrancar).

## Imágenes

7 fotos gastronómicas generadas (dirección de arte rust/charcoal, alto
contraste, sin texto ni marcas de agua), referenciadas por storefront,
catálogo, identidad y hub de aprobación:

- `public/images/hero.jpg`
- `public/images/products/<slug>.jpg` (uno por slug, 6 en total)

Fotografía real de producto puede reemplazar estos archivos 1:1 antes de
demo pública; nombres de archivo y slugs no cambian.

## Supabase (scaffold)

- `supabase/client.ts` — stub de configuración (falla con mensaje claro si
  faltan env vars). Cliente real + migraciones + Edge Functions en pasos
  posteriores.
- Copiar `.env.example` a `.env` y completar valores cuando aplique.

## Estructura

```text
web/
  app/            # App Router: /, /identidad, /catalogo, /crm/*, /owner, /owner/trends/*
  components/     # site-header/footer, product-card, watermark-demo, owner/*
  components/ui/  # primitives shadcn-style hand-written (button, card, badge)
  content/        # launch-pack.md (pack de lanzamiento legible)
  data/           # products.json (placeholders), content.json (10 piezas)
  lib/            # utils, products, trends, trends-live, settings, i18n, narrative, photo-styles, campaign-art, campaign-video, config, store, content, owner-kpis, whatsapp-catalog
  test/           # trends-live.test.mjs (runner node:test integrado, `npm test`)
  public/images/  # hero.jpg + products/<slug>.jpg (7 fotos)
  supabase/       # client stub + README (migraciones/functions después)
```

## Stack notes

- shadcn CLI no usado (offline-first): primitivos mínimos equivalentes
  escritos a mano en `components/ui/` con `clsx` + `tailwind-merge`.
- Fuentes del sistema (Georgia serif / system sans) para que el build no
  dependa de red (Google Fonts) — cambiar a fuentes brand cuando haya URLs.
