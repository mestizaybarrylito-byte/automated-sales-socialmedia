/**
 * Live trends provider (server-only).
 *
 * Fetches REAL trending topics from the public Google Trends "Trending Now"
 * RSS feed for the SELECTED country (no API key needed) and adapts them into
 * per-network campaign trends in the SELECTED language. No trend content is
 * hardcoded: titles, traffic, hashtags, summaries and ids are all derived
 * from the live feed items at request time.
 *
 * Only relative imports in this module: `npm test` exercises it through plain
 * tsc transpilation, without the Next bundler.
 */
import type { NetworkMeta, Trend } from "./trends";
import { NETWORKS } from "./trends";
import type { Locale } from "./settings";
import { COUNTRIES, DEFAULT_COUNTRY, countryName, localeTag } from "./settings";

export interface FeedItem {
  title: string;
  traffic: string | null;
  newsTitle: string | null;
  geoLabel: string;
}

const FEED_URL = (code: string) => `https://trends.google.com/trending/rss?geo=${code}`;

/** Feed URL can be overridden per country without code changes (see .env.example). */
function resolveFeedUrl(code: string): string {
  return process.env[`TRENDS_FEED_${code}`] || FEED_URL(code);
}

function validCountry(code: string): string {
  return COUNTRIES.some((c) => c.code === code) ? code : DEFAULT_COUNTRY;
}

/**
 * Browser-like headers: Google endpoints often reject the default
 * server fetch user-agent with 403, which surfaces as "no live trends".
 */
function requestHeaders(locale: Locale): Record<string, string> {
  const tag = localeTag(locale);
  const base = tag.split("-")[0];
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
    "Accept-Language":
      base === "en" ? `${tag},en;q=0.9,es;q=0.7` : `${tag},${base};q=0.9,en;q=0.7`,
  };
}

const STRINGS: Record<
  Locale,
  {
    searches: (traffic: string) => string;
    trendingToday: string;
    summaryWithNews: (news: string, geo: string) => string;
    summaryPlain: (geo: string) => string;
    visualStyle: (canvas: string, title: string) => string;
    hashtagFallback: (rank: number) => string;
    emptyPool: string;
    emptyResponse: string;
    fetchFailed: (detail: string) => string;
  }
