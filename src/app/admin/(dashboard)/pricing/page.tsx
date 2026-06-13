"use client";

import { useEffect, useState } from "react";
import type { PricingBase, SectorPricingOverride, Sector, SectorSystem, VolumeDiscountTier } from "@/types/admin";

const SYSTEMS: SectorSystem[] = ["desktop", "cloud", "odoo"];
const SYSTEM_LABELS: Record<SectorSystem, string> = {
  desktop: "Falcon Desktop",
  cloud: "Falcon Cloud",
  odoo: "Odoo",
};

function VolumeDiscountEditor({
  tiers,
  onChange,
  placeholder,
}: {
  tiers: VolumeDiscountTier[] | null;
  onChange: (tiers: VolumeDiscountTier[] | null) => void;
  placeholder?: boolean;
}) {
  const input = "rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";

  if (placeholder && tiers === null) {
    return (
      <button
        type="button"
        onClick={() => onChange([])}
        className="text-xs text-cyan-600 hover:underline"
      >
        + Override volume discounts
      </button>
    );
  }

  const list = tiers ?? [];

  return (
    <div className="space-y-1.5">
      {list.map((t, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0">≥</span>
          <input
            type="number"
            className={`${input} w-20`}
            value={t.minUsers}
            min={1}
            placeholder="users"
            onChange={(e) => {
              const next = list.map((x, j) => j === i ? { ...x, minUsers: +e.target.value || 1 } : x);
              onChange(next);
            }}
          />
          <span className="text-xs text-slate-400 shrink-0">users →</span>
          <input
            type="number"
            className={`${input} w-16`}
            value={t.discountPercent}
            min={0}
            max={100}
            placeholder="%"
            onChange={(e) => {
              const next = list.map((x, j) => j === i ? { ...x, discountPercent: +e.target.value || 0 } : x);
              onChange(next);
            }}
          />
          <span className="text-xs text-slate-400 shrink-0">%</span>
          <button
            type="button"
            onClick={() => {
              const next = list.filter((_, j) => j !== i);
              onChange(placeholder && next.length === 0 ? null : next);
            }}
            className="text-red-400 hover:text-red-600 text-xs"
          >✕</button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, { minUsers: 10, discountPercent: 5 }])}
        className="text-xs text-cyan-600 hover:underline"
      >
        + Add tier
      </button>
    </div>
  );
}

