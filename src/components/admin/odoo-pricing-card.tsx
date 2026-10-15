"use client";

import { useEffect, useState } from "react";

type Status = {
  enabled: boolean;
  proxyUrl: string;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastPriceUsd: string;
  lastError: string;
};

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "never");

/**
 * Integrations > Odoo prices: the proxy in Egypt through which the site reads
 * Odoo's Egypt price from odoo.com (Odoo prices by the requester's IP and the
 * server is outside Egypt). Saved on its own, with a "Fetch now" button.
 */
export default function OdooPricingCard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [proxyUrl, setProxyUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function load(s: Status) {
    setStatus(s);
    setEnabled(s.enabled);
    setProxyUrl(s.proxyUrl);
  }

  useEffect(() => {
    fetch("/api/admin/integrations/odoo-pricing")
      .then((r) => r.json())
      .then((d) => d.data && load(d.data))
      .catch(() => setMsg({ ok: false, text: "Could not load the settings" }));
  }, []);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/integrations/odoo-pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, proxyUrl }),
      });
      const d = await res.json();
      setMsg(res.ok ? { ok: true, text: "Saved." } : { ok: false, text: d.error || "Save failed" });
      const s = await fetch("/api/admin/integrations/odoo-pricing").then((r) => r.json());
      if (s.data) load(s.data);
    } finally {
      setBusy(false);
    }
  }

  async function fetchNow() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/integrations/odoo-pricing", { method: "POST" });
      const d = await res.json();
      const r = d.data?.result;
      if (d.data?.status) load(d.data.status);
      setMsg(
        r?.ok
          ? { ok: true, text: `Odoo's Egypt price: US$ ${r.priceUsd} per user / month${r.changed ? " (updated)" : " (unchanged)"}.` }
          : { ok: false, text: r?.error || d.error || "Fetch failed" },
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6" data-odoo-pricing-card="">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Odoo prices from odoo.com (Egypt)</h3>
          <p className="text-sm text-slate-500">
            Odoo shows each country its own price, by IP. This server is outside Egypt, so it reads odoo.com/pricing
            through a proxy located in Egypt. Once a day (on a visit from Egypt) it takes Odoo&rsquo;s Standard plan
            price, billed yearly, into Settings &gt; Egypt; the site converts it to EGP at the live rate.
          </p>
        </div>
        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="peer sr-only" />
          <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-cyan-500 peer-checked:after:translate-x-full" />
        </label>
      </div>

      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Egypt proxy URL</label>
      <input
        type="text"
        value={proxyUrl}
        onChange={(e) => setProxyUrl(e.target.value)}
        placeholder="http://username:password@proxy-host:port"
        dir="ltr"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
      />
      <p className="mt-1 text-xs text-slate-400">
        From your proxy provider, with Egypt as the country. Stored on the server and never shown again in full.
      </p>

      {msg && (
        <p className={`mt-4 text-sm font-medium ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>
          {msg.ok ? "✓ " : "✗ "}
          {msg.text}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={fetchNow}
          disabled={busy || !status?.enabled}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy ? "Working…" : "Fetch now"}
        </button>
      </div>

      {status && (
        <dl className="mt-5 grid gap-x-6 gap-y-1 text-xs text-slate-500 sm:grid-cols-2">
          <div>Last check: {when(status.lastAttemptAt)}</div>
          <div>Last success: {when(status.lastSuccessAt)}</div>
          <div>Last price read: {status.lastPriceUsd ? `US$ ${status.lastPriceUsd}` : "none yet"}</div>
          {status.lastError && <div className="text-red-600 sm:col-span-2">Last error: {status.lastError}</div>}
        </dl>
      )}
    </div>
  );
}