> = {
  es: {
    searches: (traffic) => `${traffic} búsquedas`,
    trendingToday: "En tendencia hoy",
    summaryWithNews: (news, geo) => `${news} — entre lo más buscado hoy en ${geo}.`,
    summaryPlain: (geo) => `Entre los temas más buscados hoy en ${geo}.`,
    visualStyle: (canvas, title) =>
      `Pieza ${canvas} sobre «${title}»: fotografía gastronómica de alto contraste, paleta rust/charcoal cálida, sin neones.`,
    hashtagFallback: (rank) => `Tendencia${rank}`,
    emptyPool: "No hay temas en vivo para construir tendencias.",
    emptyResponse: "respuesta sin temas (0 items)",
    fetchFailed: (detail) => `No se pudieron cargar las tendencias en vivo (${detail}).`,
  },
  en: {
    searches: (traffic) => `${traffic} searches`,
    trendingToday: "Trending today",
    summaryWithNews: (news, geo) => `${news} — among today's top searches in ${geo}.`,
    summaryPlain: (geo) => `Among today's most searched topics in ${geo}.`,
    visualStyle: (canvas, title) =>
      `${canvas} piece on "${title}": high-contrast food photography, warm rust/charcoal palette, no neons.`,
    hashtagFallback: (rank) => `Trend${rank}`,
    emptyPool: "No live topics to build trends from.",
    emptyResponse: "response with no topics (0 items)",
    fetchFailed: (detail) => `Could not load live trends (${detail}).`,
  },
  fil: {
    searches: (traffic) => `${traffic} paghahanap`,
    trendingToday: "Trending ngayon",
    summaryWithNews: (news, geo) => `${news} — kabilang sa pinakahinahanap ngayon sa ${geo}.`,
    summaryPlain: (geo) => `Kabilang sa mga pinakahinahanap na paksa ngayon sa ${geo}.`,
    visualStyle: (canvas, title) =>
      `${canvas} na piraso tungkol sa «${title}»: mataas na contrast na food photography, mainit na rust/charcoal palette, walang neon.`,
    hashtagFallback: (rank) => `Trend${rank}`,
    emptyPool: "Walang live na paksa para buuin ang mga trend.",
    emptyResponse: "tugon na walang paksa (0 item)",
    fetchFailed: (detail) => `Hindi ma-load ang live na mga trend (${detail}).`,
  },
  kk: {
    searches: (traffic) => `${traffic} іздеу`,
    trendingToday: "Бүгін трендте",
    summaryWithNews: (news, geo) => `${news} — ${geo} бойынша бүгін ең көп ізделгендердің бірі.`,
    summaryPlain: (geo) => `${geo} бойынша бүгін ең көп ізделген тақырыптардың бірі.`,
    visualStyle: (canvas, title) =>
      `«${title}» туралы ${canvas} форматындағы жұмыс: жоғары контрастылы гастрономиялық фотосурет, жылы rust/charcoal палитрасы, неонсыз.`,
    hashtagFallback: (rank) => `Trend${rank}`,
    emptyPool: "Тренд құруға тікелей тақырыптар жоқ.",
    emptyResponse: "тақырыпсыз жауап (0 элемент)",
    fetchFailed: (detail) => `Тікелей трендтерді жүктеу мүмкін болмады (${detail}).`,
  },
  sw: {
    searches: (traffic) => `${traffic} utafutaji`,
    trendingToday: "Inavuma leo",
    summaryWithNews: (news, geo) => `${news} — miongoni mwa zinazotafutwa zaidi leo nchini ${geo}.`,
    summaryPlain: (geo) => `Miongoni mwa mada zinazotafutwa zaidi leo nchini ${geo}.`,
    visualStyle: (canvas, title) =>
      `Kipande cha ${canvas} kuhusu «${title}»: upigaji picha wa chakula wenye contrast kali, paleti yenye joto ya rust/charcoal, bila neon.`,
    hashtagFallback: (rank) => `Mwenendo${rank}`,
    emptyPool: "Hakuna mada mubashara za kutengeneza mienendo.",
    emptyResponse: "jibu lisilo na mada (vipengee 0)",
    fetchFailed: (detail) => `Imeshindwa kupakia mienendo mubashara (${detail}).`,
  },
  tr: {
    searches: (traffic) => `${traffic} arama`,
    trendingToday: "Bugün trendde",
    summaryWithNews: (news, geo) => `${news} — ${geo} bölgesinde bugün en çok arananlar arasında.`,
    summaryPlain: (geo) => `${geo} bölgesinde bugün en çok aranan konular arasında.`,
    visualStyle: (canvas, title) =>
      `«${title}» konulu ${canvas} parça: yüksek kontrastlı gastronomi fotoğrafı, sıcak rust/charcoal paleti, neon yok.`,
    hashtagFallback: (rank) => `Trend${rank}`,
    emptyPool: "Trend oluşturacak canlı konu yok.",
    emptyResponse: "konusuz yanıt (0 öğe)",
    fetchFailed: (detail) => `Canlı trendler yüklenemedi (${detail}).`,
  },
  hi: {
    searches: (traffic) => `${traffic} खोजें`,
    trendingToday: "आज ट्रेंडिंग",
    summaryWithNews: (news, geo) => `${news} — ${geo} में आज सबसे ज़्यादा खोजे गए विषयों में से।`,
    summaryPlain: (geo) => `${geo} में आज सबसे ज़्यादा खोजे गए विषयों में से।`,
    visualStyle: (canvas, title) =>
      `«${title}» पर ${canvas} रचना: उच्च-कंट्रास्ट फ़ूड फ़ोटोग्राफी, गर्म rust/charcoal पैलेट, कोई नियॉन नहीं।`,
    hashtagFallback: (rank) => `Trend${rank}`,
    emptyPool: "ट्रेंड बनाने हेतु कोई लाइव विषय नहीं।",
    emptyResponse: "विषयों के बिना उत्तर (0 आइटम)",
    fetchFailed: (detail) => `लाइव ट्रेंड लोड नहीं हो सके (${detail})।`,
  },
  fr: {
    searches: (traffic) => `${traffic} recherches`,
    trendingToday: "En tendance aujourd’hui",
    summaryWithNews: (news, geo) => `${news} — parmi les plus recherchés aujourd’hui en ${geo}.`,
    summaryPlain: (geo) => `Parmi les sujets les plus recherchés aujourd’hui en ${geo}.`,
    visualStyle: (canvas, title) =>
      `Pièce ${canvas} sur « ${title} » : photographie gastronomique contrastée, palette rust/charcoal chaleureuse, sans néons.`,
    hashtagFallback: (rank) => `Tendance${rank}`,
    emptyPool: "Aucun sujet en direct pour construire les tendances.",
    emptyResponse: "réponse sans sujets (0 élément)",
    fetchFailed: (detail) => `Chargement des tendances en direct impossible (${detail}).`,
  },
  vi: {
    searches: (traffic) => `${traffic} lượt tìm`,
    trendingToday: "Đang thịnh hành hôm nay",
    summaryWithNews: (news, geo) => `${news} — trong số được tìm nhiều nhất hôm nay tại ${geo}.`,
    summaryPlain: (geo) => `Trong số chủ đề được tìm nhiều nhất hôm nay tại ${geo}.`,
    visualStyle: (canvas, title) =>
      `Tác phẩm ${canvas} về «${title}»: ảnh ẩm thực tương phản cao, bảng màu rust/charcoal ấm, không neon.`,
    hashtagFallback: (rank) => `XuHuong${rank}`,
    emptyPool: "Không có chủ đề trực tiếp để dựng xu hướng.",
    emptyResponse: "phản hồi không có chủ đề (0 mục)",
    fetchFailed: (detail) => `Không thể tải xu hướng trực tiếp (${detail}).`,
  },
  bm: {
    searches: (traffic) => `${traffic} ɲinini`,
    trendingToday: "Tendance na bi",
    summaryWithNews: (news, geo) => `${news} — min ɲinina ka tɛmɛ bi ${geo}.`,
    summaryPlain: (geo) => `Kumasen minw ɲinina ka tɛmɛ bi ${geo}.`,
    visualStyle: (canvas, title) =>
      `Fɛn ${canvas} kan «${title}» : dumuni ja yeelenba, rust/charcoal kulɛri gwanin, neon tɛ.`,
    hashtagFallback: (rank) => `Tendance${rank}`,
    emptyPool: "Kumasen kura tɛ yen ka tendances dilan.",
    emptyResponse: "jaabi kumasen tɛ (0)",
    fetchFailed: (detail) => `Se ma se ka tendances kura doni (${detail}).`,
  },
  ko: {
    searches: (traffic) => `${traffic}회 검색`,
    trendingToday: "오늘 트렌드",
    summaryWithNews: (news, geo) => `${news} — 오늘 ${geo}에서 가장 많이 검색된 주제 중 하나.`,
    summaryPlain: (geo) => `오늘 ${geo}에서 가장 많이 검색된 주제 중 하나.`,
    visualStyle: (canvas, title) =>
      `«${title}»에 대한 ${canvas} 작품: 고대비 음식 사진, 따뜻한 rust/charcoal 팔레트, 네온 없음.`,
    hashtagFallback: (rank) => `Teurendeu${rank}`,
    emptyPool: "트렌드를 만들 실시간 주제가 없습니다.",
    emptyResponse: "주제 없는 응답(0개)",
    fetchFailed: (detail) => `실시간 트렌드를 불러오지 못했습니다(${detail}).`,
  },
  pt: {
    searches: (traffic) => `${traffic} pesquisas`,
    trendingToday: "Em tendência hoje",
    summaryWithNews: (news, geo) => `${news} — entre os mais pesquisados hoje em ${geo}.`,
    summaryPlain: (geo) => `Entre os temas mais pesquisados hoje em ${geo}.`,
    visualStyle: (canvas, title) =>
      `Peça ${canvas} sobre «${title}»: fotografia gastronómica de alto contraste, paleta rust/charcoal quente, sem néons.`,
    hashtagFallback: (rank) => `Tendencia${rank}`,
    emptyPool: "Sem temas em direto para construir tendências.",
    emptyResponse: "resposta sem temas (0 itens)",
    fetchFailed: (detail) => `Não foi possível carregar as tendências em direto (${detail}).`,
  },
  hu: {
    searches: (traffic) => `${traffic} keresés`,
    trendingToday: "Ma trendi",
    summaryWithNews: (news, geo) => `${news} — a ma ${geo} területén legkeresettebbek között.`,
    summaryPlain: (geo) => `A ma ${geo} területén legkeresettebb témák között.`,
    visualStyle: (canvas, title) =>
      `${canvas} méretű mű «${title}» témában: nagy kontrasztú gasztrofotó, meleg rust/charcoal paletta, neon nélkül.`,
    hashtagFallback: (rank) => `Trend${rank}`,
    emptyPool: "Nincs élő téma a trendekhez.",
    emptyResponse: "témák nélküli válasz (0 elem)",
    fetchFailed: (detail) => `Az élő trendek nem tölthetők be (${detail}).`,
  },
};

