"use client";

import { useEffect, useState } from "react";
import {
  APPROVAL_LABEL,
  brandHarnessNote,
  contentItems,
  copyDetail,
  copyPreview,
  loadApprovals,
  saveApproval,
  type ApprovalMap,
  type ApprovalStatus,
} from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandCompanyName } from "@/components/brand-mark";

const ALL: ApprovalStatus[] = ["pending", "approved", "rejected", "changes"];

function statusVariant(s: ApprovalStatus): "default" | "secondary" {
  return s === "pending" ? "secondary" : "default";
}

export function ApprovalHub() {
  const [approvals, setApprovals] = useState<ApprovalMap>({});
  const [filter, setFilter] = useState<ApprovalStatus | "all">("all");

  useEffect(() => {
    setApprovals(loadApprovals());
  }, []);

  function statusOf(id: string): ApprovalStatus {
    return approvals[id] ?? "pending";
  }

  function decide(id: string, status: ApprovalStatus) {
    setApprovals(saveApproval(id, status));
  }

  const counts = ALL.reduce<Record<ApprovalStatus, number>>(
    (acc, s) => ({ ...acc, [s]: contentItems.filter((i) => statusOf(i.id) === s).length }),
    { pending: 0, approved: 0, rejected: 0, changes: 0 }
  );

  const visible = filter === "all" ? contentItems : contentItems.filter((i) => statusOf(i.id) === filter);

  return (
    <section aria-label="Hub de aprobación de campaña semanal">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-2xl">Aprobación de campaña semanal</h2>
        <Badge>10 piezas · decisiones guardadas en este navegador</Badge>
      </div>
      <p className="text-xs text-charcoal-800/60 mt-1">
        {brandHarnessNote}
      </p>

      <div className="flex items-center gap-2 flex-wrap mt-4 text-sm">
        <span className="text-charcoal-800/70">Filtrar:</span>
        {(["all", ...ALL] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md border ${filter === f ? "bg-charcoal-800 text-cream border-charcoal-800" : "border-charcoal-900/25"}`}
          >
            {f === "all" ? `Todas (${contentItems.length})` : `${APPROVAL_LABEL[f]} (${counts[f]})`}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mt-6">
        {visible.map((item) => {
          const status = statusOf(item.id);
          const thumb = item.images[0];
          const detail = copyDetail(item);
          return (
            <Card key={item.id} className="overflow-hidden flex flex-col">
              {thumb ? (
                <div className="photo-frame h-44">
                  <img src={thumb} alt={item.title} loading="lazy" />
                  <span className="absolute top-2 right-2 z-10 font-serif text-xs italic bg-charcoal-900/70 text-cream px-2 py-0.5 rounded-sm">
                    <BrandCompanyName />
                  </span>
                </div>
              ) : (
                <div className="h-24 bg-charcoal-800 text-cream/90 flex items-center justify-center">
                  <span className="font-serif italic text-lg px-6 text-center">
                    Guion de {item.channel} — sin imagen
                  </span>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl leading-snug">{item.title}</CardTitle>
                  <Badge variant={statusVariant(status)}>{APPROVAL_LABEL[status]}</Badge>
                </div>
                <p className="text-xs text-charcoal-800/60 font-sans">
                  {item.channel} · {item.format}
                  {item.images.length > 1 ? ` · ${item.images.length} imágenes` : ""}
                </p>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-charcoal-800/80 flex-1">
                <p>{copyPreview(item)}</p>
                {detail && <p className="mt-2 text-xs text-charcoal-800/60">{detail}</p>}
                <p className="mt-2 text-xs text-charcoal-800/60 italic">{item.visual_notes}</p>
              </CardContent>
              <div className="px-6 pb-6 flex gap-2 flex-wrap">
                <Button size="sm" onClick={() => decide(item.id, "approved")} disabled={status === "approved"}>
                  Aprobar
                </Button>
                <Button size="sm" variant="secondary" onClick={() => decide(item.id, "rejected")} disabled={status === "rejected"}>
                  Rechazar
                </Button>
                <Button size="sm" variant="outline" onClick={() => decide(item.id, "changes")} disabled={status === "changes"}>
                  Pedir cambios
                </Button>
                {status !== "pending" && (
                  <Button size="sm" variant="outline" onClick={() => decide(item.id, "pending")}>
                    Volver a pendiente
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="mt-6 text-charcoal-800/70">Sin piezas en este estado.</p>
      )}
    </section>
  );
}
