"use client";

import { useEffect, useState } from "react";
import type { Client, ClientTag } from "@/types/admin";
import ImageUpload from "@/components/admin/image-upload";

function genId(prefix: string) {
  try {
    return crypto.randomUUID();
  } catch {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [tags, setTags] = useState<ClientTag[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/admin/clients").then((r) => r.json()).then((d) => d.success && setClients(d.data));
    fetch("/api/admin/client-tags").then((r) => r.json()).then((d) => d.success && setTags(d.data));
  }, []);

  function patchClient(i: number, fn: (c: Client) => Client) {
    setClients((prev) => (prev ? prev.map((c, j) => (j === i ? fn(c) : c)) : prev));
  }

  async function save() {
    if (!clients || !tags) return;
    setSaving(true);
    // Save tag definitions first, then clients (which reference tag ids).
    await fetch("/api/admin/client-tags", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tags) });
    await fetch("/api/admin/clients", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clients) });
    setSaving(false);
    setToast("Saved!");
    setTimeout(() => setToast(""), 3000);
  }

  if (!clients || !tags) return <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>;

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const label = "mb-1 block text-xs font-medium uppercase text-slate-400";

  return (
    <div className="space-y-6">
      {toast && <div className="fixed right-6 top-20 z-50 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Clients</h2>
          <p className="text-sm text-slate-500">Define tags (bilingual), then pick them per client. Tags show in the visitor&apos;s language.</p>
        </div>
        <button onClick={save} disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">{saving ? "Saving..." : "Save All"}</button>
      </div>

      {/* Tag definitions */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Client Tags</h3>
          <button
            onClick={() => setTags((t) => [...(t ?? []), { id: genId("tag"), name: { en: "", ar: "" }, sortOrder: t?.length ?? 0 }])}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >+ Add Tag</button>
        </div>
        {tags.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 py-4 text-center text-sm text-slate-400">No tags yet. Add tags to use them on clients.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {tags.map((t, i) => (
            <div key={t.id} className="flex items-end gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2">
              <div className="flex-1"><label className={label}>Tag (EN)</label><input className={input} value={t.name.en} onChange={(e) => setTags((arr) => arr!.map((x, j) => (j === i ? { ...x, name: { ...x.name, en: e.target.value } } : x)))} placeholder="Retail" /></div>
              <div className="flex-1"><label className={label}>Tag (AR)</label><input className={input} value={t.name.ar} onChange={(e) => setTags((arr) => arr!.map((x, j) => (j === i ? { ...x, name: { ...x.name, ar: e.target.value } } : x)))} dir="rtl" placeholder="التجزئة" /></div>
              <button onClick={() => setTags((arr) => arr!.filter((_, j) => j !== i))} className="rounded-md px-2 py-2 text-xs font-medium text-red-500 hover:bg-red-50">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Clients */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Clients ({clients.length})</h3>
        <button
          onClick={() => setClients((p) => [...(p ?? []), { id: genId("cl"), name: { en: "", ar: "" }, logo: "", tags: [], sortOrder: p?.length ?? 0 }])}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >+ Add Client</button>
      </div>

      {clients.map((c, i) => (
        <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid items-start gap-4 sm:grid-cols-[auto_1fr_1fr_auto]">
            <ImageUpload value={c.logo} onChange={(url) => patchClient(i, (x) => ({ ...x, logo: url }))} label="Logo" />
            <div><label className={label}>Name (EN)</label><input className={input} value={c.name.en} onChange={(e) => patchClient(i, (x) => ({ ...x, name: { ...x.name, en: e.target.value } }))} /></div>
            <div><label className={label}>Name (AR)</label><input className={input} value={c.name.ar} onChange={(e) => patchClient(i, (x) => ({ ...x, name: { ...x.name, ar: e.target.value } }))} dir="rtl" /></div>
            <button onClick={() => setClients((p) => p!.filter((_, j) => j !== i))} className="self-start rounded-md px-2 py-2 text-xs font-medium text-red-500 hover:bg-red-50">Remove</button>
          </div>
          <div className="mt-3">
            <label className={label}>Tags</label>
            {tags.length === 0 ? (
              <p className="text-xs text-slate-400">Add tags above first.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const checked = c.tags.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => patchClient(i, (x) => ({ ...x, tags: checked ? x.tags.filter((id) => id !== t.id) : [...x.tags, t.id] }))}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${checked ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                    >
                      {t.name.en || t.name.ar || t.id}{t.name.ar ? ` · ${t.name.ar}` : ""}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
