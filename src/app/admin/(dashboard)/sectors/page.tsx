"use client";

import { useEffect, useState } from "react";
import type { Sector, SectorSystem } from "@/types/admin";

const SYSTEMS: { key: SectorSystem; label: string }[] = [
  { key: "desktop", label: "Falcon Desktop" },
  { key: "cloud", label: "Falcon Cloud" },
  { key: "odoo", label: "Odoo" },
];

const GRADIENTS = [
  "bg-gradient-to-br from-primary-800 to-primary-600",
  "bg-gradient-to-tr from-primary-900 to-primary-700",
  "bg-gradient-to-bl from-primary-700 to-dark-lighter",
  "bg-gradient-to-r from-dark to-primary-800",
];

function genId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `sec_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }
}

export default function AdminSectorsPage() {
  const [sectors, setSectors] = useState<Sector[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/admin/sectors")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSectors(d.data);
      });
  }, []);

  function patch(i: number, fn: (s: Sector) => Sector) {
    setSectors((prev) => (prev ? prev.map((s, j) => (j === i ? fn(s) : s)) : prev));
  }

  function add() {
    setSectors((prev) => [
      ...(prev ?? []),
      {
        id: genId(),
        icon: "🏢",
        gradient: GRADIENTS[((prev?.length ?? 0) % GRADIENTS.length)],
        name: { en: "", ar: "" },
        title: { en: "", ar: "" },
        description: { en: "", ar: "" },
        systems: ["cloud"],
        featured: false,
        enabled: true,
        sortOrder: prev?.length ?? 0,
      },
    ]);
  }

  async function save() {
    if (!sectors) return;
    setSaving(true);
    await fetch("/api/admin/sectors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sectors),
    });
    setSaving(false);
    setToast("Sectors saved!");
    setTimeout(() => setToast(""), 3000);
  }

  if (!sectors) return <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>;

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const label = "mb-1 block text-xs font-medium uppercase text-slate-400";

  return (
    <div className="space-y-5">
      {toast && <div className="fixed right-6 top-20 z-50 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sectors</h2>
          <p className="text-sm text-slate-500">Manage industry sectors shown on the home page and landing pages.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={add} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">+ Add Sector</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">{saving ? "Saving..." : "Save All"}</button>
        </div>
      </div>

      {sectors.map((s, i) => (
        <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.icon || "🏢"}</span>
              <span className="text-sm font-semibold text-slate-700">{s.name.en || s.id}</span>
              {s.featured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Featured</span>}
              {!s.enabled && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Hidden</span>}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-600"><input type="checkbox" checked={s.featured} onChange={(e) => patch(i, (x) => ({ ...x, featured: e.target.checked }))} /> Featured</label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600"><input type="checkbox" checked={s.enabled} onChange={(e) => patch(i, (x) => ({ ...x, enabled: e.target.checked }))} /> Enabled</label>
              <button onClick={() => setSectors((prev) => prev!.filter((_, j) => j !== i))} className="rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">Remove</button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><label className={label}>Slug / ID</label><input className={input} value={s.id} onChange={(e) => patch(i, (x) => ({ ...x, id: e.target.value.trim() }))} dir="ltr" /></div>
            <div><label className={label}>Icon (emoji)</label><input className={input} value={s.icon} onChange={(e) => patch(i, (x) => ({ ...x, icon: e.target.value }))} /></div>
            <div className="lg:col-span-2"><label className={label}>Systems</label>
              <div className="flex gap-3 pt-2">
                {SYSTEMS.map((sys) => (
                  <label key={sys.key} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <input type="checkbox" checked={s.systems.includes(sys.key)} onChange={(e) => patch(i, (x) => ({ ...x, systems: e.target.checked ? [...x.systems, sys.key] : x.systems.filter((y) => y !== sys.key) }))} />
                    {sys.label}
                  </label>
                ))}
              </div>
            </div>
            <div><label className={label}>Name (EN)</label><input className={input} value={s.name.en} onChange={(e) => patch(i, (x) => ({ ...x, name: { ...x.name, en: e.target.value } }))} /></div>
            <div><label className={label}>Name (AR)</label><input className={input} value={s.name.ar} onChange={(e) => patch(i, (x) => ({ ...x, name: { ...x.name, ar: e.target.value } }))} dir="rtl" /></div>
            <div><label className={label}>Title (EN)</label><input className={input} value={s.title.en} onChange={(e) => patch(i, (x) => ({ ...x, title: { ...x.title, en: e.target.value } }))} /></div>
            <div><label className={label}>Title (AR)</label><input className={input} value={s.title.ar} onChange={(e) => patch(i, (x) => ({ ...x, title: { ...x.title, ar: e.target.value } }))} dir="rtl" /></div>
            <div className="sm:col-span-2"><label className={label}>Description (EN)</label><textarea className={input} rows={2} value={s.description.en} onChange={(e) => patch(i, (x) => ({ ...x, description: { ...x.description, en: e.target.value } }))} /></div>
            <div className="sm:col-span-2"><label className={label}>Description (AR)</label><textarea className={input} rows={2} value={s.description.ar} onChange={(e) => patch(i, (x) => ({ ...x, description: { ...x.description, ar: e.target.value } }))} dir="rtl" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}
