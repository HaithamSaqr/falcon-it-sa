"use client";

import { useEffect, useState } from "react";
import type { Client } from "@/types/admin";
import ImageUpload from "@/components/admin/image-upload";

function genId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `cl_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setClients(d.data);
      });
  }, []);

  function patch(i: number, fn: (c: Client) => Client) {
    setClients((prev) => (prev ? prev.map((c, j) => (j === i ? fn(c) : c)) : prev));
  }

  async function save() {
    if (!clients) return;
    setSaving(true);
    await fetch("/api/admin/clients", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clients),
    });
    setSaving(false);
    setToast("Clients saved!");
    setTimeout(() => setToast(""), 3000);
  }

  if (!clients) return <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>;

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const label = "mb-1 block text-xs font-medium uppercase text-slate-400";

  return (
    <div className="space-y-5">
      {toast && <div className="fixed right-6 top-20 z-50 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Clients</h2>
          <p className="text-sm text-slate-500">Logos + tags. Shown in the &ldquo;Our Clients&rdquo; strip and the full grid (filterable by tag).</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setClients((p) => [...(p ?? []), { id: genId(), name: { en: "", ar: "" }, logo: "", tags: [], sortOrder: p?.length ?? 0 }])}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >+ Add Client</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">{saving ? "Saving..." : "Save All"}</button>
        </div>
      </div>

      {clients.map((c, i) => (
        <div key={c.id} className="grid items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-[auto_1fr_1fr_1.5fr_auto]">
          <ImageUpload value={c.logo} onChange={(url) => patch(i, (x) => ({ ...x, logo: url }))} label="Logo" />
          <div><label className={label}>Name (EN)</label><input className={input} value={c.name.en} onChange={(e) => patch(i, (x) => ({ ...x, name: { ...x.name, en: e.target.value } }))} /></div>
          <div><label className={label}>Name (AR)</label><input className={input} value={c.name.ar} onChange={(e) => patch(i, (x) => ({ ...x, name: { ...x.name, ar: e.target.value } }))} dir="rtl" /></div>
          <div><label className={label}>Tags (comma separated)</label><input className={input} value={c.tags.join(", ")} onChange={(e) => patch(i, (x) => ({ ...x, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }))} placeholder="Retail, KSA, Enterprise" /></div>
          <button onClick={() => setClients((p) => p!.filter((_, j) => j !== i))} className="rounded-md px-2 py-2 text-xs font-medium text-red-500 hover:bg-red-50">Remove</button>
        </div>
      ))}
    </div>
  );
}
