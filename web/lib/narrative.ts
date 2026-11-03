import type { Product } from "@/lib/products";
import type { Network, Trend } from "@/lib/trends";
import type { Locale } from "./settings";
import { DEFAULT_COMPANY_NAME, applyBrandName } from "./brand";

type Category = Product["category"];

interface NarrativeStrings {
  lead: (network: string, name: string, cat: string) => string;
  trendBit: (title: string, hashtag: string, visual: string) => string;
  styleBit: (voice: string) => string;
  tail: string;
  voices: Record<Network, string>;
  category: Record<Category, string>;
  caption: (hashtag: string, name: string) => string;
}

const T: Record<Locale, NarrativeStrings> = {
  es: {
    lead: (n, c, w) =>
      `Fotografía gastronómica de alto contraste para Casa de Brasas (${n}), protagonizada por ${c} (${w}).`,
    trendBit: (t, h, v) => `Tendencia: "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `Estilo: paleta rust/charcoal cálida, sin neones, fondo oscuro, luz de brasas. Composición con ${v}.`,
    tail: "El mensaje conecta la tendencia con la tradición del asado en familia y el sabor premium. Logo watermark en la esquina superior derecha. Sin texto dentro de la foto.",
    voices: {
      facebook: "tono cálido de comunidad, invitando a compartir en familia y a pedir en lote",
      instagram: "tono editorial premium, describiendo textura, color y emplatado de alto contraste",
      tiktok: "tono directo y con hook en 2 segundos, pensado para video vertical y reacción",
      whatsapp: "tono cercano y directo, pensado para estado cuadrado y mensaje de difusión con pedido",
      threads: "tono conversacional e ingenioso, pensado para hilo corto con foto protagonista",
      x: "tono conciso y con gancho, pensado para post horizontal que invite a responder",
    },
    category: { corte: "corte artesanal", salsa: "salsa casera", paquete: "selección parrillera" },
    caption: (h, c) => `${h} · ${c} · Pedido por lote · Entrega jueves 7–8 PM`,
  },
  en: {
    lead: (n, c, w) =>
      `High-contrast food photography for Casa de Brasas (${n}), starring ${c} (${w}).`,
    trendBit: (t, h, v) => `Trend: "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `Style: warm rust/charcoal palette, no neons, dark background, ember light. Composition with ${v}.`,
    tail: "The message ties the trend back to family grilling tradition and premium flavor. Watermark logo in the upper-right corner. No text inside the photo.",
    voices: {
      facebook: "a warm community tone, inviting family sharing and batch ordering",
      instagram: "a premium editorial tone, describing texture, color and high-contrast plating",
      tiktok: "a direct tone with a 2-second hook, made for vertical video and reactions",
      whatsapp: "a close, direct tone, made for square status images and broadcast order messages",
      threads: "a conversational, witty tone, made for a short thread with a hero photo",
      x: "a concise, hooky tone, made for a horizontal post that invites replies",
    },
    category: { corte: "artisan cut", salsa: "homemade sauce", paquete: "grill selection" },
    caption: (h, c) => `${h} · ${c} · Batch order · Thursday delivery 7–8 PM`,
  },
  fil: {
    lead: (n, c, w) =>
      `Mataas na contrast na food photography para sa Casa de Brasas (${n}), tampok si ${c} (${w}).`,
    trendBit: (t, h, v) => `Trend: "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `Estilo: mainit na rust/charcoal palette, walang neon, madilim na background, liwanag ng baga. Komposisyon na may ${v}.`,
    tail: "Ikinokonekta ng mensahe ang trend sa tradisyon ng family grill at premium na lasa. Watermark logo sa kanang sulok sa itaas. Walang teksto sa loob ng larawan.",
    voices: {
      facebook: "mainit na tono ng komunidad na nag-aanyaya sa salu-salo at batch order",
      instagram: "premium na editoryal na tono na naglalarawan ng texture at kulay",
      tiktok: "diretsong tono na may hook sa loob ng 2 segundo para sa patayong video",
      whatsapp: "malapit at diretsong tono para sa square status at broadcast",
      threads: "pakikipag-usap at matalinong tono para sa maikling thread",
      x: "maikli at nakakaakit na tono para sa pahalang na post",
    },
    category: { corte: "artisanal na hiwa", salsa: "lutong-bahay na salsa", paquete: "pang-iihaw na seleksyon" },
    caption: (h, c) => `${h} · ${c} · Batch order · Paghahatid Huwebes 7–8 PM`,
  },
  kk: {
    lead: (n, c, w) =>
      `Casa de Brasas (${n}) үшін жоғары контрастылы гастрономиялық фотосурет, басты рөлде ${c} (${w}).`,
    trendBit: (t, h, v) => `Тренд: "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `Стиль: жылы rust/charcoal палитрасы, неонсыз, қараңғы фон, шоқ жарығы. Композиция: ${v}.`,
    tail: "Хабарлама трендті отбасылық гриль дәстүрімен және премиум дәммен байланыстырады. Жоғарғы оң бұрышта watermark логотип. Фото ішінде мәтін жоқ.",
    voices: {
      facebook: "отбасымен бөлісуге және топтық тапсырысқа шақыратын жылы қауымдастық үні",
      instagram: "текстура мен түсті сипаттайтын премиум редакциялық үн",
      tiktok: "тік видеоға арналған 2 секундтық ілмекті тікелей үн",
      whatsapp: "шаршы статус пен таратуға арналған жақын, тікелей үн",
      threads: "қысқа тредке арналған әңгімешіл, тапқыр үн",
      x: "жауапқа шақыратын көлденең жазбаға арналған қысқа, тартымды үн",
    },
    category: { corte: "қолөнер кесіндісі", salsa: "үй тұздығы", paquete: "гриль жиынтығы" },
    caption: (h, c) => `${h} · ${c} · Топтық тапсырыс · Бейсенбі 7–8 PM жеткізу`,
  },
  sw: {
    lead: (n, c, w) =>
      `Upigaji picha wa chakula wenye contrast kali kwa Casa de Brasas (${n}), ukimshirikisha ${c} (${w}).`,
    trendBit: (t, h, v) => `Mwenendo: "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `Mtindo: paleti yenye joto ya rust/charcoal, bila neon, background nyeusi, mwanga wa makaa. Muundo wenye ${v}.`,
    tail: "Ujumbe unaunganisha mwenendo na utamaduni wa kuchoma wa familia na ladha ya premium. Nembo ya watermark kwenye kona ya juu kulia. Hakuna maandishi ndani ya picha.",
    voices: {
      facebook: "toni yenye joto ya jamii inayokaribisha kushiriki kifamilia na oda za batch",
      instagram: "toni ya kipekee ya kihariri inayoelezea umbile na rangi",
      tiktok: "toni ya moja kwa moja yenye ndoano ya sekunde 2 kwa video wima",
      whatsapp: "toni ya karibu na ya moja kwa moja kwa status za mraba na matangazo",
      threads: "toni ya mazungumzo na ya akili kwa thread fupi",
      x: "toni fupi yenye mvuto kwa chapisho mlalo",
    },
    category: { corte: "kata la asili", salsa: "mchuzi wa nyumbani", paquete: "uteuzi wa kuchoma" },
    caption: (h, c) => `${h} · ${c} · Oda ya batch · Uwasilishaji Alhamisi 7–8 PM`,
  },
  tr: {
    lead: (n, c, w) =>
      `Casa de Brasas (${n}) için yüksek kontrastlı gastronomi fotoğrafı, başrolde ${c} (${w}).`,
    trendBit: (t, h, v) => `Trend: "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `Stil: sıcak rust/charcoal paleti, neon yok, koyu arka plan, köz ışığı. ${v} içeren kompozisyon.`,
    tail: "Mesaj, trendi aile mangal geleneğiyle ve premium lezzetle bağlar. Sağ üst köşede filigran logo. Fotoğraf içinde metin yok.",
    voices: {
      facebook: "ailece paylaşmaya ve toplu siparişe davet eden sıcak topluluk tonu",
      instagram: "doku ve rengi anlatan premium editoryal ton",
      tiktok: "dikey video için 2 saniyelik kancalı doğrudan ton",
      whatsapp: "kare durum ve duyuru için samimi, doğrudan ton",
      threads: "kısa diziler için sohbet havasında, esprili ton",
      x: "yanıt davet eden yatay gönderi için özlü, çarpıcı ton",
    },
    category: { corte: "artisanal kesim", salsa: "ev yapımı salsa", paquete: "mangal seçkisi" },
    caption: (h, c) => `${h} · ${c} · Toplu sipariş · Perşembe 7–8 teslimat`,
  },
  hi: {
    lead: (n, c, w) =>
      `Casa de Brasas (${n}) के लिए उच्च-कंट्रास्ट फ़ूड फ़ोटोग्राफी, जिसमें मुख्य हैं ${c} (${w})।`,
    trendBit: (t, h, v) => `ट्रेंड: "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `शैली: गर्म rust/charcoal पैलेट, कोई नियॉन नहीं, गहरी पृष्ठभूमि, अंगारों की रोशनी। ${v} वाली संरचना।`,
    tail: "संदेश ट्रेंड को पारिवारिक ग्रिल परंपरा और प्रीमियम स्वाद से जोड़ता है। ऊपर-दाएं कोने में वॉटरमार्क लोगो। फ़ोटो के अंदर कोई पाठ नहीं।",
    voices: {
      facebook: "पारिवारिक साझेदारी और बैच ऑर्डर का आमंत्रण देता गर्म सामुदायिक स्वर",
      instagram: "बनावट और रंग का वर्णन करता प्रीमियम संपादकीय स्वर",
      tiktok: "वर्टिकल वीडियो हेतु 2 सेकंड के हुक वाला सीधा स्वर",
      whatsapp: "स्क्वायर स्टेटस और प्रसारण हेतु निकट, सीधा स्वर",
      threads: "छोटे थ्रेड हेतु संवादात्मक, चतुर स्वर",
      x: "उत्तर आमंत्रित करते क्षैतिज पोस्ट हेतु संक्षिप्त, आकर्षक स्वर",
    },
    category: { corte: "कारीगर कट", salsa: "घरेलू साल्सा", paquete: "ग्रिल चयन" },
    caption: (h, c) => `${h} · ${c} · बैच ऑर्डर · गुरुवार 7–8 PM डिलीवरी`,
  },
  fr: {
    lead: (n, c, w) =>
      `Photographie gastronomique à fort contraste pour Casa de Brasas (${n}), avec ${c} (${w}) en vedette.`,
    trendBit: (t, h, v) => `Tendance : "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `Style : palette rust/charcoal chaleureuse, sans néons, fond sombre, lumière de braise. Composition avec ${v}.`,
    tail: "Le message relie la tendance à la tradition du grill en famille et au goût premium. Logo en filigrane en haut à droite. Aucun texte dans la photo.",
    voices: {
      facebook: "un ton communautaire chaleureux qui invite au partage en famille et à la commande groupée",
      instagram: "un ton éditorial premium décrivant texture et couleur",
      tiktok: "un ton direct avec accroche en 2 secondes pour la vidéo verticale",
      whatsapp: "un ton proche et direct pour statuts carrés et diffusion",
      threads: "un ton conversationnel et spirituel pour fil court",
      x: "un ton concis et accrocheur pour publication horizontale",
    },
    category: { corte: "coupe artisanale", salsa: "sauce maison", paquete: "sélection grill" },
    caption: (h, c) => `${h} · ${c} · Commande groupée · Livraison jeudi 19–20h`,
  },
  vi: {
    lead: (n, c, w) =>
      `Ảnh ẩm thực tương phản cao cho Casa de Brasas (${n}), với nhân vật chính ${c} (${w}).`,
    trendBit: (t, h, v) => `Xu hướng: "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `Phong cách: bảng màu rust/charcoal ấm, không neon, nền tối, ánh than hồng. Bố cục với ${v}.`,
    tail: "Thông điệp gắn xu hướng với truyền thống nướng thịt gia đình và hương vị cao cấp. Logo watermark ở góc trên phải. Không chữ trong ảnh.",
    voices: {
      facebook: "giọng cộng đồng ấm áp mời gọi chia sẻ gia đình và đặt hàng loạt",
      instagram: "giọng biên tập cao cấp tả kết cấu và màu sắc",
      tiktok: "giọng trực tiếp với hook 2 giây cho video dọc",
      whatsapp: "giọng gần gũi, trực tiếp cho trạng thái vuông và phát sóng",
      threads: "giọng trò chuyện dí dỏm cho chuỗi ngắn",
      x: "giọng súc tích, lôi cuốn cho bài ngang",
    },
    category: { corte: "miếng thịt thủ công", salsa: "sốt nhà làm", paquete: "tuyển chọn đồ nướng" },
    caption: (h, c) => `${h} · ${c} · Đặt hàng loạt · Giao hàng thứ Năm 7–8 tối`,
  },
  bm: {
    lead: (n, c, w) => `Dumuni ja yeelenba Casa de Brasas (${n}) kama, ${c} (${w}) bɛ ɲɛfɛ.`,
    trendBit: (t, h, v) => `Tendance : "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `Cogo : rust/charcoal kulɛri gwanin, neon tɛ, kɔkanna finman, takami yeelen. Labɛnni ni ${v} ye.`,
    tail: "Kuma bɛ tendance siri dukɔnɔ dibi ladamu ni duguɲuman dunun na. Watermark logo bɛ sanfɛ kininbolo nɔ na. Sɛbɛnni tɛ ja kɔnɔ.",
    voices: {
      facebook: "jama kan gwanin min bɛ dukɔnɔ tila ani commandi laseli wele",
      instagram: "kanba ɲuman min bɛ cogoya ni kulɛri ɲɛfɔ",
      tiktok: "kan tilennen ni hook segon 2 ye video jɔlen kama",
      whatsapp: "kan surun ni tilennen status caré ani laseli kama",
      threads: "baro kan ni hakili ye thread surun kama",
      x: "kan surun min bɛ mɔgɔ sama post horizontal kama",
    },
    category: { corte: "sogo tigɛcogo", salsa: "so ka sauce", paquete: "dibi fɛn sugandilenw" },
    caption: (h, c) => `${h} · ${c} · Commandi laseli · Sarali alimisa 7–8`,
  },
  ko: {
    lead: (n, c, w) => `Casa de Brasas(${n})를 위한 고대비 음식 사진, 주인공 ${c}(${w}).`,
    trendBit: (t, h, v) => `트렌드: "${t}" ${h} — ${v}`,
    styleBit: (v) => `스타일: 따뜻한 rust/charcoal 팔레트, 네온 없음, 어두운 배경, 숯불 빛. ${v} 구성.`,
    tail: "메시지는 트렌드를 가족 바비큐 전통과 프리미엄 맛에 연결합니다. 오른쪽 위 모서리에 워터마크 로고. 사진 안에 텍스트 없음.",
    voices: {
      facebook: "가족 공유와 단체 주문을 이끄는 따뜻한 커뮤니티 톤",
      instagram: "질감과 색감을 묘사하는 프리미엄 에디토리얼 톤",
      tiktok: "세로 영상용 2초 후크의 직접적인 톤",
      whatsapp: "정사각 상태와 방송용 친근하고 직접적인 톤",
      threads: "짧은 스레드용 대화체 톤",
      x: "가로 게시물용 간결하고 흥미로운 톤",
    },
    category: { corte: "장인 컷", salsa: "수제 살사", paquete: "그릴 셀렉션" },
    caption: (h, c) => `${h} · ${c} · 단체 주문 · 목요일 7–8시 배송`,
  },
  pt: {
    lead: (n, c, w) =>
      `Fotografia gastronómica de alto contraste para a Casa de Brasas (${n}), protagonizada por ${c} (${w}).`,
    trendBit: (t, h, v) => `Tendência: "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `Estilo: paleta rust/charcoal quente, sem néons, fundo escuro, luz de brasa. Composição com ${v}.`,
    tail: "A mensagem liga a tendência à tradição do churrasco em família e ao sabor premium. Logótipo de marca de água no canto superior direito. Sem texto dentro da foto.",
    voices: {
      facebook: "tom comunitário caloroso que convida à partilha em família e à encomenda em lote",
      instagram: "tom editorial premium que descreve textura e cor",
      tiktok: "tom direto com gancho de 2 segundos para vídeo vertical",
      whatsapp: "tom próximo e direto para estados quadrados e difusão",
      threads: "tom conversacional e espirituoso para fio curto",
      x: "tom conciso e cativante para publicação horizontal",
    },
    category: { corte: "corte artesanal", salsa: "salsa caseira", paquete: "seleção de grelha" },
    caption: (h, c) => `${h} · ${c} · Encomenda em lote · Entrega quinta-feira 19–20h`,
  },
  hu: {
    lead: (n, c, w) =>
      `Nagy kontrasztú gasztrofotó a Casa de Brasas (${n}) számára, főszerepben: ${c} (${w}).`,
    trendBit: (t, h, v) => `Trend: "${t}" ${h} — ${v}`,
    styleBit: (v) =>
      `Stílus: meleg rust/charcoal paletta, neon nélkül, sötét háttér, parázsfény. Hangnem: ${v}.`,
    tail: "Az üzenet a trendet a családi grillezés hagyományával és a prémium ízzel köti össze. Vízjel-logó a jobb felső sarokban. Nincs szöveg a fotón.",
    voices: {
      facebook: "családi megosztásra és csoportos rendelésre hívó meleg közösségi hang",
      instagram: "textúrát és színt leíró prémium szerkesztőségi hang",
      tiktok: "függőleges videóhoz való, 2 másodperces kapaszkodós direkt hang",
      whatsapp: "négyzetes állapotokhoz és szóráshoz való közvetlen hang",
      threads: "rövid szálakhoz való társalgási, szellemes hang",
      x: "válaszra hívó vízszintes bejegyzéshez való tömör, figyelemfelkeltő hang",
    },
    category: { corte: "kézműves vágat", salsa: "házi salsa", paquete: "grillválogatás" },
    caption: (h, c) => `${h} · ${c} · Csoportos rendelés · Csütörtöki kiszállítás 19–20`,
  },
};

/**
 * Demo "AI narrative" generator (offline template, no API key needed).
 * Produces an editable image prompt adapted to trend + network + product +
 * language, following the brand rules: rust/charcoal palette, high-contrast
 * food photography, premium perception, link back to grilling tradition.
 */
export function buildNarrative(
  trend: Trend,
  product: Pick<Product, "name" | "category">,
  network: Network,
  locale: Locale = "es",
  companyName: string = DEFAULT_COMPANY_NAME
): string {
  const s = T[locale];
  const cleanName = product.name.replace("[PLACEHOLDER] ", "");
  return applyBrandName(
    [
      s.lead(network, cleanName, s.category[product.category]),
      s.trendBit(trend.title, trend.hashtag, trend.visualStyle),
      s.styleBit(s.voices[network]),
      s.tail,
    ].join(" "),
    companyName
  );
}

/** Short caption derived from the (possibly edited) prompt for the preview footer. */
export function buildCaption(
  trend: Trend,
  product: Pick<Product, "name">,
  locale: Locale = "es"
): string {
  const cleanName = product.name.replace("[PLACEHOLDER] ", "");
  return T[locale].caption(trend.hashtag, cleanName);
}