export default function AdminPricingPage() {
  const [base, setBase] = useState<PricingBase | null>(null);
  const [overrides, setOverrides] = useState<SectorPricingOverride[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [query, setQuery] = useState("");
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
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base, overrides }),
      });
      const data = await res.json();
      if (data.success) {
        setToast("Pricing saved!");
      } else {
        setToast(`Error: ${data.error || "Save failed"}`);
      }
    } catch {
      setToast("Network error — save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(""), 4000);
    }
  }

  function updateOverride<K extends keyof SectorPricingOverride>(i: number, key: K, value: SectorPricingOverride[K]) {
    setOverrides((arr) => arr.map((x, j) => (j === i ? { ...x, [key]: value } : x)));
  }

  if (!base) return <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>;

  const inp = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const lbl = "mb-1 block text-xs font-medium uppercase text-slate-400";
  const num = (v: number) => (Number.isFinite(v) ? v : 0);
  const nullNum = (v: string) => v === "" ? null : +v;

  return (
    <div className="space-y-6">
      {toast && <div className="fixed right-6 top-20 z-50 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Pricing</h2>
          <p className="text-sm text-slate-500">Base prices per year (USD) and per-sector overrides.</p>
        </div>
        <button onClick={save} disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* ── Base pricing ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Base Prices per year (USD)</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className={lbl}>Price / user</label><input type="number" className={inp} value={base.pricePerUser} onChange={(e) => setBase({ ...base, pricePerUser: num(+e.target.value) })} /></div>
          <div><label className={lbl}>Hosting price</label><input type="number" className={inp} value={base.hostingPrice} onChange={(e) => setBase({ ...base, hostingPrice: num(+e.target.value) })} /></div>
          <div><label className={lbl}>Operating costs</label><input type="number" className={inp} value={base.operatingCosts} onChange={(e) => setBase({ ...base, operatingCosts: num(+e.target.value) })} /></div>
          <div><label className={lbl}>Training cost / day</label><input type="number" className={inp} value={base.trainingCostPerDay} onChange={(e) => setBase({ ...base, trainingCostPerDay: num(+e.target.value) })} /></div>
          <div><label className={lbl}>Training days (default)</label><input type="number" className={inp} value={base.trainingDays} onChange={(e) => setBase({ ...base, trainingDays: num(+e.target.value) })} /></div>
          <div><label className={lbl}>Free support (months)</label><input type="number" min={0} className={inp} value={base.freeSupportMonths ?? 0} onChange={(e) => setBase({ ...base, freeSupportMonths: Math.max(0, num(+e.target.value)) })} /></div>
          <div><label className={lbl}>Discount %</label><input type="number" className={inp} value={base.discountPercent} onChange={(e) => setBase({ ...base, discountPercent: num(+e.target.value) })} /></div>
          <div><label className={lbl}>USD → EGP rate</label><input type="number" className={inp} value={base.usdToEgp} onChange={(e) => setBase({ ...base, usdToEgp: num(+e.target.value) })} /></div>
          <div><label className={lbl}>USD → SAR rate</label><input type="number" step="0.01" className={inp} value={base.usdToSar} onChange={(e) => setBase({ ...base, usdToSar: num(+e.target.value) })} /></div>
        </div>

        {/* Training days per system */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase text-slate-400">Training Days per System (overrides base training days)</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["desktop", "cloud", "odoo"] as const).map((sys) => (
              <div key={sys}>
                <label className={lbl}>{sys === "desktop" ? "Falcon Desktop" : sys === "cloud" ? "Falcon Cloud" : "Odoo"}</label>
                <input
                  type="number"
                  className={inp}
                  value={base.systemTrainingDays?.[sys] ?? ""}
                  placeholder={`base (${base.trainingDays})`}
                  onChange={(e) => setBase({
                    ...base,
                    systemTrainingDays: {
                      ...base.systemTrainingDays,
                      [sys]: e.target.value === "" ? undefined : num(+e.target.value),
                    },
                  })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Volume discounts (base) */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase text-slate-400">Volume Discounts (additional % added to base discount)</p>
          <div className="mb-1.5 hidden grid-cols-[80px_1fr] gap-2 sm:grid">
            <span className="text-xs text-slate-400">Min. users</span>
            <span className="text-xs text-slate-400">Extra discount %</span>
          </div>
          <VolumeDiscountEditor
            tiers={base.volumeDiscounts}
            onChange={(tiers) => setBase({ ...base, volumeDiscounts: tiers ?? [] })}
          />
        </div>
      </div>

      {/* ── Per-sector overrides ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Per-Sector Overrides</h3>
            <p className="mt-0.5 text-xs text-slate-400">Leave empty to use base value.</p>
          </div>
          <button
            onClick={() => setOverrides((o) => [...o, {
              sectorId: sectors[0]?.id ?? "",
              system: sectors[0]?.systems?.[0] ?? "cloud",
              pricePerUser: null,
              operatingCosts: null,
              trainingDays: null,
              hostingPrice: null,
              discountPercent: null,
              volumeDiscounts: null,
              includesCloudHosting: false,
              freeSupportMonths: null,
            }])}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >+ Add Override</button>
        </div>

        {overrides.length > 0 && (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search overrides by sector…"
            className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        )}

        {overrides.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">No overrides — all sectors use base pricing.</p>
        )}

        <div className="space-y-4">
          {overrides
            .map((o, i) => ({ o, i }))
            .filter(({ o }) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              const s = sectors.find((x) => x.id === o.sectorId);
              return `${o.sectorId} ${o.system} ${s?.name.en ?? ""} ${s?.name.ar ?? ""}`.toLowerCase().includes(q);
            })
            .map(({ o, i }) => (
            <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
              {/* Row 1: identifiers + delete */}
              <div className="mb-3 flex flex-wrap items-end gap-3">
                <div className="min-w-[140px] flex-1">
                  <label className={lbl}>Sector</label>
                  <select
                    className={inp}
                    value={o.sectorId}
                    onChange={(e) => {
                      const sid = e.target.value;
                      const sys = sectors.find((s) => s.id === sid)?.systems ?? SYSTEMS;
                      // Keep the system valid for the newly selected sector.
                      setOverrides((arr) =>
                        arr.map((x, j) =>
                          j === i
                            ? { ...x, sectorId: sid, system: sys.includes(x.system) ? x.system : sys[0] ?? "cloud" }
                            : x
                        )
                      );
                    }}
                  >
                    {sectors.map((s) => <option key={s.id} value={s.id}>{s.name.en || s.id}</option>)}
                  </select>
                </div>
                <div className="min-w-[110px] flex-1">
                  <label className={lbl}>System</label>
                  <select className={inp} value={o.system} onChange={(e) => updateOverride(i, "system", e.target.value as SectorSystem)}>
                    {(sectors.find((s) => s.id === o.sectorId)?.systems ?? SYSTEMS).map((s) => (
                      <option key={s} value={s}>{SYSTEM_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setOverrides((arr) => arr.filter((_, j) => j !== i))}
                  className="ml-auto self-end rounded-md px-2 py-2 text-xs font-medium text-red-500 hover:bg-red-50"
                >✕ Remove</button>
              </div>

              {/* Row 2: price fields */}
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <div>
                  <label className={lbl}>Price / user</label>
                  <input type="number" className={inp} value={o.pricePerUser ?? ""} placeholder="base" onChange={(e) => updateOverride(i, "pricePerUser", nullNum(e.target.value))} />
                </div>
                <div>
                  <label className={lbl}>Hosting price</label>
                  <input type="number" className={inp} value={o.hostingPrice ?? ""} placeholder="base" onChange={(e) => updateOverride(i, "hostingPrice", nullNum(e.target.value))} />
                </div>
                <div>
                  <label className={lbl}>Operating</label>
                  <input type="number" className={inp} value={o.operatingCosts ?? ""} placeholder="base" onChange={(e) => updateOverride(i, "operatingCosts", nullNum(e.target.value))} />
                </div>
                <div>
                  <label className={lbl}>Training days</label>
                  <input type="number" className={inp} value={o.trainingDays ?? ""} placeholder="base" onChange={(e) => updateOverride(i, "trainingDays", nullNum(e.target.value))} />
                </div>
                <div>
                  <label className={lbl}>Free support (months)</label>
                  <input type="number" min={0} className={inp} value={o.freeSupportMonths ?? ""} placeholder="base" onChange={(e) => updateOverride(i, "freeSupportMonths", nullNum(e.target.value))} />
                </div>
                <div>
                  <label className={lbl}>Discount %</label>
                  <input type="number" className={inp} value={o.discountPercent ?? ""} placeholder="base" onChange={(e) => updateOverride(i, "discountPercent", nullNum(e.target.value))} />
                </div>
              </div>

              {/* Row 3: volume discounts */}
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Volume Discounts</p>
                <VolumeDiscountEditor
                  tiers={o.volumeDiscounts}
                  onChange={(tiers) => updateOverride(i, "volumeDiscounts", tiers)}
                  placeholder
                />
              </div>

              {/* Cloud hosting note toggle */}
              <label className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={!!o.includesCloudHosting}
                  onChange={(e) => updateOverride(i, "includesCloudHosting", e.target.checked)}
                />
                Price includes full cloud hosting (show the note on the landing page)
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
