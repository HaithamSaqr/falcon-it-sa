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

// Country options for per-sector video routing (ISO-2 codes from /api/geo).
const VIDEO_COUNTRIES: { code: string; label: string }[] = [
  { code: "SA", label: "🇸🇦 Saudi Arabia" },
  { code: "EG", label: "🇪🇬 Egypt" },
  { code: "AE", label: "🇦🇪 UAE (Dubai)" },
  { code: "KW", label: "🇰🇼 Kuwait" },
  { code: "QA", label: "🇶🇦 Qatar" },
  { code: "BH", label: "🇧🇭 Bahrain" },
  { code: "OM", label: "🇴🇲 Oman" },
  { code: "JO", label: "🇯🇴 Jordan" },
  { code: "US", label: "🇺🇸 United States" },
  { code: "GB", label: "🇬🇧 United Kingdom" },
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
        videoUrl: "",
        videoDomains: [],
        videoCountries: [],
        ctaDomains: [],
        ctaCountries: [],
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
            <div className="sm:col-span-2 lg:col-span-4"><label className={label}>Default Video URL (YouTube / Vimeo — shown embedded on the landing page)</label><input className={input} value={s.videoUrl} onChange={(e) => patch(i, (x) => ({ ...x, videoUrl: e.target.value }))} dir="ltr" placeholder="https://www.youtube.com/watch?v=..." /></div>

            {/* Video routing per sector — by domain / by country */}
            <div className="sm:col-span-2 lg:col-span-4 rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-4">
              <p className="text-xs text-slate-500">Video routing (optional). Priority: <b>visitor country</b> → <b>domain</b> → the default video above.</p>

              {/* By domain */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">By domain</span>
                  <button type="button" onClick={() => patch(i, (x) => ({ ...x, videoDomains: [...(x.videoDomains ?? []), { id: genId(), domain: "", videoUrl: "" }] }))} className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-300">+ Domain</button>
                </div>
                <div className="space-y-1.5">
                  {(s.videoDomains ?? []).map((v, k) => (
                    <div key={v.id} className="flex flex-wrap items-center gap-1.5">
                      <input className={`${input} w-40`} value={v.domain} onChange={(e) => patch(i, (x) => ({ ...x, videoDomains: x.videoDomains.map((y, m) => (m === k ? { ...y, domain: e.target.value } : y)) }))} dir="ltr" placeholder="falcon-it.com.eg" />
                      <input className={`${input} flex-1 min-w-[180px]`} value={v.videoUrl} onChange={(e) => patch(i, (x) => ({ ...x, videoDomains: x.videoDomains.map((y, m) => (m === k ? { ...y, videoUrl: e.target.value } : y)) }))} dir="ltr" placeholder="https://youtube.com/watch?v=..." />
                      <button type="button" onClick={() => patch(i, (x) => ({ ...x, videoDomains: x.videoDomains.filter((_, m) => m !== k) }))} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* By country */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">By visitor country (overrides domain)</span>
                  <button type="button" onClick={() => patch(i, (x) => ({ ...x, videoCountries: [...(x.videoCountries ?? []), { id: genId(), country: "SA", videoUrl: "" }] }))} className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-300">+ Country</button>
                </div>
                <div className="space-y-1.5">
                  {(s.videoCountries ?? []).map((v, k) => (
                    <div key={v.id} className="flex flex-wrap items-center gap-1.5">
                      <select className={`${input} w-44`} value={v.country} onChange={(e) => patch(i, (x) => ({ ...x, videoCountries: x.videoCountries.map((y, m) => (m === k ? { ...y, country: e.target.value } : y)) }))}>
                        {VIDEO_COUNTRIES.every((o) => o.code !== v.country) && v.country && <option value={v.country}>{v.country}</option>}
                        {VIDEO_COUNTRIES.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                      </select>
                      <input className={`${input} flex-1 min-w-[180px]`} value={v.videoUrl} onChange={(e) => patch(i, (x) => ({ ...x, videoCountries: x.videoCountries.map((y, m) => (m === k ? { ...y, videoUrl: e.target.value } : y)) }))} dir="ltr" placeholder="https://youtube.com/watch?v=..." />
                      <button type="button" onClick={() => patch(i, (x) => ({ ...x, videoCountries: x.videoCountries.filter((_, m) => m !== k) }))} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Per-sector CTA override (overrides global WhatsApp Routing / Landing CTA) */}
            <div className="sm:col-span-2 lg:col-span-4 rounded-lg border border-amber-200 bg-amber-50/40 p-3 space-y-4">
              <p className="text-xs text-slate-500">CTA override (optional). Set a WhatsApp number or a link per domain/country — overrides the global Settings. Priority: <b>visitor country</b> → <b>domain</b> → global default.</p>

              {/* By domain */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">By domain</span>
                  <button type="button" onClick={() => patch(i, (x) => ({ ...x, ctaDomains: [...(x.ctaDomains ?? []), { id: genId(), domain: "", kind: "whatsapp", value: "" }] }))} className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-300">+ Domain</button>
                </div>
                <div className="space-y-1.5">
                  {(s.ctaDomains ?? []).map((v, k) => (
                    <div key={v.id} className="flex flex-wrap items-center gap-1.5">
                      <input className={`${input} w-36`} value={v.domain} onChange={(e) => patch(i, (x) => ({ ...x, ctaDomains: x.ctaDomains.map((y, m) => (m === k ? { ...y, domain: e.target.value } : y)) }))} dir="ltr" placeholder="falcon-it.com.eg" />
                      <select className={`${input} w-28`} value={v.kind} onChange={(e) => patch(i, (x) => ({ ...x, ctaDomains: x.ctaDomains.map((y, m) => (m === k ? { ...y, kind: e.target.value as "whatsapp" | "url" } : y)) }))}>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="url">Link</option>
                      </select>
                      <input className={`${input} flex-1 min-w-[160px]`} value={v.value} onChange={(e) => patch(i, (x) => ({ ...x, ctaDomains: x.ctaDomains.map((y, m) => (m === k ? { ...y, value: e.target.value } : y)) }))} dir="ltr" placeholder={v.kind === "url" ? "https://app.../checkout" : "9665xxxxxxxx"} />
                      <button type="button" onClick={() => patch(i, (x) => ({ ...x, ctaDomains: x.ctaDomains.filter((_, m) => m !== k) }))} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* By country */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">By visitor country (overrides domain)</span>
                  <button type="button" onClick={() => patch(i, (x) => ({ ...x, ctaCountries: [...(x.ctaCountries ?? []), { id: genId(), country: "SA", kind: "whatsapp", value: "" }] }))} className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-300">+ Country</button>
                </div>
                <div className="space-y-1.5">
                  {(s.ctaCountries ?? []).map((v, k) => (
                    <div key={v.id} className="flex flex-wrap items-center gap-1.5">
                      <select className={`${input} w-40`} value={v.country} onChange={(e) => patch(i, (x) => ({ ...x, ctaCountries: x.ctaCountries.map((y, m) => (m === k ? { ...y, country: e.target.value } : y)) }))}>
                        {VIDEO_COUNTRIES.every((o) => o.code !== v.country) && v.country && <option value={v.country}>{v.country}</option>}
                        {VIDEO_COUNTRIES.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                      </select>
                      <select className={`${input} w-28`} value={v.kind} onChange={(e) => patch(i, (x) => ({ ...x, ctaCountries: x.ctaCountries.map((y, m) => (m === k ? { ...y, kind: e.target.value as "whatsapp" | "url" } : y)) }))}>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="url">Link</option>
                      </select>
                      <input className={`${input} flex-1 min-w-[160px]`} value={v.value} onChange={(e) => patch(i, (x) => ({ ...x, ctaCountries: x.ctaCountries.map((y, m) => (m === k ? { ...y, value: e.target.value } : y)) }))} dir="ltr" placeholder={v.kind === "url" ? "https://app.../checkout" : "9665xxxxxxxx"} />
                      <button type="button" onClick={() => patch(i, (x) => ({ ...x, ctaCountries: x.ctaCountries.filter((_, m) => m !== k) }))} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
