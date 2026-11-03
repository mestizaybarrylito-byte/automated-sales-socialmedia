"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useBrand } from "@/components/brand-theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bestTextOn,
  checkThemeContrast,
  contrastRatio,
  cssVarsForTheme,
  FONT_CATALOG,
  FONT_ROLES,
  MAX_COMPANY_NAME,
  MAX_STEP3_STYLES,
  normalizeCompanyName,
  normalizeHex,
  resolveFontStack,
  themeFromPalette,
  THEME_SLOTS,
  type BrandFonts,
  type BrandTheme,
} from "@/lib/brand";
import { extractPaletteFromDataUrl, processLogoFile } from "@/lib/brand-store";
import { Step3StylePicker } from "@/components/step3-style-picker";

function previewTheme(theme: BrandTheme): void {
  const vars = cssVarsForTheme(theme);
  for (const [key, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(key, value);
  }
}

function previewFonts(fonts: BrandFonts): void {
  const root = document.documentElement.style;
  root.setProperty("--brand-font-heading", resolveFontStack(fonts.heading));
  root.setProperty("--brand-font-body", resolveFontStack(fonts.body));
  root.setProperty("--brand-font-accent", resolveFontStack(fonts.accent));
}

function ratioBadge(ratio: number, required: number): string {
  if (ratio >= 7) return "AAA";
  if (ratio >= Math.max(required, 4.5)) return "AA";
  if (ratio >= required) return "AA grande";
  return "Revisar";
}

export function BrandManager() {
  const { brand, storage, supabaseError, updateBrand, resetBrand } = useBrand();
  const [draft, setDraft] = useState<BrandTheme>(brand.theme);
  const [texts, setTexts] = useState<Record<keyof BrandTheme, string>>({ ...brand.theme });
  const [nameText, setNameText] = useState(brand.companyName);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<Partial<Record<keyof BrandTheme, boolean>>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSynced = useRef(brand.updatedAt);

  // Keep the draft in sync when the brand changes elsewhere (or resets).
  useEffect(() => {
    if (lastSynced.current !== brand.updatedAt) {
      lastSynced.current = brand.updatedAt;
      setDraft(brand.theme);
      setTexts({ ...brand.theme });
      setNameText(brand.companyName);
      setInvalid({});
    }
  }, [brand.updatedAt, brand.theme, brand.companyName]);

  useEffect(
    () => () => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
      if (nameTimer.current) clearTimeout(nameTimer.current);
    },
    []
  );

  const report = useMemo(() => checkThemeContrast(draft), [draft]);
  const allPass = report.checks.every((c) => c.pass);

  function scheduleCommit(next: BrandTheme): void {
    previewTheme(next);
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      lastSynced.current = "pending";
      void updateBrand({ theme: next });
    }, 600);
  }

  function setSlot(key: keyof BrandTheme, raw: string): void {
    setTexts((prev) => ({ ...prev, [key]: raw }));
    const hex = normalizeHex(raw);
    if (!hex) {
      setInvalid((prev) => ({ ...prev, [key]: true }));
      return;
    }
    setInvalid((prev) => ({ ...prev, [key]: false }));
    if (hex === draft[key]) return;
    const next = { ...draft, [key]: hex };
    setDraft(next);
    scheduleCommit(next);
  }

  function setName(raw: string): void {
    const clipped = raw.slice(0, MAX_COMPANY_NAME);
    setNameText(clipped);
    if (nameTimer.current) clearTimeout(nameTimer.current);
    nameTimer.current = setTimeout(() => {
      if (!clipped.trim()) {
        // Never save a blank name: revert to the last saved value.
        setNameText(brand.companyName);
        return;
      }
      const clean = normalizeCompanyName(clipped);
      if (clean === brand.companyName) return;
      lastSynced.current = "pending";
      void updateBrand({ companyName: clean });
    }, 800);
  }

  function setFont(role: keyof BrandFonts, id: string): void {
    if (!FONT_CATALOG.some((f) => f.id === id) || brand.fonts[role] === id) return;
    const next = { ...brand.fonts, [role]: id };
    previewFonts(next);
    lastSynced.current = "pending";
    void updateBrand({ fonts: next });
  }

  async function onLogoFile(file: File | undefined): Promise<void> {
    setError(null);
    setNotice(null);
    if (!file) return;
    setBusy("logo");
    try {
      const dataUrl = await processLogoFile(file);
      let palette = brand.palette;
      try {
        const extracted = await extractPaletteFromDataUrl(dataUrl);
        if (extracted.length > 0) palette = extracted;
      } catch {
        /* keep the previous palette when analysis fails */
      }
      await updateBrand({ logoDataUrl: dataUrl, palette });
      setNotice(
        "Logo guardado. Revisa la paleta sugerida y aplícala al tema si te gusta."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el logo");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeLogo(): Promise<void> {
    setError(null);
    setNotice(null);
    setBusy("logo");
    try {
      await updateBrand({ logoDataUrl: null });
      setNotice("Logo eliminado: la barra superior vuelve a mostrar solo el nombre.");
    } finally {
      setBusy(null);
    }
  }

  async function applyPalette(): Promise<void> {
    setError(null);
    setBusy("palette");
    try {
      const mapped = themeFromPalette(brand.palette);
      const { checks, fixedTheme } = checkThemeContrast(mapped);
      const adjusted = checks.filter((c) => !c.pass).length;
      setDraft(fixedTheme);
      setTexts({ ...fixedTheme });
      setInvalid({});
      previewTheme(fixedTheme);
      await updateBrand({ theme: fixedTheme });
      setNotice(
        adjusted === 0
          ? "Paleta aplicada al tema sin ajustes: todos los contrastes cumplen."
          : `Paleta aplicada; ${adjusted} color${adjusted > 1 ? "es" : ""} se ajustaron para cumplir contraste AA.`
      );
    } finally {
      setBusy(null);
    }
  }

  async function fixContrast(): Promise<void> {
    setError(null);
    setBusy("contrast");
    try {
      setDraft(report.fixedTheme);
      setTexts({ ...report.fixedTheme });
      setInvalid({});
      previewTheme(report.fixedTheme);
      await updateBrand({ theme: report.fixedTheme });
      setNotice("Contraste corregido: todos los pares cumplen su objetivo.");
    } finally {
      setBusy(null);
    }
  }

  async function copyHex(hex: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1500);
    } catch {
      /* clipboard blocked: the hex is still visible to copy manually */
    }
  }

  const storageLabel =
    storage === "supabase+local"
      ? "Guardado en la base de datos (Supabase) + local"
      : "Guardado local — configura Supabase para sincronizar en todos los dispositivos";

  return (
    <div className="mt-10 space-y-6">
      <div aria-live="polite">
        {notice ? <p className="text-sm text-charcoal-800 font-medium">{notice}</p> : null}
        {error ? (
          <p role="alert" className="text-sm text-ember font-medium mt-1">
            {error}
          </p>
        ) : null}
        {supabaseError ? (
          <p className="text-sm text-charcoal-800/70 mt-1">
            Aviso de sincronización: {supabaseError}. Tus cambios están a salvo en local.
          </p>
        ) : null}
      </div>

      {/* Logo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-lg">Logotipo de marca</CardTitle>
            <Badge variant="secondary">{storageLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div
              className="w-full sm:w-64 h-32 rounded-md border border-charcoal-900/15 bg-white flex items-center justify-center p-4"
              aria-label={brand.logoDataUrl ? "Vista previa del logotipo" : "Sin logotipo"}
            >
              {brand.logoDataUrl ? (
                <img
                  src={brand.logoDataUrl}
                  alt="Logotipo actual de la marca"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <p className="font-serif text-lg text-charcoal-800/50 text-center">
                  Sin logo — se muestra el nombre
                </p>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-charcoal-800/75 max-w-xl">
                El logo aparece en la barra superior y como watermark en la
                esquina superior derecha de las imágenes generadas. Al subirlo se
                analiza su patrón de color y se sugiere una paleta de hasta seis
                colores. Puedes cambiarlo o quitarlo cuando quieras.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                className="sr-only"
                aria-label="Subir archivo de logotipo"
                onChange={(e) => void onLogoFile(e.target.files?.[0])}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  size="sm"
                  disabled={busy !== null}
                  onClick={() => fileRef.current?.click()}
                >
                  {busy === "logo"
                    ? "Procesando…"
                    : brand.logoDataUrl
                      ? "Cambiar logo"
                      : "Subir logo"}
                </Button>
                {brand.logoDataUrl ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy !== null}
                    onClick={() => void removeLogo()}
                  >
                    Quitar logo
                  </Button>
                ) : null}
              </div>
              {brand.updatedAt ? (
                <p className="text-xs text-charcoal-800/60 mt-3">
                  Último guardado: {new Date(brand.updatedAt).toLocaleString("es-MX")}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company name + typography */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nombre y tipografía</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label htmlFor="company-name" className="block text-sm font-medium">
              Nombre de la empresa
            </label>
            <p className="text-xs text-charcoal-800/60 mt-0.5">
              Se muestra en la barra superior junto al logo y en las imágenes generadas.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="company-name"
                type="text"
                value={nameText}
                maxLength={MAX_COMPANY_NAME}
                autoComplete="organization"
                onChange={(e) => setName(e.target.value)}
                className="flex-1 min-w-0 rounded-md border border-charcoal-900/20 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-rust-600"
              />
              <span className="font-mono text-xs text-charcoal-800/60 shrink-0" aria-live="polite">
                {nameText.length}/{MAX_COMPANY_NAME}
              </span>
            </div>
          </div>

          <h4 className="font-serif text-lg mt-8 mb-1">Tipografías por rol</h4>
          <p className="text-xs text-charcoal-800/60 mb-4">
            Hasta tres tipografías distintas que se aplican en cascada en toda la
            aplicación: titulares, cuerpo y acentos de interfaz.
          </p>
          <div className="grid gap-4 lg:grid-cols-3">
            {FONT_ROLES.map((slot) => (
              <div key={slot.key} className="rounded-md border border-charcoal-900/15 p-4 bg-white">
                <label htmlFor={`font-${slot.key}`} className="block text-sm font-medium">
                  {slot.label}
                </label>
                <p className="text-xs text-charcoal-800/60">{slot.role}</p>
                <select
                  id={`font-${slot.key}`}
                  value={brand.fonts[slot.key]}
                  onChange={(e) => setFont(slot.key, e.target.value)}
                  className="mt-2 w-full rounded-md border border-charcoal-900/20 bg-white px-2 py-2 text-sm focus:outline-2 focus:outline-rust-600"
                >
                  {(["Serif", "Sans", "Display", "Mono"] as const).map((cat) => (
                    <optgroup key={cat} label={cat}>
                      {FONT_CATALOG.filter((f) => f.category === cat).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p
                  aria-hidden="true"
                  className="mt-3 text-xl leading-snug"
                  style={{ fontFamily: resolveFontStack(brand.fonts[slot.key]) }}
                >
                  Fuego lento 123
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step-3 styles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-lg">Estilos del paso 3</CardTitle>
            <Badge variant="secondary">
              {brand.step3StyleIds.length}/{MAX_STEP3_STYLES} seleccionados
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Step3StylePicker />
        </CardContent>
      </Card>

      {/* Suggested palette */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-lg">Paleta sugerida del logo</CardTitle>
            <Button
              size="sm"
              variant="outline"
              disabled={busy !== null || brand.palette.length === 0}
              onClick={() => void applyPalette()}
            >
              {busy === "palette" ? "Aplicando…" : "Aplicar paleta al tema"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {brand.palette.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => void copyHex(hex)}
                className="rounded-md border border-charcoal-900/15 overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust-600"
                aria-label={`Copiar ${hex}`}
                title="Clic para copiar"
              >
                <span className="block h-16" style={{ backgroundColor: hex }} />
                <span
                  className="block px-2 py-1.5 font-mono text-xs"
                  style={{ backgroundColor: "#ffffff", color: "#1a1c1e" }}
                >
                  {copied === hex ? "¡copiado!" : hex}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-charcoal-800/60 mt-3">
            Hasta seis colores dominantes del logo, ordenados por presencia. Clic
            en un color para copiar su código.
          </p>
        </CardContent>
      </Card>

      {/* Manual theme */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-lg">Colores del tema (manual)</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                disabled={busy !== null || allPass}
                onClick={() => void fixContrast()}
              >
                {busy === "contrast" ? "Corrigiendo…" : "Corregir contraste"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={busy !== null}
                onClick={() => {
                  void resetBrand();
                  setNotice("Marca restablecida: nombre, logo, colores y tipografías base.");
                }}
              >
                Restablecer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {THEME_SLOTS.map((slot) => (
              <div key={slot.key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={draft[slot.key]}
                  aria-label={`Elegir ${slot.label}`}
                  onChange={(e) => setSlot(slot.key, e.target.value)}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded border border-charcoal-900/20 bg-white p-1"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`theme-${slot.key}`}
                    className="block text-sm font-medium leading-tight"
                  >
                    {slot.label}
                  </label>
                  <p className="text-xs text-charcoal-800/60 truncate">{slot.role}</p>
                  <input
                    id={`theme-${slot.key}`}
                    type="text"
                    value={texts[slot.key]}
                    spellCheck={false}
                    aria-label={`Código hexadecimal de ${slot.label}`}
                    onChange={(e) => setSlot(slot.key, e.target.value)}
                    className={`mt-1 w-28 rounded border px-2 py-1 font-mono text-sm ${
                      invalid[slot.key]
                        ? "border-ember ring-1 ring-ember"
                        : "border-charcoal-900/20"
                    }`}
                  />
                  {invalid[slot.key] ? (
                    <p className="text-xs text-ember mt-0.5">
                      Usa formato #rrggbb, por ejemplo #9a5f3b.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <h4 className="font-serif text-lg mt-8 mb-3">
            Legibilidad (contraste WCAG)
          </h4>
          <ul className="divide-y divide-charcoal-900/10 border-y border-charcoal-900/10">
            {report.checks.map((c) => (
              <li key={c.id} className="py-2.5 flex items-center gap-3 flex-wrap">
                <span
                  aria-hidden="true"
                  className="inline-block h-3.5 w-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: c.pass ? "#15803d" : "#c2410c" }}
                />
                <span className="text-sm font-medium flex-1 min-w-[12rem]">
                  {c.label}
                </span>
                <span className="font-mono text-xs text-charcoal-800/70">
                  {c.fg} sobre {c.bg} · {c.ratio.toFixed(1)}:1 (mín. {c.required}:1)
                </span>
                <Badge variant={c.pass ? "default" : "secondary"}>
                  {ratioBadge(c.ratio, c.required)}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="text-xs text-charcoal-800/60 mt-3">
            Los botones principales siempre usan el color de texto de mayor
            contraste ({bestTextOn(draft.primary)} sobre {draft.primary},{" "}
            {contrastRatio(bestTextOn(draft.primary), draft.primary).toFixed(1)}
            :1) y un tono hover visible, para que destaquen de forma intuitiva.
          </p>
        </CardContent>
      </Card>

      {/* Live preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vista previa en vivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md overflow-hidden border border-charcoal-900/15">
            <div className="bg-charcoal-900 text-cream px-4 py-3 flex items-center gap-3">
              {brand.logoDataUrl ? (
                <img
                  src={brand.logoDataUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-7 w-auto max-w-[7rem] object-contain rounded-[4px] bg-white/95 px-1 py-0.5"
                />
              ) : null}
              <span className="font-serif">{brand.companyName}</span>
              <span className="ml-auto text-sm text-cream/70 hidden sm:inline">
                Barra superior
              </span>
            </div>
            <div className="bg-cream px-4 py-5">
              <p className="font-serif text-2xl text-charcoal-900">
                Fuego lento, sabor de familia
              </p>
              <p className="text-sm text-charcoal-800/75 mt-1 max-w-md">
                Así se leen titulares, texto y botones con el tema actual en
                todas las páginas.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <Button size="sm">Pedir lote semanal</Button>
                <Button size="sm" variant="secondary">
                  Ver catálogo
                </Button>
                <Button size="sm" variant="outline">
                  Más información
                </Button>
                <Badge>Lote del jueves</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
