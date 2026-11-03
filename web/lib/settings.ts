/**
 * Country + language settings (pure, no framework imports).
 *
 * Persisted in cookies (`trend-country`, `trend-locale`) so every page —
 * including server components — renders with the user's configuration.
 * Testable through plain tsc transpilation (see `npm test`).
 */

export type Locale =
  | "es"
  | "en"
  | "fil"
  | "kk"
  | "sw"
  | "tr"
  | "hi"
  | "fr"
  | "vi"
  | "bm"
  | "ko"
  | "pt"
  | "hu";

export interface UILocale {
  id: Locale;
  /** Native name shown in the picker. */
  label: string;
  /** BCP 47 tag for Intl formatting and request headers. */
  tag: string;
}

export const LOCALES: UILocale[] = [
  { id: "es", label: "Español", tag: "es-MX" },
  { id: "en", label: "English", tag: "en-US" },
  { id: "fil", label: "Filipino", tag: "fil-PH" },
  { id: "kk", label: "Қазақша", tag: "kk-KZ" },
  { id: "sw", label: "Kiswahili", tag: "sw-KE" },
  { id: "tr", label: "Türkçe", tag: "tr-TR" },
  { id: "hi", label: "हिन्दी", tag: "hi-IN" },
  { id: "fr", label: "Français", tag: "fr-FR" },
  { id: "vi", label: "Tiếng Việt", tag: "vi-VN" },
  { id: "bm", label: "Bamanankan", tag: "bm" },
  { id: "ko", label: "한국어", tag: "ko-KR" },
  { id: "pt", label: "Português", tag: "pt-PT" },
  { id: "hu", label: "Magyar", tag: "hu-HU" },
];

export interface Country {
  code: string;
  flag: string;
  name: Record<Locale, string>;
}

