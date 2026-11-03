/**
 * Maintained test for the live trends provider (lib/trends-live.ts).
 * Runs with the Node built-in runner, no new dependencies:
 *
 *   npm test
 *
 * It transpiles the REAL lib sources with the project's own tsc into a temp
 * dir, then checks RSS parsing, per-network adaptation and the fetch/caching/
 * failure behavior with fixture feeds and a mocked fetch.
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const webDir = path.resolve(import.meta.dirname, "..");
// Transpile target inside the project (node_modules is gitignored), so the
// test never depends on a writable system temp dir.
const outDir = path.join(webDir, "node_modules", ".cache", `trends-live-test-${process.pid}`);
let live;
let settingsLib;
let i18nLib;
let narrativeLib;
let stylesLib;
let catalogLib;
let samplesLib;
let videoLib;

function rssItem({ title, traffic = null, news = null, cdataTitle = false }) {
  const t = cdataTitle ? `<![CDATA[${title}]]>` : title;
  return (
    `<item><title>${t}</title>` +
    (traffic ? `<ht:approx_traffic>${traffic}</ht:approx_traffic>` : "") +
    (news
      ? `<ht:news_item><ht:news_item_title>${news}</ht:news_item_title><ht:news_item_source>Test</ht:news_item_source></ht:news_item>`
      : "") +
    `<pubDate>Mon, 02 Nov 2026 12:00:00 GMT</pubDate></item>`
  );
}

function rssDoc(items) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0"><channel><title>Daily Search Trends</title>` +
    items.join("") +
    `</channel></rss>`
  );
}

const MX_XML = rssDoc([
  rssItem({
    title: "Clásico Nacional 2026",
    traffic: "50000+",
    news: "Previa: <b>todo</b> lo que debes saber",
  }),
  rssItem({ title: "Frente frío 12", traffic: "20000+", news: "PC emite alerta", cdataTitle: true }),
  rssItem({ title: "Precio del dólar hoy", traffic: "10000+", news: "El peso abre con ganancias" }),
  rssItem({ title: "Concierto gratis Zócalo", traffic: "5000+" }),
  rssItem({ title: "Receta de pan de muerto" }),
  rssItem({ title: "Partido México hoy", traffic: "30000+", news: "Alineaciones confirmadas" }),
  rssItem({ title: "iPhone 18 precio México", traffic: "10000+", news: "Comparativa de precios" }),
  `<item><ht:approx_traffic>10000+</ht:approx_traffic></item>`, // untitled: must be skipped
]);

const US_XML = rssDoc([
  rssItem({ title: "World Series Game 7", traffic: "200000+", news: "Final score and highlights" }),
  rssItem({ title: "Election results Nevada", traffic: "100000+", news: "Live county updates" }),
  rssItem({ title: "Clásico Nacional 2026", traffic: "50000+", news: "Match preview" }), // dup of MX
  rssItem({ title: "Black Friday deals", traffic: "100000+", news: "Best early discounts" }),
  rssItem({ title: "New Marvel movie trailer", traffic: "50000+", news: "Trailer breakdown" }),
  rssItem({ title: "Powerball jackpot", traffic: "100000+", news: "Winning numbers" }),
  rssItem({ title: "Daylight saving time ends", traffic: "20000+", news: "When clocks change" }),
]);

const realFetch = globalThis.fetch;
after(() => {
  globalThis.fetch = realFetch;
  rmSync(outDir, { recursive: true, force: true });
});

before(() => {
  // Transpile-only (no module resolution needed): typechecking is covered by
  // `next build`. All lib imports here are relative or `import type`, so the
  // emitted JS runs standalone.
  mkdirSync(outDir, { recursive: true });
  const webRequire = createRequire(path.join(webDir, "package.json"));
  const ts = webRequire("typescript");
  for (const file of ["trends.ts", "trends-live.ts", "settings.ts", "i18n.ts", "narrative.ts", "brand.ts", "photo-styles.ts", "style-catalog.ts", "style-samples.ts", "campaign-video.ts"]) {
    const source = readFileSync(path.join(webDir, "lib", file), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    });
    writeFileSync(path.join(outDir, file.replace(/\.ts$/, ".js")), outputText);
  }
  const compiledRequire = createRequire(path.join(outDir, "entry.js"));
  live = compiledRequire("./trends-live.js");
  settingsLib = compiledRequire("./settings.js");
  i18nLib = compiledRequire("./i18n.js");
  narrativeLib = compiledRequire("./narrative.js");
  stylesLib = compiledRequire("./photo-styles.js");
  catalogLib = compiledRequire("./style-catalog.js");
  samplesLib = compiledRequire("./style-samples.js");
  videoLib = compiledRequire("./campaign-video.js");
});

describe("parseTrendsRss", () => {
  it("extracts titles, traffic and news; strips CDATA/tags; skips untitled", () => {
    const items = live.parseTrendsRss(MX_XML, "México");
    assert.equal(items.length, 7);
    assert.equal(items[0].title, "Clásico Nacional 2026");
    assert.equal(items[0].traffic, "50000+");
    assert.equal(items[0].newsTitle, "Previa: todo lo que debes saber");
    assert.equal(items[1].title, "Frente frío 12");
    assert.equal(items[4].traffic, null);
    assert.equal(items[4].newsTitle, null);
    assert.ok(items.every((i) => i.geoLabel === "México"));
  });
});

describe("buildTrendsFromItems", () => {
  function combined() {
    return [
      ...live.parseTrendsRss(MX_XML, "México"),
      ...live.parseTrendsRss(US_XML, "EE. UU."),
    ];
  }

  it("builds top 5 per network with ranks 1-5", () => {
    const trends = live.buildTrendsFromItems(combined());
    assert.equal(trends.length, 30);
    for (const net of ["facebook", "instagram", "tiktok", "whatsapp", "threads", "x"]) {
      const ranks = trends.filter((t) => t.network === net).map((t) => t.rank);
      assert.deepEqual(ranks, [1, 2, 3, 4, 5]);
    }
  });

  it("derives every field from live items, dedupes and keeps stable ids", () => {
    const trends = live.buildTrendsFromItems(combined());
    // 7 MX + 7 US minus 1 duplicate title = 13 distinct real topics.
    assert.equal(new Set(trends.map((t) => t.title)).size, 13);
    for (const t of trends) {
      assert.match(t.hashtag, /^#[^\s]+$/u);
      assert.ok(t.title.length > 0 && t.summary.length > 0);
      assert.ok(t.volume.length > 0 && t.promptHint.length > 0);
      assert.ok(t.visualStyle.includes("rust/charcoal"));
    }
    for (const net of ["facebook", "instagram", "tiktok", "whatsapp", "threads", "x"]) {
      const ids = trends.filter((t) => t.network === net).map((t) => t.id);
      assert.equal(new Set(ids).size, 5);
    }
    const again = live.buildTrendsFromItems(combined());
    assert.deepEqual(
      again.map((t) => t.id),
      trends.map((t) => t.id)
    );
  });

  it("uses real traffic/news when present, honest labels when absent", () => {
    const trends = live.buildTrendsFromItems(combined());
    const clasico = trends.find((t) => t.title === "Clásico Nacional 2026");
    assert.equal(clasico.volume, "50000+ búsquedas");
    assert.ok(clasico.summary.includes("Previa: todo lo que debes saber"));
    assert.ok(clasico.summary.includes("México"));
    const receta = trends.find((t) => t.title === "Receta de pan de muerto");
    assert.equal(receta.volume, "En tendencia hoy");
    assert.ok(receta.summary.includes("México"));
  });

  it("throws when there are no live items", () => {
    assert.throws(() => live.buildTrendsFromItems([]), /No hay temas en vivo/);
  });
});

describe("fetchLiveTrends", () => {
  it("fetches the selected country feed with browser headers", async () => {
    live.clearTrendsCache();
    let calls = 0;
    let seenHeaders = null;
    let seenUrl = "";
    globalThis.fetch = async (url, init) => {
      calls += 1;
      seenHeaders = init?.headers;
      seenUrl = String(url);
      return { ok: true, text: async () => MX_XML };
    };
    try {
      const { trends, sources } = await live.fetchLiveTrends("MX", "es");
      assert.equal(trends.length, 30);
      assert.deepEqual(sources, ["México"]);
      assert.ok(seenUrl.includes("geo=MX"));
      assert.ok(String(seenHeaders?.["User-Agent"]).includes("Mozilla"));
      assert.ok(String(seenHeaders?.Accept).includes("application/rss+xml"));
      assert.equal(calls, 1);
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it("caches per country+locale and localizes content", async () => {
    live.clearTrendsCache();
    let calls = 0;
    globalThis.fetch = async (url) => {
      calls += 1;
      const xml = String(url).includes("geo=MX") ? MX_XML : US_XML;
      return { ok: true, text: async () => xml };
    };
    try {
      const mx = await live.fetchLiveTrends("MX", "es");
      assert.deepEqual(mx.sources, ["México"]);
      assert.ok(mx.trends[0].volume.includes("búsquedas"));
      await live.fetchLiveTrends("MX", "es");
      assert.equal(calls, 1); // cache hit
      const us = await live.fetchLiveTrends("US", "es");
      assert.deepEqual(us.sources, ["Estados Unidos"]);
      const en = await live.fetchLiveTrends("MX", "en");
      assert.deepEqual(en.sources, ["Mexico"]);
      assert.ok(en.trends[0].volume.includes("searches"));
      assert.ok(en.trends[0].summary.includes("Mexico"));
      assert.equal(calls, 3); // one fetch per distinct country+locale
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it("falls back to MX for unknown countries", async () => {
    live.clearTrendsCache();
    let seenUrl = "";
    globalThis.fetch = async (url) => {
      seenUrl = String(url);
      return { ok: true, text: async () => MX_XML };
    };
    try {
      const { sources } = await live.fetchLiveTrends("XX", "es");
      assert.ok(seenUrl.includes("geo=MX"));
      assert.deepEqual(sources, ["México"]);
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it("honors per-country TRENDS_FEED_<CODE> overrides", async () => {
    live.clearTrendsCache();
    let seenUrl = "";
    globalThis.fetch = async (url) => {
      seenUrl = String(url);
      return { ok: true, text: async () => MX_XML };
    };
    const prev = process.env.TRENDS_FEED_MX;
    process.env.TRENDS_FEED_MX = "https://example.test/mx.xml";
    try {
      await live.fetchLiveTrends("MX", "es");
      assert.equal(seenUrl, "https://example.test/mx.xml");
    } finally {
      globalThis.fetch = realFetch;
      if (prev === undefined) delete process.env.TRENDS_FEED_MX;
      else process.env.TRENDS_FEED_MX = prev;
    }
  });

  it("throws honestly in the requested language when offline", async () => {
    live.clearTrendsCache();
    globalThis.fetch = async () => {
      throw new Error("offline");
    };
    try {
      await assert.rejects(live.fetchLiveTrends("MX", "es"), /en vivo/);
      await assert.rejects(live.fetchLiveTrends("US", "en"), /Could not load live trends/);
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it("throws when the feed responds with no topics", async () => {
    live.clearTrendsCache();
    globalThis.fetch = async () => ({ ok: true, text: async () => "<rss></rss>" });
    try {
      await assert.rejects(live.fetchLiveTrends("MX", "es"), /0 items/);
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});

describe("settings", () => {
  it("parses valid settings and falls back on unknown values", () => {
    assert.deepEqual(
      settingsLib.parseSettings({ country: "ES", locale: "en" }),
      { country: "ES", locale: "en" }
    );
    assert.deepEqual(settingsLib.parseSettings({}), { country: "MX", locale: "es" });
    assert.deepEqual(
      settingsLib.parseSettings({ country: "XX", locale: "xx" }),
      { country: "MX", locale: "es" }
    );
  });

  it("names countries in the requested language", () => {
    assert.equal(settingsLib.countryName("MX", "es"), "México");
    assert.equal(settingsLib.countryName("MX", "en"), "Mexico");
    assert.equal(settingsLib.countryName("XX", "es"), "XX");
  });

  it("ships 13 locales and 21 flagged countries with complete names", () => {
    assert.equal(settingsLib.LOCALES.length, 13);
    assert.equal(settingsLib.COUNTRIES.length, 21);
    assert.equal(new Set(settingsLib.COUNTRIES.map((c) => c.code)).size, 21);
    for (const country of settingsLib.COUNTRIES) {
      assert.ok(country.flag, `${country.code} has a flag`);
      for (const locale of settingsLib.LOCALES) {
        assert.ok(country.name[locale.id], `${country.code}.${locale.id}`);
      }
    }
    for (const locale of settingsLib.LOCALES) {
      assert.ok(locale.label, `${locale.id} has a label`);
      assert.ok(locale.tag, `${locale.id} has an Intl tag`);
    }
  });
});

describe("i18n", () => {
  function keysDeep(obj, prefix = "") {
    const out = [];
    for (const [k, v] of Object.entries(obj)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) out.push(...keysDeep(v, p));
      else out.push(`${p}:${Array.isArray(v) ? `array[${v.length}]` : typeof v}`);
    }
    return out.sort();
  }

  it("exposes identical keys in every locale", () => {
    const base = keysDeep(i18nLib.strings.es);
    assert.ok(Object.keys(i18nLib.strings).length >= 13);
    for (const id of Object.keys(i18nLib.strings)) {
      assert.deepEqual(keysDeep(i18nLib.strings[id]), base, id);
    }
  });
});

describe("narrative", () => {
  const fakeTrend = {
    title: "Clásico Nacional 2026",
    hashtag: "#ClasicoNacional2026",
    visualStyle: "flatlay",
  };
  const fakeProduct = { name: "[PLACEHOLDER] Ribeye al Carbón", category: "corte" };

  it("builds the prompt in the requested language", () => {
    const esText = narrativeLib.buildNarrative(fakeTrend, fakeProduct, "instagram", "es");
    assert.ok(esText.includes("Fotografía gastronómica"));
    assert.ok(esText.includes("Ribeye al Carbón"));
    assert.ok(!esText.includes("[PLACEHOLDER]"));
    const enText = narrativeLib.buildNarrative(fakeTrend, fakeProduct, "instagram", "en");
    assert.ok(enText.includes("High-contrast food photography"));
    assert.ok(!enText.includes("Fotografía"));
    assert.ok(
      narrativeLib.buildNarrative(fakeTrend, fakeProduct, "tiktok", "fr").includes("Photographie gastronomique")
    );
    assert.ok(
      narrativeLib.buildNarrative(fakeTrend, fakeProduct, "tiktok", "ko").includes("음식 사진")
    );
    assert.ok(
      narrativeLib.buildNarrative(fakeTrend, fakeProduct, "tiktok", "hi").includes("फ़ूड फ़ोटोग्राफी")
    );
  });

  it("builds the caption in the requested language", () => {
    assert.ok(
      narrativeLib.buildCaption(fakeTrend, fakeProduct, "es").includes("Pedido por lote")
    );
    assert.ok(
      narrativeLib.buildCaption(fakeTrend, fakeProduct, "en").includes("Batch order")
    );
  });

  it("carries the active company name, defaulting to Casa de Brasas", () => {
    const branded = narrativeLib.buildNarrative(
      fakeTrend,
      fakeProduct,
      "instagram",
      "es",
      "Parrilla El Faro"
    );
    assert.ok(branded.includes("Parrilla El Faro"));
    assert.ok(!branded.includes("Casa de Brasas"));
    const fallback = narrativeLib.buildNarrative(fakeTrend, fakeProduct, "instagram", "es");
    assert.ok(fallback.includes("Casa de Brasas"));
  });
});

describe("photoStyles", () => {
  it("ships 53 fully-specified styles with the 5 Meta presets first", () => {
    const styles = stylesLib.PHOTO_STYLES;
    assert.equal(styles.length, 53);
    assert.deepEqual(
      styles.slice(0, 5).map((s) => s.id),
      ["anime", "watercolor", "8bit", "illustrated", "glowy"]
    );
    assert.equal(new Set(styles.map((s) => s.id)).size, 53);
    assert.deepEqual(stylesLib.STYLE_CATEGORIES, [
      "featured",
      "styles",
      "moods",
      "lighting",
      "colors",
      "backdrops",
    ]);
    // The featured group is exactly the first five, in order.
    assert.deepEqual(
      styles.filter((s) => s.category === "featured").map((s) => s.id),
      ["anime", "watercolor", "8bit", "illustrated", "glowy"]
    );
    // Documented Meta Restyle names beyond the first five.
    const byId = new Map(styles.map((s) => [s.id, s]));
    assert.equal(byId.get("render3d").name, "3D Avatar");
    assert.equal(byId.get("ethereal").name, "Ethereal Light");
    assert.equal(byId.get("cooltones").name, "Cool Tones");
    assert.equal(byId.get("pinktones").name, "Pink Tones");
    assert.equal(byId.get("beach").name, "Beach Day");
    assert.equal(byId.get("city").name, "City Lights");
    // Requested drawer names.
    for (const name of [
      "3D Avatar",
      "Doodle Photo",
      "Acrylic",
      "Felt Art",
      "Tarot Letter",
      "Marble Statue",
      "Aerial View",
    ]) {
      assert.ok(styles.some((s) => s.name === name), `drawer shows ${name}`);
    }
    const kinds = new Set([
      "none",
      "sharpen",
      "anime",
      "surreal",
      "fantasy",
      "pop",
      "watercolor",
      "pixel",
      "threshold",
      "emboss",
      "mosaic",
      "solarize",
      "duotone",
      "thermal",
      "neon",
      "grain",
      "soft",
      "halftone",
      "tiltshift",
      "doodle",
    ]);
    for (const s of styles) {
      assert.equal(typeof s.name, "string", `${s.id}.name`);
      assert.ok(s.name.length > 0);
      for (const key of [
        "filter",
        "shadeTop",
        "shadeMid",
        "shadeBottom",
        "accent",
        "titleColor",
        "hashtagColor",
        "bodyColor",
        "footerColor",
      ]) {
        assert.equal(typeof s[key], "string", `${s.id}.${key}`);
      }
      assert.ok(s.tint === null || typeof s.tint === "string");
      assert.ok(s.effect && kinds.has(s.effect.kind), `${s.id}.effect`);
      assert.ok(s.frame === undefined || s.frame === "tarot", `${s.id}.frame`);
      assert.ok(stylesLib.STYLE_CATEGORIES.includes(s.category), `${s.id}.category`);
    }
    // The catalog exercises the parametric engine broadly (new halftone
    // print dots, palette duotones, neon edges, plain filter/tint looks).
    const used = new Set(styles.map((s) => s.effect.kind));
    for (const kind of ["anime", "watercolor", "pixel", "fantasy", "halftone", "duotone", "neon", "none", "tiltshift", "doodle"]) {
      assert.ok(used.has(kind), `catalog uses ${kind}`);
    }
    assert.equal(stylesLib.getPhotoStyle("unknown-id").id, styles[0].id);
    assert.equal(stylesLib.getPhotoStyleFrom(styles, "glowy").id, "glowy");
    assert.equal(stylesLib.getPhotoStyleFrom(styles, "unknown-id").id, styles[0].id);
    assert.equal(stylesLib.getPhotoStyleFrom([], "unknown-id").id, "anime");
    assert.equal(stylesLib.DEFAULT_STYLE_ID, "anime");
  });

  it("pins Meta's documented presets under the step-3 photo style", () => {
    assert.deepEqual(stylesLib.STEP3_STYLE_IDS, [
      "anime",
      "watercolor",
      "8bit",
      "illustrated",
      "glowy",
    ]);
    assert.deepEqual(
      stylesLib.getStep3Styles(stylesLib.PHOTO_STYLES).map((s) => s.name),
      ["Anime", "Watercolor", "8-Bit Pixel", "Illustrated", "Glowy"]
    );
    // Brand-curated pins come first, filled up to five with catalog order.
    assert.deepEqual(
      stylesLib.getStep3Styles(stylesLib.PHOTO_STYLES, ["felt", "tarot"]).map((s) => s.id),
      ["felt", "tarot", "anime", "watercolor", "8bit"]
    );
    // Unknown pins resolve to the catalog's first five.
    assert.deepEqual(
      stylesLib.getStep3Styles(stylesLib.PHOTO_STYLES, ["nope"]).map((s) => s.id),
      ["anime", "watercolor", "8bit", "illustrated", "glowy"]
    );
    // A remote catalog without the pins falls back to its first entries.
    assert.deepEqual(
      stylesLib.getStep3Styles([{ id: "a" }, { id: "b" }]).map((s) => s.id),
      ["a", "b"]
    );
    assert.deepEqual(
      stylesLib.getStep3Styles([{ id: "felt" }]).map((s) => s.id),
      ["felt"]
    );
  });
});

describe("styleSamples", () => {
  it("maps every style deterministically onto real sample photos", () => {
    const images = samplesLib.STYLE_SAMPLE_IMAGES;
    assert.ok(images.length >= 2);
    assert.equal(new Set(images).size, images.length);
    for (const src of images) {
      assert.match(src, /^\/images\/samples\/.+\.jpg$/);
      assert.ok(existsSync(path.join(webDir, "public", src.slice(1))), src);
    }
    for (const style of stylesLib.PHOTO_STYLES) {
      const first = samplesLib.sampleImageForStyle(style.id);
      assert.ok(images.includes(first), style.id);
      assert.equal(samplesLib.sampleImageForStyle(style.id), first);
    }
    // The catalog spreads across every sample (no dead image).
    const used = new Set(stylesLib.PHOTO_STYLES.map((s) => samplesLib.sampleImageForStyle(s.id)));
    assert.equal(used.size, images.length);
  });
});

describe("styleCatalog", () => {
  const good = {
    id: "custom",
    name: "Custom",
    filter: "saturate(1.2)",
    tint: null,
    effect: { kind: "duotone", dark: "#111111", light: "#eeeeee" },
  };

  it("parses wrapped and bare catalog documents with defaults", () => {
    for (const doc of [{ styles: [good] }, [good]]) {
      const parsed = catalogLib.parseStyleCatalog(doc);
      assert.equal(parsed.length, 1);
      assert.equal(parsed[0].id, "custom");
      assert.equal(parsed[0].category, "styles");
      assert.equal(typeof parsed[0].shadeTop, "string");
      assert.equal(typeof parsed[0].accent, "string");
    }
  });

  it("rejects unusable documents", () => {
    for (const doc of [null, 42, "styles", {}, { styles: [] }, [], { styles: {} }]) {
      assert.equal(catalogLib.parseStyleCatalog(doc), null, JSON.stringify(doc));
    }
  });

  it("drops invalid entries and duplicate ids, keeps the valid ones", () => {
    const parsed = catalogLib.parseStyleCatalog({
      styles: [
        good,
        { ...good, id: "custom" }, // duplicate: dropped
        { ...good, id: "bad-kind", effect: { kind: "warp-drive" } },
        { ...good, id: "bad-param", effect: { kind: "neon", edge: "lots", color: "#fff" } },
        { ...good, id: "bad-frame", frame: "gold" },
        { ...good, id: "bad-category", category: "vibes" },
        { ...good, id: "", name: "" },
        "not-an-entry",
      ],
    });
    assert.deepEqual(
      parsed.map((s) => s.id),
      ["custom"]
    );
  });

  it("returns null when every entry is invalid", () => {
    assert.equal(
      catalogLib.parseStyleCatalog([{ ...good, id: "x", effect: { kind: "nope" } }]),
      null
    );
  });

  it("loads the bundled catalog when no URL is configured", async () => {
    catalogLib.resetStyleCatalogCache();
    const prev = process.env.NEXT_PUBLIC_STYLE_CATALOG_URL;
    delete process.env.NEXT_PUBLIC_STYLE_CATALOG_URL;
    try {
      assert.equal(await catalogLib.loadPhotoStyles(), stylesLib.PHOTO_STYLES);
    } finally {
      if (prev !== undefined) process.env.NEXT_PUBLIC_STYLE_CATALOG_URL = prev;
    }
  });

  it("loads a published catalog, falls back on failure", async () => {
    catalogLib.resetStyleCatalogCache();
    const prev = process.env.NEXT_PUBLIC_STYLE_CATALOG_URL;
    process.env.NEXT_PUBLIC_STYLE_CATALOG_URL = "https://example.test/styles.json";
    let seenUrl = "";
    globalThis.fetch = async (url) => {
      seenUrl = String(url);
      return { ok: true, json: async () => ({ styles: [good] }) };
    };
    try {
      const remote = await catalogLib.loadPhotoStyles();
      assert.equal(seenUrl, "https://example.test/styles.json");
      assert.deepEqual(
        remote.map((s) => s.id),
        ["custom"]
      );
    } finally {
      globalThis.fetch = realFetch;
    }
    for (const impl of [
      async () => {
        throw new Error("offline");
      },
      async () => ({ ok: false, status: 404 }),
      async () => ({ ok: true, json: async () => ({ styles: [] }) }),
    ]) {
      catalogLib.resetStyleCatalogCache();
      globalThis.fetch = impl;
      try {
        assert.equal(await catalogLib.loadPhotoStyles(), stylesLib.PHOTO_STYLES);
      } finally {
        globalThis.fetch = realFetch;
      }
    }
    if (prev === undefined) delete process.env.NEXT_PUBLIC_STYLE_CATALOG_URL;
    else process.env.NEXT_PUBLIC_STYLE_CATALOG_URL = prev;
  });
});

describe("videoDims", () => {
  it("caps the longest side at 1280 with even sizes", () => {
    assert.deepEqual(videoLib.videoDims(1080, 1920), { width: 720, height: 1280 });
    assert.deepEqual(videoLib.videoDims(1200, 630), { width: 1200, height: 630 });
    assert.deepEqual(videoLib.videoDims(1080, 1350), { width: 1024, height: 1280 });
  });
});
