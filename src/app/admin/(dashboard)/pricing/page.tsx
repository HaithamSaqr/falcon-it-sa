"use client";

import { useEffect, useState } from "react";
import type { PricingBase, SectorPricingOverride, Sector, SectorSystem } from "@/types/admin";

const SYSTEMS: SectorSystem[] = ["desktop", "cloud", "odoo"];

export default function AdminPricingPage() {
  const [base, setBase] = useState<PricingBase | null>(null);
  const [overrides, setOverrides] = useState<SectorPricingOverride[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/admin/pricing")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setBase(d.data.base);
          setOverrides(d.data.overrides ?? []);
        }
      });
    fetch("/api/admin/sectors")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSectors(d.data);
      });
  }, []);

  async function save() {
    if (!base) return;
    setSaving(true);
    await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base, overrides }),
    });
    setSaving(false);
    setToast("Pricing saved!");
    setTimeout(() => setToast(""), 3000);
  }

  if (!base) return <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>;

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const label = "mb-1 block text-xs font-medium uppercase text-slate-400";
  const num = (v: number) => (Number.isFinite(v) ? v : 0);

  return (
    <div className="space-y-6">
      {toast && <div className="fixed right-6 top-20 z-50 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Pricing</h2>
          <p className="text-sm text-slate-500">Base prices (USD) and per-sector overrides. Formula: users × price/user + hosting + operating + training/day × days.</p>
        </div>
        <button onClick={save} disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
      </div>

      {/* Base pricing */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Base Prices (USD)</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className={label}>Price / user</label><input type="number" className={input} value={base.pricePerUser} onChange={(e) => setBase({ ...base, pricePerUser: num(+e.target.value) })} /></div>
          <div><label className={label}>Hosting price</label><input type="number" className={input} value={base.hostingPrice} onChange={(e) => setBase({ ...base, hostingPrice: num(+e.target.value) })} /></div>
          <div><label className={label}>Operating costs</label><input type="number" className={input} value={base.operatingCosts} onChange={(e) => setBase({ ...base, operatingCosts: num(+e.target.value) })} /></div>
          <div><label className={label}>Training cost / day</label><input type="number" className={input} value={base.trainingCostPerDay} onChange={(e) => setBase({ ...base, trainingCostPerDay: num(+e.target.value) })} /></div>
          <div><label className={label}>Training days (default)</label><input type="number" className={input} value={base.trainingDays} onChange={(e) => setBase({ ...base, trainingDays: num(+e.target.value) })} /></div>
          <div><label className={label}>Discount %</label><input type="number" className={input} value={base.discountPercent} onChange={(e) => setBase({ ...base, discountPercent: num(+e.target.value) })} /></div>
          <div><label className={label}>USD → EGP rate</label><input type="number" className={input} value={base.usdToEgp} onChange={(e) => setBase({ ...base, usdToEgp: num(+e.target.value) })} /></div>
        </div>
      </div>

      {/* Per-sector overrides */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Per-Sector Overrides</h3>
            <p className="mt-0.5 text-xs text-slate-400">Override price/user, operating, training days for a sector + system. Empty = use base.</p>
          </div>
          <button
            onClick={() => setOverrides((o) => [...o, { sectorId: sectors[0]?.id ?? "", system: "cloud", pricePerUser: null, operatingCosts: null, trainingDays: null }])}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >+ Add Override</button>
        </div>
        {overrides.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">No overrides — all sectors use base pricing.</p>}
        <div className="space-y-3">
          {overrides.map((o, i) => (
            <div key={i} className="grid items-end gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
              <div>
                <label className={label}>Sector</label>
                <select className={input} value={o.sectorId} onChange={(e) => setOverrides((arr) => arr.map((x, j) => (j === i ? { ...x, sectorId: e.target.value } : x)))}>
                  {sectors.map((s) => <option key={s.id} value={s.id}>{s.name.en || s.id}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>System</label>
                <select className={input} value={o.system} onChange={(e) => setOverrides((arr) => arr.map((x, j) => (j === i ? { ...x, system: e.target.value as SectorSystem } : x)))}>
                  {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className={label}>Price/user</label><input type="number" className={input} value={o.pricePerUser ?? ""} placeholder="base" onChange={(e) => setOverrides((arr) => arr.map((x, j) => (j === i ? { ...x, pricePerUser: e.target.value === "" ? null : +e.target.value } : x)))} /></div>
              <div><label className={label}>Operating</label><input type="number" className={input} value={o.operatingCosts ?? ""} placeholder="base" onChange={(e) => setOverrides((arr) => arr.map((x, j) => (j === i ? { ...x, operatingCosts: e.target.value === "" ? null : +e.target.value } : x)))} /></div>
              <div><label className={label}>Training days</label><input type="number" className={input} value={o.trainingDays ?? ""} placeholder="base" onChange={(e) => setOverrides((arr) => arr.map((x, j) => (j === i ? { ...x, trainingDays: e.target.value === "" ? null : +e.target.value } : x)))} /></div>
              <button onClick={() => setOverrides((arr) => arr.filter((_, j) => j !== i))} className="rounded-md px-2 py-2 text-xs font-medium text-red-500 hover:bg-red-50">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
