"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/admin";
import ImageUpload from "@/components/admin/image-upload";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `product-${Date.now()}`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/admin/products").then((r) => r.json()).then((d) => d.success && setProducts(d.data));
  }, []);

  function patch(i: number, fn: (p: Product) => Product) {
    setProducts((prev) => (prev ? prev.map((p, j) => (j === i ? fn(p) : p)) : prev));
  }

  function add() {
    setProducts((prev) => [
      ...(prev ?? []),
      {
        slug: "",
        name: { en: "", ar: "" },
        eyebrow: { en: "", ar: "" },
        title: { en: "", ar: "" },
        description: { en: "", ar: "" },
        heroImage: "",
        cta1: { label: { en: "Request a Quote", ar: "اطلب عرض سعر" }, url: "/contact" },
        cta2: { label: { en: "Book a Demo", ar: "احجز عرضاً" }, url: "/demo" },
        isCustom: true,
        enabled: true,
        sortOrder: prev?.length ?? 0,
      },
    ]);
  }

  async function save() {
    if (!products) return;
    // Auto-fill empty slugs from the English name.
    const cleaned = products.map((p) => ({ ...p, slug: p.slug.trim() || slugify(p.name.en || p.name.ar) }));
    setSaving(true);
    await fetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cleaned) });
    setProducts(cleaned);
    setSaving(false);
    setToast("Products saved!");
    setTimeout(() => setToast(""), 3000);
  }

  if (!products) return <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>;

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const label = "mb-1 block text-xs font-medium uppercase text-slate-400";

  return (
    <div className="space-y-5">
      {toast && <div className="fixed right-6 top-20 z-50 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500">Edit each product&apos;s name, hero title, details &amp; main image. Custom products get their own page.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={add} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">+ Add Product</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">{saving ? "Saving..." : "Save All"}</button>
        </div>
      </div>

      {products.map((p, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">{p.name.en || p.slug || "New product"}</span>
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">/products/{p.slug || "…"}</code>
              {p.isCustom && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">Custom page</span>}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-600"><input type="checkbox" checked={p.enabled} onChange={(e) => patch(i, (x) => ({ ...x, enabled: e.target.checked }))} /> Enabled</label>
              {p.isCustom && <button onClick={() => setProducts((prev) => prev!.filter((_, j) => j !== i))} className="rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">Remove</button>}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ImageUpload value={p.heroImage} onChange={(url) => patch(i, (x) => ({ ...x, heroImage: url }))} label="Hero / main image" />
            {p.isCustom && <div><label className={label}>Slug (URL)</label><input className={input} value={p.slug} onChange={(e) => patch(i, (x) => ({ ...x, slug: e.target.value }))} dir="ltr" placeholder="server-management" /></div>}
            <div><label className={label}>Name (EN)</label><input className={input} value={p.name.en} onChange={(e) => patch(i, (x) => ({ ...x, name: { ...x.name, en: e.target.value } }))} /></div>
            <div><label className={label}>Name (AR)</label><input className={input} value={p.name.ar} onChange={(e) => patch(i, (x) => ({ ...x, name: { ...x.name, ar: e.target.value } }))} dir="rtl" /></div>
            <div><label className={label}>Eyebrow (EN)</label><input className={input} value={p.eyebrow.en} onChange={(e) => patch(i, (x) => ({ ...x, eyebrow: { ...x.eyebrow, en: e.target.value } }))} /></div>
            <div><label className={label}>Eyebrow (AR)</label><input className={input} value={p.eyebrow.ar} onChange={(e) => patch(i, (x) => ({ ...x, eyebrow: { ...x.eyebrow, ar: e.target.value } }))} dir="rtl" /></div>
            <div><label className={label}>Hero Title (EN)</label><input className={input} value={p.title.en} onChange={(e) => patch(i, (x) => ({ ...x, title: { ...x.title, en: e.target.value } }))} /></div>
            <div><label className={label}>Hero Title (AR)</label><input className={input} value={p.title.ar} onChange={(e) => patch(i, (x) => ({ ...x, title: { ...x.title, ar: e.target.value } }))} dir="rtl" /></div>
            <div className="lg:col-span-2"><label className={label}>Details / Description (EN)</label><textarea className={input} rows={2} value={p.description.en} onChange={(e) => patch(i, (x) => ({ ...x, description: { ...x.description, en: e.target.value } }))} /></div>
            <div className="lg:col-span-2"><label className={label}>Details / Description (AR)</label><textarea className={input} rows={2} value={p.description.ar} onChange={(e) => patch(i, (x) => ({ ...x, description: { ...x.description, ar: e.target.value } }))} dir="rtl" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}
