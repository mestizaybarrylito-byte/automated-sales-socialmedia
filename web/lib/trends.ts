export type Network = "facebook" | "instagram" | "tiktok" | "whatsapp" | "threads" | "x";

export interface Trend {
  id: string;
  network: Network;
  rank: number;
  title: string;
  hashtag: string;
  summary: string;
  volume: string;
  /** Live sources carry no growth/category; present only when the feed provides them. */
  growth?: string;
  category?: string;
  visualStyle: string;
  promptHint: string;
}

export interface NetworkMeta {
  id: Network;
  label: string;
  /** Canvas size used for the publish-ready preview. */
  canvas: { width: number; height: number; label: string };
  badgeClass: string;
}

export const NETWORKS: NetworkMeta[] = [
  {
    id: "facebook",
    label: "Facebook",
    canvas: { width: 1200, height: 630, label: "1200 × 630 · feed" },
    badgeClass: "bg-[#1877F2]/10 text-[#0b5ed7] border-[#1877F2]/25",
  },
  {
    id: "instagram",
    label: "Instagram",
    canvas: { width: 1080, height: 1350, label: "1080 × 1350 · 4:5" },
    badgeClass: "bg-[#E1306C]/10 text-[#b81d54] border-[#E1306C]/25",
  },
  {
    id: "tiktok",
    label: "TikTok",
    canvas: { width: 1080, height: 1920, label: "1080 × 1920 · 9:16" },
    badgeClass: "bg-charcoal-900/5 text-charcoal-900 border-charcoal-900/25",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    canvas: { width: 1080, height: 1080, label: "1080 × 1080 · cuadrado" },
    badgeClass: "bg-[#25D366]/10 text-[#0d6e3f] border-[#25D366]/30",
  },
  {
    id: "threads",
    label: "Threads",
    canvas: { width: 1080, height: 1350, label: "1080 × 1350 · 4:5" },
    badgeClass: "bg-charcoal-900 text-cream border-charcoal-900",
  },
  {
    id: "x",
    label: "X",
    canvas: { width: 1200, height: 675, label: "1200 × 675 · 16:9" },
    badgeClass: "bg-white text-charcoal-900 border-charcoal-900/40",
  },
];

export function getNetwork(id: string): NetworkMeta | undefined {
  return NETWORKS.find((n) => n.id === id);
}

export function getTrendsByNetwork(all: Trend[], network: Network): Trend[] {
  return all
    .filter((t) => t.network === network)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);
}

export function getTrend(all: Trend[], network: string, id: string): Trend | undefined {
  return all.find((t) => t.network === network && t.id === id);
}