/** Countries with a Google Trends `trending/rss?geo=` feed. */
export const COUNTRIES: Country[] = [
  { code: "MX", flag: "🇲🇽", name: { es: "México", en: "Mexico", fil: "Mexico", kk: "Мексика", sw: "Meksiko", tr: "Meksika", hi: "मेक्सिको", fr: "Mexique", vi: "Mê-hi-cô", bm: "Meksik", ko: "멕시코", pt: "México", hu: "Mexikó" } },
  { code: "US", flag: "🇺🇸", name: { es: "Estados Unidos", en: "United States", fil: "Estados Unidos", kk: "АҚШ", sw: "Marekani", tr: "Amerika Birleşik Devletleri", hi: "संयुक्त राज्य अमेरिका", fr: "États-Unis", vi: "Hoa Kỳ", bm: "Ameriki", ko: "미국", pt: "Estados Unidos", hu: "Egyesült Államok" } },
  { code: "ES", flag: "🇪🇸", name: { es: "España", en: "Spain", fil: "Espanya", kk: "Испания", sw: "Uhispania", tr: "İspanya", hi: "स्पेन", fr: "Espagne", vi: "Tây Ban Nha", bm: "Espani", ko: "스페인", pt: "Espanha", hu: "Spanyolország" } },
  { code: "AR", flag: "🇦🇷", name: { es: "Argentina", en: "Argentina", fil: "Argentina", kk: "Аргентина", sw: "Ajentina", tr: "Arjantin", hi: "अर्जेंटीना", fr: "Argentine", vi: "Argentina", bm: "Arjantine", ko: "아르헨티나", pt: "Argentina", hu: "Argentína" } },
  { code: "CO", flag: "🇨🇴", name: { es: "Colombia", en: "Colombia", fil: "Colombia", kk: "Колумбия", sw: "Kolombia", tr: "Kolombiya", hi: "कोलंबिया", fr: "Colombie", vi: "Colombia", bm: "Kolombi", ko: "콜롬비아", pt: "Colômbia", hu: "Kolumbia" } },
  { code: "CL", flag: "🇨🇱", name: { es: "Chile", en: "Chile", fil: "Chile", kk: "Чили", sw: "Chile", tr: "Şili", hi: "चिली", fr: "Chili", vi: "Chile", bm: "Shili", ko: "칠레", pt: "Chile", hu: "Chile" } },
  { code: "AU", flag: "🇦🇺", name: { es: "Australia", en: "Australia", fil: "Australia", kk: "Аустралия", sw: "Australia", tr: "Avustralya", hi: "ऑस्ट्रेलिया", fr: "Australie", vi: "Úc", bm: "Ostrali", ko: "오스트레일리아", pt: "Austrália", hu: "Ausztrália" } },
  { code: "NG", flag: "🇳🇬", name: { es: "Nigeria", en: "Nigeria", fil: "Nigeria", kk: "Нигерия", sw: "Nigeria", tr: "Nijerya", hi: "नाइजीरिया", fr: "Nigéria", vi: "Nigeria", bm: "Nizeriya", ko: "나이지리아", pt: "Nigéria", hu: "Nigéria" } },
  { code: "PH", flag: "🇵🇭", name: { es: "Filipinas", en: "Philippines", fil: "Pilipinas", kk: "Филиппин", sw: "Ufilipino", tr: "Filipinler", hi: "फ़िलिपींस", fr: "Philippines", vi: "Phi-líp-pin", bm: "Filipin", ko: "필리핀", pt: "Filipinas", hu: "Fülöp-szigetek" } },
  { code: "KZ", flag: "🇰🇿", name: { es: "Kazajistán", en: "Kazakhstan", fil: "Kazakhstan", kk: "Қазақстан", sw: "Kazakhstan", tr: "Kazakistan", hi: "कज़ाख़स्तान", fr: "Kazakhstan", vi: "Kazakhstan", bm: "Kazakstan", ko: "카자흐스탄", pt: "Cazaquistão", hu: "Kazahsztán" } },
  { code: "KE", flag: "🇰🇪", name: { es: "Kenia", en: "Kenya", fil: "Kenya", kk: "Кения", sw: "Kenya", tr: "Kenya", hi: "केन्या", fr: "Kenya", vi: "Kenya", bm: "Kenya", ko: "케냐", pt: "Quénia", hu: "Kenya" } },
  { code: "TR", flag: "🇹🇷", name: { es: "Turquía", en: "Turkey", fil: "Turkiya", kk: "Түркия", sw: "Uturuki", tr: "Türkiye", hi: "तुर्की", fr: "Turquie", vi: "Thổ Nhĩ Kỳ", bm: "Turki", ko: "튀르키예", pt: "Turquia", hu: "Törökország" } },
  { code: "IE", flag: "🇮🇪", name: { es: "Irlanda", en: "Ireland", fil: "Irlanda", kk: "Ирландия", sw: "Ayalandi", tr: "İrlanda", hi: "आयरलैंड", fr: "Irlande", vi: "Ai-len", bm: "Irilandi", ko: "아일랜드", pt: "Irlanda", hu: "Írország" } },
  { code: "IN", flag: "🇮🇳", name: { es: "India", en: "India", fil: "India", kk: "Үндістан", sw: "India", tr: "Hindistan", hi: "भारत", fr: "Inde", vi: "Ấn Độ", bm: "Endi", ko: "인도", pt: "Índia", hu: "India" } },
  { code: "CD", flag: "🇨🇩", name: { es: "República Democrática del Congo", en: "Democratic Republic of the Congo", fil: "Demokratikong Republika ng Congo", kk: "Конго Демократиялық Республикасы", sw: "Jamhuri ya Kidemokrasia ya Kongo", tr: "Kongo Demokratik Cumhuriyeti", hi: "कांगो लोकतांत्रिक गणराज्य", fr: "République démocratique du Congo", vi: "Cộng hòa Dân chủ Congo", bm: "Kongo jamana demokratiki", ko: "콩고 민주 공화국", pt: "República Democrática do Congo", hu: "Kongói Demokratikus Köztársaság" } },
  { code: "VN", flag: "🇻🇳", name: { es: "Vietnam", en: "Vietnam", fil: "Vietnam", kk: "Вьетнам", sw: "Vietnam", tr: "Vietnam", hi: "वियतनाम", fr: "Vietnam", vi: "Việt Nam", bm: "Viyetnam", ko: "베트남", pt: "Vietname", hu: "Vietnám" } },
  { code: "ML", flag: "🇲🇱", name: { es: "Malí", en: "Mali", fil: "Mali", kk: "Мали", sw: "Mali", tr: "Mali", hi: "माली", fr: "Mali", vi: "Mali", bm: "Mali", ko: "말리", pt: "Mali", hu: "Mali" } },
  { code: "KR", flag: "🇰🇷", name: { es: "Corea del Sur", en: "South Korea", fil: "Timog Korea", kk: "Оңтүстік Корея", sw: "Korea Kusini", tr: "Güney Kore", hi: "दक्षिण कोरिया", fr: "Corée du Sud", vi: "Hàn Quốc", bm: "Kore Sud", ko: "한국", pt: "Coreia do Sul", hu: "Dél-Korea" } },
  { code: "PT", flag: "🇵🇹", name: { es: "Portugal", en: "Portugal", fil: "Portugal", kk: "Португалия", sw: "Ureno", tr: "Portekiz", hi: "पुर्तगाल", fr: "Portugal", vi: "Bồ Đào Nha", bm: "Portugal", ko: "포르투갈", pt: "Portugal", hu: "Portugália" } },
  { code: "HU", flag: "🇭🇺", name: { es: "Hungría", en: "Hungary", fil: "Unggarya", kk: "Венгрия", sw: "Hungaria", tr: "Macaristan", hi: "हंगरी", fr: "Hongrie", vi: "Hung-ga-ri", bm: "Hongri", ko: "헝가리", pt: "Hungria", hu: "Magyarország" } },
  { code: "PE", flag: "🇵🇪", name: { es: "Perú", en: "Peru", fil: "Peru", kk: "Перу", sw: "Peru", tr: "Peru", hi: "पेरू", fr: "Pérou", vi: "Peru", bm: "Peru", ko: "페루", pt: "Peru", hu: "Peru" } },
];

export const DEFAULT_COUNTRY = "MX";
export const DEFAULT_LOCALE: Locale = "es";
export const COUNTRY_COOKIE = "trend-country";
export const LOCALE_COOKIE = "trend-locale";

export interface Settings {
  country: string;
  locale: Locale;
}

/** Validate raw cookie values, falling back to defaults. Pure. */
export function parseSettings(input: {
  country?: string | null;
  locale?: string | null;
}): Settings {
  const country =
    input.country && COUNTRIES.some((c) => c.code === input.country)
      ? input.country
      : DEFAULT_COUNTRY;
  const locale: Locale =
    input.locale && LOCALES.some((l) => l.id === input.locale)
      ? (input.locale as Locale)
      : DEFAULT_LOCALE;
  return { country, locale };
}

export function countryName(code: string, locale: Locale): string {
  return COUNTRIES.find((c) => c.code === code)?.name[locale] ?? code;
}

export function localeTag(locale: Locale): string {
  return LOCALES.find((l) => l.id === locale)?.tag ?? "en-US";
}
