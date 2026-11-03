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

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl">Productos</h1>
      <p className="text-charcoal-800/70 mt-2">
        {rows.length} productos. Todos los precios se muestran como placeholder.
      </p>

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
