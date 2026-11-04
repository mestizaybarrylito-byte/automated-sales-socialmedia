"use client";

import { useEffect, useState } from "react";
import { localStore, type StoreProduct } from "@/lib/store";
import { formatMXN } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const empty: StoreProduct = {
  slug: "", name: "", priceMXN: 0, pricePlaceholder: true,
  description: "", image: "", category: "corte", active: true,
};

const categories = ["corte", "salsa", "paquete"] as const;

export default function ProductosPage() {
  const [rows, setRows] = useState<StoreProduct[]>([]);
  const [form, setForm] = useState<StoreProduct>(empty);
  const [editing, setEditing] = useState(false);
  const [aiName, setAiName] = useState("");
  const [aiCategory, setAiCategory] = useState<StoreProduct["category"]>("corte");
  const [aiRunning, setAiRunning] = useState(false);
  const [aiWonder, setAiWonder] = useState(false);
  const [aiLog, setAiLog] = useState<string[]>([]);
  const [aiSource, setAiSource] = useState<"model" | "fallback" | null>(null);
  const [cutFile, setCutFile] = useState<File | null>(null);
  const [cutPrompt, setCutPrompt] = useState("dish");
  const [cutRunning, setCutRunning] = useState(false);
  const [cutPreview, setCutPreview] = useState<string | null>(null);
  const [cutError, setCutError] = useState<string | null>(null);
  const [cutSaved, setCutSaved] = useState<string | null>(null);

  useEffect(() => setRows(localStore.listProducts()), []);

  function reset() {
    setForm(empty);
    setEditing(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    localStore.saveProduct({ ...form, pricePlaceholder: true });
    setRows(localStore.listProducts());
    reset();
  }

  function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("read"));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("decode"));
      img.src = src;
    });
  }

  /** Normalize any generated image to a PNG data URL at natural size. */
  async function imageToPng(src: string): Promise<string> {
    const img = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  }

  /** SAM cutout: segment the subject, composite transparency on canvas. */
  async function runCutout() {
    if (!cutFile || cutRunning) return;
    setCutRunning(true);
    setCutError(null);
    setCutPreview(null);
    setCutSaved(null);
    try {
      const dataUrl = await readAsDataUrl(cutFile);
      const res = await fetch("/api/ai/cutout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl, prompt: cutPrompt.trim() || "dish" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        frame: { w: number; h: number } | null;
        objects: {
          box: { x1: number; y1: number; x2: number; y2: number };
          maskW: number;
          maskH: number;
          rasterBase64: string;
        }[];
      };
      if (!data.frame || data.objects.length === 0) {
        throw new Error("empty");
      }
      const img = await loadImage(dataUrl);
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, W, H);
      // Start fully transparent, then paint the masked subject (largest first).
      const out = ctx.createImageData(W, H);
      const sx = W / data.frame.w;
      const sy = H / data.frame.h;
      for (const obj of data.objects.slice(0, 1)) {
        const raw = atob(obj.rasterBase64);
        const raster = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) raster[i] = raw.charCodeAt(i);
        const bx0 = Math.floor(obj.box.x1 * sx);
        const by0 = Math.floor(obj.box.y1 * sy);
        const bx1 = Math.ceil(obj.box.x2 * sx);
        const by1 = Math.ceil(obj.box.y2 * sy);
        for (let y = Math.max(0, by0); y < Math.min(H, by1); y++) {
          for (let x = Math.max(0, bx0); x < Math.min(W, bx1); x++) {
            const mx = Math.min(
              obj.maskW - 1,
              Math.floor(((x - bx0) / Math.max(1, bx1 - bx0)) * obj.maskW)
            );
            const my = Math.min(
              obj.maskH - 1,
              Math.floor(((y - by0) / Math.max(1, by1 - by0)) * obj.maskH)
            );
            if (raster[my * obj.maskW + mx] === 1) {
              const i = (y * W + x) * 4;
              out.data[i] = pixels.data[i];
              out.data[i + 1] = pixels.data[i + 1];
              out.data[i + 2] = pixels.data[i + 2];
              out.data[i + 3] = 255;
            }
          }
        }
      }
      ctx.putImageData(out, 0, 0);
      setCutPreview(canvas.toDataURL("image/png"));
    } catch {
      setCutError("No se pudo recortar. Prueba con otra foto u otro objeto.");
    } finally {
      setCutRunning(false);
    }
  }

  async function saveCutout() {
    if (!cutPreview) return;
    const slugBase = (form.slug || form.name || "producto")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const res = await fetch("/api/ai/save-cutout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slugBase || "producto", pngBase64: cutPreview.split(",")[1] }),
    });
    if (!res.ok) {
      setCutError("No se pudo guardar el recorte.");
      return;
    }
    const data = (await res.json()) as { path: string };
    setForm({ ...form, image: data.path });
    setCutSaved(data.path);
  }

  function slugify(value: string): string {
    const base =
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "producto";
    let slug = base;
    let n = 2;
    const taken = new Set(rows.map((r) => r.slug));
    while (taken.has(slug)) slug = `${base}-${n++}`;
    return slug;
  }

  /** AI agent flow: the model fills the form (description + price) and saves. */
  async function runAiAssist() {
    const name = aiName.trim();
    if (name.length < 2 || aiRunning) return;
    setAiRunning(true);
    setAiSource(null);
    const log: string[] = [`Consultando agentes CGMO + CRO para “${name}”…`];
    setAiLog([...log]);
    try {
      const res = await fetch("/api/ai/product-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category: aiCategory,
          tier: aiWonder ? "wonder" : "spark",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        source: "model" | "fallback";
        model: string | null;
        description: string;
        priceMXN: number;
        priceRationale: string;
      };
      setAiSource(data.source);
      log.push(
        data.source === "model"
          ? `Modelo IA respondió (${data.model}) con descripción y precio.`
          : "Modelo no disponible: se usó el asistente local."
      );
      log.push(`Descripción profesional generada (${data.description.length} caracteres).`);
      log.push(`Precio sugerido: $${data.priceMXN} MXN — ${data.priceRationale}`);
      setAiLog([...log]);
      // Matching product image (best effort — never blocks the save).
      const slug = slugify(name);
      let imagePath = "";
      try {
        log.push("Generando imagen del producto…");
        setAiLog([...log]);
        const imgRes = await fetch("/api/ai/campaign-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productName: name, category: aiCategory }),
        });
        if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
        const imgData = (await imgRes.json()) as { imageBase64: string; mimeType: string };
        const png = await imageToPng(`data:${imgData.mimeType};base64,${imgData.imageBase64}`);
        const saveRes = await fetch("/api/ai/save-cutout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, pngBase64: png.split(",")[1], kind: "product" }),
        });
        if (!saveRes.ok) throw new Error(`HTTP ${saveRes.status}`);
        imagePath = ((await saveRes.json()) as { path: string }).path;
        log.push(`Imagen guardada (${imagePath}).`);
      } catch {
        log.push("No se pudo generar la imagen; se guarda sin foto.");
      }
      setAiLog([...log]);
      const product: StoreProduct = {
        slug,
        name,
        priceMXN: data.priceMXN,
        pricePlaceholder: true,
        description: data.description,
        image: imagePath,
        category: aiCategory,
        active: true,
      };
      // Show the values landing in the form, then save through the same path.
      setForm(product);
      setEditing(false);
      log.push("Llenando el formulario…");
      setAiLog([...log]);
      await new Promise((resolve) => setTimeout(resolve, 600));
      localStore.saveProduct(product);
      const next = localStore.listProducts();
      setRows(next);
      reset();
      setAiName("");
      log.push(`Guardado. Lista actualizada: ${next.length} productos.`);
      setAiLog([...log]);
    } catch (err) {
      log.push(`Error: ${err instanceof Error ? err.message : "falló la solicitud"}.`);
      setAiLog([...log]);
    } finally {
      setAiRunning(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl">Productos</h1>
      <p className="text-charcoal-800/70 mt-2">
        {rows.length} productos. Todos los precios se muestran como placeholder.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl">Crear con IA</CardTitle>
            {aiSource && (
              <Badge variant={aiSource === "model" ? "default" : "secondary"}>
                {aiSource === "model" ? "Modelo IA" : "Asistente local"}
              </Badge>
            )}
          </div>
          <p className="font-sans text-sm text-charcoal-800/60">
            Los agentes CGMO y CRO redactan la descripción profesional y sugieren el precio;
            el modelo llena el formulario y guarda el producto.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
            <label className="text-sm grid gap-1">
              Nombre del producto
              <input
                className="border rounded px-3 py-2"
                value={aiName}
                disabled={aiRunning}
                placeholder="Ej. Costilla cargada"
                onChange={(e) => setAiName(e.target.value)}
              />
            </label>
            <label className="text-sm grid gap-1">
              Categoría
              <select
                className="border rounded px-3 py-2"
                value={aiCategory}
                disabled={aiRunning}
                onChange={(e) => setAiCategory(e.target.value as StoreProduct["category"])}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <Button onClick={runAiAssist} disabled={aiRunning || aiName.trim().length < 2}>
                {aiRunning ? "Generando…" : "Generar con IA y guardar"}
              </Button>
            </div>
          </div>
          <label className="mt-3 text-sm flex items-center gap-2 text-charcoal-800/80">
            <input
              type="checkbox"
              checked={aiWonder}
              disabled={aiRunning}
              onChange={(e) => setAiWonder(e.target.checked)}
            />
            Copy premium (Muse Wonder)
          </label>
          {aiLog.length > 0 && (
            <ol className="mt-4 grid gap-1 font-sans text-sm text-charcoal-800/80" role="status">
              {aiLog.map((line, i) => (
                <li key={i}>• {line}</li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{editing ? "Actualizar producto" : "Agregar producto"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-3">
              <label className="text-sm grid gap-1">
                Slug (identificador único)
                <input required className="border rounded px-3 py-2" value={form.slug}
                  disabled={editing}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </label>
              <label className="text-sm grid gap-1">
                Nombre
                <input required className="border rounded px-3 py-2" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="text-sm grid gap-1">
                Precio MXN (placeholder)
                <input required type="number" min={0} className="border rounded px-3 py-2"
                  value={form.priceMXN}
                  onChange={(e) => setForm({ ...form, priceMXN: Number(e.target.value) })} />
              </label>
              <label className="text-sm grid gap-1">
                Categoría
                <select className="border rounded px-3 py-2" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as StoreProduct["category"] })}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="text-sm grid gap-1">
                Imagen (ruta)
                <input className="border rounded px-3 py-2" value={form.image}
                  placeholder="/images/products/ribeye-al-carbon.jpg"
                  onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </label>
              <div className="rounded-md border border-charcoal-900/15 p-3 grid gap-2">
                <p className="text-sm font-medium">Quitar fondo con IA (SAM)</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={cutRunning}
                  onChange={(e) => setCutFile(e.target.files?.[0] ?? null)}
                  className="font-sans text-sm text-charcoal-800/80"
                />
                <label className="text-sm grid gap-1">
                  Objeto a recortar
                  <input
                    className="border rounded px-3 py-2"
                    value={cutPrompt}
                    disabled={cutRunning}
                    placeholder="dish"
                    onChange={(e) => setCutPrompt(e.target.value)}
                  />
                </label>
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={cutRunning || !cutFile}
                    onClick={runCutout}
                  >
                    {cutRunning ? "Recortando…" : "Quitar fondo"}
                  </Button>
                </div>
                {cutError && (
                  <p className="text-sm text-ember" role="alert">
                    {cutError}
                  </p>
                )}
                {cutPreview && (
                  <div className="grid gap-2">
                    <img
                      src={cutPreview}
                      alt="Recorte sin fondo"
                      className="max-h-48 rounded-md border border-charcoal-900/15 bg-[repeating-conic-gradient(#ccc_0_25%,#fff_0_50%)] bg-[length:16px_16px]"
                    />
                    {cutSaved ? (
                      <p className="font-sans text-sm text-charcoal-800/70">
                        Guardado como <code className="text-xs">{cutSaved}</code>
                      </p>
                    ) : (
                      <div>
                        <Button type="button" size="sm" onClick={saveCutout}>
                          Guardar recorte como imagen
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <label className="text-sm grid gap-1">
                Descripción
                <textarea className="border rounded px-3 py-2" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Activo
              </label>
              <div className="flex gap-2">
                <Button type="submit">{editing ? "Guardar cambios" : "Agregar"}</Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={reset}>Cancelar</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 content-start">
          {rows.map((p) => (
            <Card key={p.slug}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <Badge variant="secondary">Placeholder</Badge>
                </div>
                <p className="font-sans text-rust-700 font-semibold text-sm">
                  {formatMXN(p.priceMXN)}{" "}
                  <span className="font-normal text-charcoal-800/60">MXN · precio placeholder</span>
                </p>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-charcoal-800/80">
                <p>{p.slug} · {p.category} · {p.active ? "activo" : "inactivo"}</p>
                <Button
                  variant="outline" className="mt-3"
                  onClick={() => { setForm(p); setEditing(true); }}
                >
                  Editar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