const CACHE_TTL_MS = 30 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;
const PER_NETWORK = 5;

const cache = new Map<string, { at: number; trends: Trend[]; sources: string[] }>();

/** Test hook: drop the in-memory cache. */
export function clearTrendsCache(): void {
  cache.clear();
}

function cleanText(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function firstTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!match) return null;
  const text = cleanText(match[1]);
  return text ? text : null;
}

/** Parse one Google Trends RSS document into feed items. Pure. */
export function parseTrendsRss(xml: string, geoLabel: string): FeedItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  const items: FeedItem[] = [];
  for (const block of blocks) {
    const title = firstTag(block, "title");
    if (!title) continue;
    items.push({
      title,
      traffic: firstTag(block, "ht:approx_traffic"),
      newsTitle: firstTag(block, "ht:news_item_title"),
      geoLabel,
    });
  }
  return items;
}

function toHashtag(title: string, rank: number, locale: Locale): string {
  const words = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  let tag = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")
    .slice(0, 28);
  if (tag.length < 2) tag = STRINGS[locale].hashtagFallback(rank);
  return `#${tag}`;
}

function toId(title: string): string {
  const base =
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "tendencia";
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return `${base}-${hash.toString(36)}`;
}

function promptWords(title: string): string {
  const words = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 4);
  return words.length >= 2 ? words.join(", ") : title.toLowerCase().slice(0, 60);
}

