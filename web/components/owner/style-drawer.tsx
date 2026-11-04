"use client";

import { useEffect, useRef } from "react";
import { CATEGORY_NAMES, STYLE_CATEGORIES, type PhotoStyle } from "@/lib/photo-styles";
import { Button } from "@/components/ui/button";
import { StyleThumbImage, StyleThumbSkeleton } from "@/components/owner/style-thumb-card";
import { cn } from "@/lib/utils";

export interface DrawerThumb {
  id: string;
  url: string;
}

/** Slide-over panel with the full style catalog, grouped by category. */
export function StyleDrawer({
  open,
  title,
  closeLabel,
  loadingLabel,
  errorLabel,
  styles,
  thumbs,
  failed,
  selectedId,
  selectedIds,
  maxSelections,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  closeLabel: string;
  loadingLabel: string;
  errorLabel: string;
  styles: PhotoStyle[];
  thumbs: DrawerThumb[];
  failed: boolean;
  /** Single-select mode (wizard). */
  selectedId?: string;
  /** Multi-select mode (identidad curation): order = selection order. */
  selectedIds?: string[];
  /** Multi-select cap: unselected cells disable at the cap. */
  maxSelections?: number;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const urls = new Map(thumbs.map((t) => [t.id, t.url]));
  const multi = Array.isArray(selectedIds);
  const isSelected = (id: string) =>
    multi ? (selectedIds as string[]).includes(id) : id === selectedId;
  const orderOf = (id: string) => (multi ? (selectedIds as string[]).indexOf(id) : -1);
  const capped =
    multi && maxSelections !== undefined && (selectedIds as string[]).length >= maxSelections;
  const cellClass = (selected: boolean) =>
    cn(
      "rounded-xl border overflow-hidden text-left transition-colors",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust-600",
      "disabled:cursor-not-allowed disabled:opacity-40",
      selected
        ? "border-rust-700 ring-2 ring-rust-700/30"
        : "border-charcoal-900/15 hover:border-rust-600/50"
    );

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 bg-charcoal-950/60 cursor-default"
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-cream shadow-xl flex flex-col">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-charcoal-900/10">
          <h2 className="font-serif text-xl">{title}</h2>
          <Button ref={closeRef} variant="outline" size="sm" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {failed ? (
            <p className="font-sans text-sm text-ember">{errorLabel}</p>
          ) : (
            <>
              {thumbs.length < styles.length && (
                <p
                  role="status"
                  aria-label={loadingLabel}
                  className="font-sans text-xs text-charcoal-800/60 mb-3"
                >
                  {thumbs.length} / {styles.length}
                </p>
              )}
              {STYLE_CATEGORIES.map((category) => {
                const group = styles.filter((s) => s.category === category);
                if (group.length === 0) return null;
                return (
                  <section key={category} aria-label={CATEGORY_NAMES[category]} className="mt-4 first:mt-0">
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal-800/60 mb-2">
                      {CATEGORY_NAMES[category]}
                    </h3>
                    <div role={multi ? "group" : "radiogroup"} aria-label={CATEGORY_NAMES[category]} className="grid grid-cols-2 gap-3">
                      {group.map((style) => {
                        const url = urls.get(style.id);
                        const selected = isSelected(style.id);
                        const order = orderOf(style.id);
                        if (!url) {
                          return (
                            <div
                              key={style.id}
                              aria-hidden="true"
                              className="rounded-xl border border-charcoal-900/15 bg-white overflow-hidden"
                            >
                              <StyleThumbSkeleton name={style.name} />
                            </div>
                          );
                        }
                        return (
                          <button
                            key={style.id}
                            type="button"
                            role={multi ? "checkbox" : "radio"}
                            aria-checked={selected}
                            title={style.name}
                            disabled={multi && !selected && capped}
                            onClick={() => onSelect(style.id)}
                            className={cellClass(selected)}
                          >
                            <StyleThumbImage
                              url={url}
                              name={`${multi && selected ? `${order + 1} · ` : ""}${style.name}`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
