"use client";

import { useEffect, useState } from "react";
import type { ProductBrochure } from "@/types/admin";
import RichTextEditor from "@/components/admin/rich-text-editor";

const PRODUCTS = [
  { slug: "falcon-erp-desktop", label: "Falcon ERP Desktop" },
  { slug: "falcon-cloud", label: "Falcon Cloud" },
  { slug: "odoo-services", label: "Odoo Services" },
  { slug: "server-management", label: "Server Management" },
  { slug: "data-management", label: "Data Management" },
  { slug: "applications", label: "Applications" },
];

export default function AdminBrochuresPage() {
  const [slug, setSlug] = useState(PRODUCTS[0].slug);
  const [brochure, setBrochure] = useState<ProductBrochure | null>(null);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setBrochure(null);
    fetch(`/api/admin/brochures/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBrochure(d.data);
      });
  }, [slug]);

  async function save() {
    if (!brochure) return;
    setSaving(true);
    await fetch(`/api/admin/brochures/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brochure),
    });
    setSaving(false);
    setToast("Brochure saved!");
    setTimeout(() => setToast(""), 3000);
  }

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const label = "mb-1 block text-xs font-medium uppercase text-slate-400";

  return (
    <div className="space-y-5">
      {toast && <div className="fixed right-6 top-20 z-50 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Product Brochures</h2>
          <p className="text-sm text-slate-500">Rich content shown on each product&apos;s brochure page.</p>
        </div>
        <button onClick={save} disabled={saving || !brochure} className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
      </div>

      {/* Product selector */}
      <div className="flex flex-wrap gap-2">
        {PRODUCTS.map((p) => (
          <button
            key={p.slug}
            onClick={() => setSlug(p.slug)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${slug === p.slug ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {!brochure ? (
        <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={brochure.enabled} onChange={(e) => setBrochure({ ...brochure, enabled: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
            Enabled (show brochure button + page on the website)
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={label}>Title (EN)</label><input className={input} value={brochure.title.en} onChange={(e) => setBrochure({ ...brochure, title: { ...brochure.title, en: e.target.value } })} /></div>
            <div><label className={label}>Title (AR)</label><input className={input} value={brochure.title.ar} onChange={(e) => setBrochure({ ...brochure, title: { ...brochure.title, ar: e.target.value } })} dir="rtl" /></div>
          </div>

          {/* Language toggle for content editing */}
          <div className="flex gap-2">
            {(["en", "ar"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`rounded px-3 py-1 text-xs font-semibold ${lang === l ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}>{l === "en" ? "English" : "العربية"}</button>
            ))}
          </div>

          {lang === "en" ? (
            <div>
              <label className={label}>Content (EN)</label>
              <RichTextEditor key="en" value={brochure.content.en} dir="ltr" onChange={(html) => setBrochure((b) => (b ? { ...b, content: { ...b.content, en: html } } : b))} />
            </div>
          ) : (
            <div>
              <label className={label}>Content (AR)</label>
              <RichTextEditor key="ar" value={brochure.content.ar} dir="rtl" onChange={(html) => setBrochure((b) => (b ? { ...b, content: { ...b.content, ar: html } } : b))} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
