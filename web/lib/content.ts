import raw from "@/data/content.json";

/** Owner approval state per content item (Weekly Campaign Approval Hub). */
export type ApprovalStatus = "pending" | "approved" | "rejected" | "changes";

export interface ContentItem {
  id: string;
  title: string;
  channel: string;
  format: string;
  status: string;
  images: string[];
  products: string[];
  copy: Record<string, unknown>;
  visual_notes: string;
}

interface ContentFile {
  brand_harness: string;
  items: ContentItem[];
}

const file = raw as ContentFile;

export const brandHarnessNote: string = file.brand_harness;
export const contentItems: ContentItem[] = file.items;

export const APPROVAL_LABEL: Record<ApprovalStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  changes: "Pedir cambios",
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Short human preview of the item copy, per format shape. */
export function copyPreview(item: ContentItem): string {
  const c = item.copy;
  const text =
    asString(c.caption) ||
    asString(c.caption_post) ||
    asString(c.text) ||
    (typeof c.script === "string" ? c.script : "") ||
    asString(c.hook_0_3s);
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 180 ? `${flat.slice(0, 177)}…` : flat;
}

/** Extra line under the preview: hook, slide count, CTA… per format. */
export function copyDetail(item: ContentItem): string | null {
  const c = item.copy;
  if (Array.isArray(c.script)) return `${c.script.length} bloques de guion · CTA: ${asString(c.cta) || "—"}`;
  if (Array.isArray(c.slides)) return `${c.slides.length} slides · CTA: ${asString(c.cta) || "—"}`;
  if (Array.isArray(c.stickers))
    return `Stickers: ${(c.stickers as string[]).join(" · ")}`;
  if (asString(c.mechanics)) return asString(c.mechanics);
  if (typeof c.script === "string") return `CTA: ${asString(c.cta) || "—"}`;
  return asString(c.cta) ? `CTA: ${asString(c.cta)}` : null;
}

// ---------------------------------------------------------------------------
// Client-side persistence (prototype; Supabase table `content_approvals`
// replaces this in production). Guarded for SSR.
// ---------------------------------------------------------------------------

const APPROVALS_KEY = "casa-de-brasas-approvals-v1";

export type ApprovalMap = Record<string, ApprovalStatus>;

export function loadApprovals(): ApprovalMap {
  if (typeof window === "undefined") return {};
  try {
    const rawValue = window.localStorage.getItem(APPROVALS_KEY);
    if (rawValue) return JSON.parse(rawValue) as ApprovalMap;
  } catch {
    /* fall through to empty */
  }
  return {};
}

export function saveApproval(id: string, status: ApprovalStatus): ApprovalMap {
  const next = { ...loadApprovals(), [id]: status };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(APPROVALS_KEY, JSON.stringify(next));
    } catch {
      /* storage blocked: prototype keeps in-memory state */
    }
  }
  return next;
}
