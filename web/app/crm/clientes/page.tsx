"use client";

import { useEffect, useState } from "react";
import { localStore, uid, type Customer } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const empty: Customer = { id: "", name: "", phone: "", email: "", notes: "", createdAt: "" };

export default function ClientesPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [form, setForm] = useState<Customer>(empty);
  const [editing, setEditing] = useState(false);

  useEffect(() => setRows(localStore.listCustomers()), []);

  function reset() {
    setForm(empty);
    setEditing(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c: Customer = {
      ...form,
      id: editing && form.id ? form.id : uid("cli"),
      createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
    };
    localStore.saveCustomer(c);
    setRows(localStore.listCustomers());
    reset();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl">Clientes</h1>
      <p className="text-charcoal-800/70 mt-2">{rows.length} clientes registrados (datos mock locales).</p>

      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{editing ? "Actualizar cliente" : "Agregar cliente"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-3">
              <label className="text-sm grid gap-1">
                Nombre
                <input required className="border rounded px-3 py-2" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="text-sm grid gap-1">
                Teléfono
                <input required className="border rounded px-3 py-2" value={form.phone}
                  placeholder="+52 999 000 0000"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
              <label className="text-sm grid gap-1">
                Email (opcional)
                <input className="border rounded px-3 py-2" value={form.email ?? ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="text-sm grid gap-1">
                Notas (opcional)
                <textarea className="border rounded px-3 py-2" value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
          {rows.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                  <Badge variant="secondary">{c.id}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-charcoal-800/80">
                <p>{c.phone}{c.email ? ` · ${c.email}` : ""}</p>
                {c.notes && <p className="mt-1">{c.notes}</p>}
                <Button
                  variant="outline" className="mt-3"
                  onClick={() => { setForm(c); setEditing(true); }}
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