/**
 * Adapt live feed items into per-network trends (top 5 each). Pure.
 * Items cycle round-robin when the feed holds fewer topics than slots;
 * ids are stable for identical titles.
 */
export function buildTrendsFromItems(
  items: FeedItem[],
  networks: NetworkMeta[] = NETWORKS,
  locale: Locale = "es"
): Trend[] {
  const seen = new Set<string>();
  const pool = items.filter((item) => {
    const key = item.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (pool.length === 0) {
    throw new Error(STRINGS[locale].emptyPool);
  }
  const s = STRINGS[locale];
  const trends: Trend[] = [];
  networks.forEach((network, ni) => {
    for (let rank = 1; rank <= PER_NETWORK; rank++) {
      const item = pool[(ni * PER_NETWORK + (rank - 1)) % pool.length];
      const summary = item.newsTitle
        ? s.summaryWithNews(item.newsTitle, item.geoLabel)
        : s.summaryPlain(item.geoLabel);
      trends.push({
        id: toId(item.title),
        network: network.id,
        rank,
        title: item.title,
        hashtag: toHashtag(item.title, rank, locale),
        summary,
        volume: item.traffic ? s.searches(item.traffic) : s.trendingToday,
        visualStyle: s.visualStyle(network.canvas.label, item.title),
        promptHint: promptWords(item.title),
      });
    }
  });
  return trends;
}

/**
 * Fetch live trends for a country, with a 30-minute in-memory cache
 * keyed by country + locale. Throws when the feed is unreachable.
 */
export async function fetchLiveTrends(
  country: string = DEFAULT_COUNTRY,
  locale: Locale = "es"
): Promise<{ trends: Trend[]; sources: string[] }> {
  const code = validCountry(country);
  const key = `${code}:${locale}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return { trends: hit.trends, sources: hit.sources };
  }
  const s = STRINGS[locale];
  const geoLabel = countryName(code, locale);
  const url = resolveFeedUrl(code);
  let items: FeedItem[];
  try {
    const res = await fetch(url, {
      headers: requestHeaders(locale),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    items = parseTrendsRss(await res.text(), geoLabel);
    if (items.length === 0) throw new Error(s.emptyResponse);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[trends-live] Sin tendencias en vivo. URL: ${url}. Error: ${reason}`);
    throw new Error(s.fetchFailed(`${geoLabel}: ${reason}`));
  }
  const trends = buildTrendsFromItems(items, NETWORKS, locale);
  const sources = [geoLabel];
  cache.set(key, { at: Date.now(), trends, sources });
  return { trends, sources };
}
