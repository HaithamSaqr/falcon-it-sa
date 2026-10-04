"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/types/admin";
import { ERP_PRODUCT_PAGE } from "@/lib/public-chrome";
import { adminPageHref } from "@/lib/admin/page-keys";

/** The /erp page an ERP product moved to, or null for a supporting service. */
function erpPath(slug: string): string | null {
  return Object.hasOwn(ERP_PRODUCT_PAGE, slug) ? ERP_PRODUCT_PAGE[slug] : null;
}

/** Page key of the v2 page that shows this product. */
function productPageKey(slug: string): string | null {
  const erp = erpPath(slug);
  if (erp) return `erp:${erp.split("/").pop()}`;
  return /^[a-z0-9][a-z0-9-]*$/.test(slug) ? `product:${slug}` : null;
}
import ImageUpload from "@/components/admin/image-upload";
import RichTextEditor from "@/components/admin/rich-text-editor";

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
        cardImage: "",
        embedHtml: { en: "", ar: "" },
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
          <p className="text-sm text-slate-500">Product names, short descriptions and on/off. Each product&apos;s page content is edited in Pages.</p>
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
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{erpPath(p.slug) ?? `/products/${p.slug || "..."}`}</code>
              {p.isCustom && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">Custom page</span>}
            </div>
            <div className="flex items-center gap-3">
              {productPageKey(p.slug) && (
                <Link href={adminPageHref(productPageKey(p.slug)!)} className="rounded-md bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-100">
                  {erpPath(p.slug) ? `Edit page (${erpPath(p.slug)})` : "Edit page"}
                </Link>
              )}
              <label className="flex items-center gap-1.5 text-xs text-slate-600"><input type="checkbox" checked={p.enabled} onChange={(e) => patch(i, (x) => ({ ...x, enabled: e.target.checked }))} /> Enabled</label>
              {p.isCustom && <button onClick={() => setProducts((prev) => prev!.filter((_, j) => j !== i))} className="rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">Remove</button>}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {p.isCustom && <div className="lg:col-span-2"><label className={label}>Slug (URL)</label><input className={input} value={p.slug} onChange={(e) => patch(i, (x) => ({ ...x, slug: e.target.value }))} dir="ltr" placeholder="server-management" /></div>}
            <div><label className={label}>Name (EN)</label><input className={input} value={p.name.en} onChange={(e) => patch(i, (x) => ({ ...x, name: { ...x.name, en: e.target.value } }))} /></div>
            <div><label className={label}>Name (AR)</label><input className={input} value={p.name.ar} onChange={(e) => patch(i, (x) => ({ ...x, name: { ...x.name, ar: e.target.value } }))} dir="rtl" lang="ar" /></div>
            <div className="lg:col-span-2"><label className={label}>Short description (EN)</label><textarea className={input} rows={2} value={p.description.en} onChange={(e) => patch(i, (x) => ({ ...x, description: { ...x.description, en: e.target.value } }))} /></div>
            <div className="lg:col-span-2"><label className={label}>Short description (AR)</label><textarea className={input} rows={2} value={p.description.ar} onChange={(e) => patch(i, (x) => ({ ...x, description: { ...x.description, ar: e.target.value } }))} dir="rtl" lang="ar" /></div>
          </div>
          <p className="mt-3 text-xs text-slate-500">The page itself (headline, sections, images) is edited in Pages. Use &quot;Edit page&quot; above.</p>

          {/* Pre-v2 fields: kept in the database, not rendered by the v2 site. */}
          <details className="mt-4 border-t border-slate-100 pt-3">
            <summary className="cursor-pointer text-xs font-medium text-slate-500">Older fields (not used on the v2 site)</summary>
            <div className="mt-3 grid gap-4 opacity-80 lg:grid-cols-2">
              <ImageUpload value={p.heroImage} onChange={(url) => patch(i, (x) => ({ ...x, heroImage: url }))} label="Hero / main image (not used on the v2 site)" />
              <ImageUpload value={p.cardImage} onChange={(url) => patch(i, (x) => ({ ...x, cardImage: url }))} label="Card image (not used on the v2 site)" />
              <div><label className={label}>Eyebrow (EN, not used)</label><input className={input} value={p.eyebrow.en} onChange={(e) => patch(i, (x) => ({ ...x, eyebrow: { ...x.eyebrow, en: e.target.value } }))} /></div>
              <div><label className={label}>Eyebrow (AR, not used)</label><input className={input} value={p.eyebrow.ar} onChange={(e) => patch(i, (x) => ({ ...x, eyebrow: { ...x.eyebrow, ar: e.target.value } }))} dir="rtl" /></div>
              <div><label className={label}>Hero title (EN, not used)</label><input className={input} value={p.title.en} onChange={(e) => patch(i, (x) => ({ ...x, title: { ...x.title, en: e.target.value } }))} /></div>
              <div><label className={label}>Hero title (AR, not used)</label><input className={input} value={p.title.ar} onChange={(e) => patch(i, (x) => ({ ...x, title: { ...x.title, ar: e.target.value } }))} dir="rtl" /></div>
              <div className="lg:col-span-2">
                <label className={label}>Embedded HTML block (not used on the v2 site)</label>
                <div className="grid gap-4 lg:grid-cols-2">
                  <RichTextEditor value={p.embedHtml?.en ?? ""} dir="ltr" onChange={(html) => patch(i, (x) => ({ ...x, embedHtml: { ...x.embedHtml, en: html } }))} />
                  <RichTextEditor value={p.embedHtml?.ar ?? ""} dir="rtl" onChange={(html) => patch(i, (x) => ({ ...x, embedHtml: { ...x.embedHtml, ar: html } }))} />
                </div>
              </div>
            </div>
          </details>
        </div>
      ))}
    </div>
  );
}
