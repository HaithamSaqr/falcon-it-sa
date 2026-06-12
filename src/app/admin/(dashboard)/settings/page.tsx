"use client";

import { useEffect, useState } from "react";
import type { SiteSettings, SeoSettings, FooterLink } from "@/types/admin";

interface DbConn {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  hasPassword?: boolean;
}

// Country options for WhatsApp routing (value = ISO-2 code returned by /api/geo).
const WA_COUNTRIES: { code: string; label: string }[] = [
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");

  // Database connection (stored in db-config.json, editable here)
  const [conn, setConn] = useState<DbConn | null>(null);
  const [connSaving, setConnSaving] = useState(false);
  const [connMsg, setConnMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Images (uploads) backup/restore
  const [imgSaving, setImgSaving] = useState(false);
  const [imgMsg, setImgMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // SEO + footer links (separate tables)
  const [seo, setSeo] = useState<SeoSettings | null>(null);
  const [footer, setFooter] = useState<FooterLink[] | null>(null);
  const [seoSaved, setSeoSaved] = useState(false);
  const [footerSaved, setFooterSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
      });
    fetch("/api/admin/connection")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setConn({ ...data.data, password: "" });
      });
    fetch("/api/admin/seo")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSeo(data.data);
      });
    fetch("/api/admin/footer")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setFooter(data.data);
      });
  }, []);

  async function handleSaveSeo() {
    if (!seo) return;
    await fetch("/api/admin/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seo),
    });
    setSeoSaved(true);
    setTimeout(() => setSeoSaved(false), 3000);
  }

  async function handleSaveFooter() {
    if (!footer) return;
    await fetch("/api/admin/footer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(footer),
    });
    setFooterSaved(true);
    setTimeout(() => setFooterSaved(false), 3000);
  }

  function setSeoField(path: string, value: string) {
    setSeo((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev)) as SeoSettings;
      const keys = path.split(".");
      let obj = copy as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]] as Record<string, unknown>;
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  }

  function genFid() {
    try {
      return crypto.randomUUID();
    } catch {
      return `fl_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    }
  }

  async function handleSaveConnection() {
    if (!conn) return;
    setConnSaving(true);
    setConnMsg(null);
    try {
      const res = await fetch("/api/admin/connection", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conn),
      });
      const data = await res.json();
      if (data.success) {
        setConnMsg({ ok: true, text: data.message || "Connection updated" });
        setConn((c) => (c ? { ...c, password: "", hasPassword: true } : c));
      } else {
        setConnMsg({ ok: false, text: data.error || "Failed to update connection" });
      }
    } catch {
      setConnMsg({ ok: false, text: "Network error" });
    } finally {
      setConnSaving(false);
    }
  }

  async function handleBackup() {
    setConnMsg(null);
    try {
      const res = await fetch("/api/admin/connection/backup");
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setConnMsg({ ok: false, text: d?.error || "Backup failed" });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `falcon-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setConnMsg({ ok: true, text: "Backup downloaded" });
    } catch {
      setConnMsg({ ok: false, text: "Backup failed" });
    }
  }

  async function handleRestore(file: File) {
    if (
      !confirm(
        "Restore will REPLACE all current data with the backup file. This cannot be undone. Continue?"
      )
    )
      return;
    setConnMsg(null);
    setConnSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/connection/restore", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setConnMsg({ ok: true, text: data.message || "Restored successfully — reloading…" });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setConnMsg({ ok: false, text: data.error || "Restore failed" });
      }
    } catch {
      setConnMsg({ ok: false, text: "Restore failed" });
    } finally {
      setConnSaving(false);
    }
  }

  async function handleImagesBackup() {
    setImgMsg(null);
    try {
      const res = await fetch("/api/admin/uploads/backup");
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setImgMsg({ ok: false, text: d?.error || "Images backup failed" });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `falcon-images-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setImgMsg({ ok: true, text: "Images backup downloaded" });
    } catch {
      setImgMsg({ ok: false, text: "Images backup failed" });
    }
  }

  async function handleImagesRestore(file: File) {
    if (!confirm("Restore images from this file? Existing images with the same name will be overwritten.")) return;
    setImgMsg(null);
    setImgSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/uploads/restore", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setImgMsg({ ok: true, text: data.message || "Images restored" });
      } else {
        setImgMsg({ ok: false, text: data.error || "Images restore failed" });
      }
    } catch {
      setImgMsg({ ok: false, text: "Images restore failed" });
    } finally {
      setImgSaving(false);
    }
  }

  async function handleSave() {
    if (!settings) return;

    // Guard the admin password change: require confirmation + min length.
    const newPw = settings.security?.adminPassword?.trim() || "";
    setPwError("");
    if (newPw) {
      if (newPw.length < 6) {
        setPwError("Password must be at least 6 characters / كلمة المرور 6 أحرف على الأقل");
        return;
      }
      if (newPw !== confirmPassword) {
        setPwError("Passwords do not match / كلمتا المرور غير متطابقتين");
        return;
      }
    }

    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setConfirmPassword("");
    // Clear the typed password from local state after saving.
    set("security.adminPassword", "");
    setTimeout(() => setSaved(false), 3000);
  }

  if (!settings) {
    return <div className="flex h-64 items-center justify-center"><p className="text-slate-400">Loading...</p></div>;
  }

  const inputClasses =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const labelClasses = "mb-1 block text-xs font-medium uppercase text-slate-400";

  function set(path: string, value: unknown) {
    setSettings((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  }

  // ── Branches (dynamic list) ───────────────────────────────────────
  function genId() {
    try {
      return crypto.randomUUID();
    } catch {
      return `b_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    }
  }

  function setBranch(index: number, path: string, value: string) {
    setSettings((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev)) as SiteSettings;
      const keys = path.split(".");
      let obj = copy.company.branches[index] as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  }

  function addBranch() {
    setSettings((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev)) as SiteSettings;
      copy.company.branches = [
        ...(copy.company.branches ?? []),
        { id: genId(), name: { en: "", ar: "" }, address: { en: "", ar: "" }, phone: "" },
      ];
      return copy;
    });
  }

  function removeBranch(index: number) {
    setSettings((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev)) as SiteSettings;
      copy.company.branches.splice(index, 1);
      return copy;
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Database Connection */}
      <div className="rounded-xl border-2 border-cyan-200 bg-cyan-50/40 p-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg">🗄️</span>
          <h3 className="text-sm font-semibold text-slate-700">Database Connection</h3>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          PostgreSQL connection used by the whole app. Saving tests the connection, creates the
          database &amp; tables if missing, then reconnects.
        </p>
        {conn ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClasses}>Host</label>
                <input value={conn.host} onChange={(e) => setConn({ ...conn, host: e.target.value })} className={inputClasses} placeholder="localhost" />
              </div>
              <div>
                <label className={labelClasses}>Port</label>
                <input value={conn.port} onChange={(e) => setConn({ ...conn, port: Number(e.target.value) || 5432 })} className={inputClasses} type="number" />
              </div>
              <div>
                <label className={labelClasses}>Database</label>
                <input value={conn.database} onChange={(e) => setConn({ ...conn, database: e.target.value })} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>User</label>
                <input value={conn.user} onChange={(e) => setConn({ ...conn, user: e.target.value })} className={inputClasses} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClasses}>Password</label>
                <input
                  value={conn.password}
                  onChange={(e) => setConn({ ...conn, password: e.target.value })}
                  className={inputClasses}
                  type="password"
                  autoComplete="off"
                  placeholder={conn.hasPassword ? "•••••••• (leave blank to keep current)" : "Database password"}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-3">
              {connMsg && (
                <span className={`text-sm ${connMsg.ok ? "text-emerald-600" : "text-red-600"}`}>
                  {connMsg.text}
                </span>
              )}
              <button
                onClick={handleSaveConnection}
                disabled={connSaving}
                className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:opacity-50"
              >
                {connSaving ? "Testing & saving..." : "Test & Save Connection"}
              </button>
            </div>

            {/* Backup / Restore */}
            <div className="mt-5 border-t border-cyan-200 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Backup &amp; Restore</p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackup}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  ⬇️ Backup database
                </button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100">
                  ⬆️ Restore from backup
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleRestore(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <span className="text-xs text-slate-400">Downloads a full JSON backup. Restore replaces all data.</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">Loading connection...</p>
        )}
      </div>

      {/* Images Backup & Restore */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-semibold text-slate-700">Images Backup &amp; Restore</h3>
        <p className="mb-3 text-xs text-slate-400">
          Backup / restore all uploaded images (logos, product &amp; hero images). Handy when moving the site to another server.
        </p>
        {imgMsg && (
          <div className={`mb-3 rounded-lg px-3 py-2 text-sm ${imgMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            {imgMsg.text}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleImagesBackup}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            🖼 Backup images
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100">
            {imgSaving ? "Restoring…" : "⬆️ Restore images"}
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              disabled={imgSaving}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImagesRestore(f);
                e.target.value = "";
              }}
            />
          </label>
          <span className="text-xs text-slate-400">JSON bundle of all images. Restore adds them back (overwrites same names).</span>
        </div>
      </div>

      {/* Company Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Company Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClasses}>Company Name (EN)</label>
            <input value={settings.company.name.en} onChange={(e) => set("company.name.en", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Company Name (AR)</label>
            <input value={settings.company.name.ar} onChange={(e) => set("company.name.ar", e.target.value)} className={inputClasses} dir="rtl" />
          </div>
          <div>
            <label className={labelClasses}>Email</label>
            <input value={settings.company.email} onChange={(e) => set("company.email", e.target.value)} className={inputClasses} type="email" />
          </div>
          <div>
            <label className={labelClasses}>WhatsApp Number</label>
            <input value={settings.company.whatsapp} onChange={(e) => set("company.whatsapp", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Phone (KSA)</label>
            <input value={settings.company.phone.ksa} onChange={(e) => set("company.phone.ksa", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Phone (Egypt)</label>
            <input value={settings.company.phone.egypt} onChange={(e) => set("company.phone.egypt", e.target.value)} className={inputClasses} />
          </div>
        </div>
      </div>

      {/* WhatsApp Routing */}
      {(() => {
        const routing = settings.whatsappRouting ?? { domains: [], countries: [] };
        const updateRouting = (next: typeof routing) => set("whatsappRouting", next);
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">WhatsApp Routing</h3>
              <p className="mt-1 text-xs text-slate-400">
                Pick which WhatsApp number receives messages. Priority: <b>visitor country</b> (by IP) → <b>domain</b> → the default number above.
              </p>
            </div>

            {/* Layer 1 — by domain */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-slate-500">Layer 1 · By domain / subdomain</p>
                <button
                  type="button"
                  onClick={() => updateRouting({ ...routing, domains: [...routing.domains, { id: crypto.randomUUID(), domain: "", number: "" }] })}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  + Add domain
                </button>
              </div>
              <div className="space-y-2">
                {routing.domains.map((d, i) => (
                  <div key={d.id} className="flex flex-wrap items-center gap-2">
                    <input
                      value={d.domain}
                      onChange={(e) => updateRouting({ ...routing, domains: routing.domains.map((x, j) => (j === i ? { ...x, domain: e.target.value } : x)) })}
                      className={`${inputClasses} flex-1 min-w-[160px]`}
                      placeholder="falcon-it.com.eg"
                      dir="ltr"
                    />
                    <input
                      value={d.number}
                      onChange={(e) => updateRouting({ ...routing, domains: routing.domains.map((x, j) => (j === i ? { ...x, number: e.target.value } : x)) })}
                      className={`${inputClasses} w-44`}
                      placeholder="20100xxxxxxx"
                      dir="ltr"
                    />
                    <button type="button" onClick={() => updateRouting({ ...routing, domains: routing.domains.filter((_, j) => j !== i) })} className="rounded-md px-2 py-2 text-xs font-medium text-red-500 hover:bg-red-50">✕</button>
                  </div>
                ))}
                {routing.domains.length === 0 && <p className="text-xs text-slate-400">No domain rules. The default number is used.</p>}
              </div>
            </div>

            {/* Layer 2 — by country */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-slate-500">Layer 2 · By visitor country (overrides domain)</p>
                <button
                  type="button"
                  onClick={() => updateRouting({ ...routing, countries: [...routing.countries, { id: crypto.randomUUID(), country: "SA", number: "" }] })}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  + Add country
                </button>
              </div>
              <div className="space-y-2">
                {routing.countries.map((c, i) => (
                  <div key={c.id} className="flex flex-wrap items-center gap-2">
                    <select
                      value={c.country}
                      onChange={(e) => updateRouting({ ...routing, countries: routing.countries.map((x, j) => (j === i ? { ...x, country: e.target.value } : x)) })}
                      className={`${inputClasses} w-56`}
                    >
                      {WA_COUNTRIES.every((o) => o.code !== c.country) && c.country && <option value={c.country}>{c.country}</option>}
                      {WA_COUNTRIES.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                    </select>
                    <input
                      value={c.number}
                      onChange={(e) => updateRouting({ ...routing, countries: routing.countries.map((x, j) => (j === i ? { ...x, number: e.target.value } : x)) })}
                      className={`${inputClasses} w-44`}
                      placeholder="9665xxxxxxxx"
                      dir="ltr"
                    />
                    <button type="button" onClick={() => updateRouting({ ...routing, countries: routing.countries.filter((_, j) => j !== i) })} className="rounded-md px-2 py-2 text-xs font-medium text-red-500 hover:bg-red-50">✕</button>
                  </div>
                ))}
                {routing.countries.length === 0 && <p className="text-xs text-slate-400">No country rules.</p>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Landing Page CTA */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-700">Landing Page CTA</h3>
        <p className="mt-1 mb-4 text-xs text-slate-400">
          How the sector landing-page button completes the request: send via WhatsApp, or open an external link (e.g. your SaaS checkout) carrying the quote details.
        </p>
        <div className="flex flex-wrap gap-3">
          {(["whatsapp", "url"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set("landingCta.mode", m)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                (settings.landingCta?.mode ?? "whatsapp") === m
                  ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {m === "whatsapp" ? "💬 WhatsApp" : "🔗 External link (SaaS)"}
            </button>
          ))}
        </div>
        {settings.landingCta?.mode === "url" && (
          <div className="mt-4">
            <label className={labelClasses}>Checkout / SaaS base URL</label>
            <input
              value={settings.landingCta?.url || ""}
              onChange={(e) => set("landingCta.url", e.target.value)}
              className={inputClasses}
              dir="ltr"
              placeholder="https://app.falcon-it.sa/checkout"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Order details are appended as query params:&nbsp;
              <code className="rounded bg-slate-100 px-1 text-[11px]">?sector=&amp;sectorName=&amp;system=&amp;users=&amp;price=&amp;priceRegular=&amp;currency=&amp;trainingDays=&amp;name=&amp;company=&amp;email=&amp;phone=</code>
            </p>
          </div>
        )}

        {/* Editable button caption + helper text (blank → default per mode) */}
        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div>
            <label className={labelClasses}>Button caption (EN)</label>
            <input value={settings.landingCta?.label?.en || ""} onChange={(e) => set("landingCta.label.en", e.target.value)} className={inputClasses} placeholder="Send request to AI assistant" />
          </div>
          <div>
            <label className={labelClasses}>Button caption (AR)</label>
            <input value={settings.landingCta?.label?.ar || ""} onChange={(e) => set("landingCta.label.ar", e.target.value)} className={inputClasses} dir="rtl" placeholder="أرسل الطلب إلى المساعد الذكي" />
          </div>
          <div>
            <label className={labelClasses}>Helper text (EN)</label>
            <input value={settings.landingCta?.note?.en || ""} onChange={(e) => set("landingCta.note.en", e.target.value)} className={inputClasses} placeholder="Our AI assistant will reach out…" />
          </div>
          <div>
            <label className={labelClasses}>Helper text (AR)</label>
            <input value={settings.landingCta?.note?.ar || ""} onChange={(e) => set("landingCta.note.ar", e.target.value)} className={inputClasses} dir="rtl" placeholder="سيتواصل معك مساعدنا الذكي…" />
          </div>
          <p className="text-xs text-slate-400 sm:col-span-2">Caption: blank = default for the mode. Helper text: blank = the line under the button is hidden.</p>
        </div>
      </div>

      {/* Branches (dynamic) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Branches</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Add one or more office branches. They appear on the Contact page.
            </p>
          </div>
          <button
            type="button"
            onClick={addBranch}
            className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-cyan-700"
          >
            + Add Branch
          </button>
        </div>

        {(settings.company.branches ?? []).length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            No branches yet. Click “Add Branch” to create one.
          </p>
        )}

        <div className="space-y-4">
          {(settings.company.branches ?? []).map((branch, i) => (
            <div key={branch.id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Branch {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeBranch(i)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClasses}>Branch Name (EN)</label>
                  <input value={branch.name.en} onChange={(e) => setBranch(i, "name.en", e.target.value)} className={inputClasses} placeholder="Saudi Arabia Office" />
                </div>
                <div>
                  <label className={labelClasses}>Branch Name (AR)</label>
                  <input value={branch.name.ar} onChange={(e) => setBranch(i, "name.ar", e.target.value)} className={inputClasses} dir="rtl" placeholder="مكتب السعودية" />
                </div>
                <div>
                  <label className={labelClasses}>Address (EN)</label>
                  <input value={branch.address.en} onChange={(e) => setBranch(i, "address.en", e.target.value)} className={inputClasses} placeholder="Riyadh, Saudi Arabia" />
                </div>
                <div>
                  <label className={labelClasses}>Address (AR)</label>
                  <input value={branch.address.ar} onChange={(e) => setBranch(i, "address.ar", e.target.value)} className={inputClasses} dir="rtl" placeholder="الرياض، المملكة العربية السعودية" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClasses}>Phone</label>
                  <input value={branch.phone} onChange={(e) => setBranch(i, "phone", e.target.value)} className={inputClasses} dir="ltr" placeholder="00966500000000" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.emailOnNewLead}
              onChange={(e) => set("notifications.emailOnNewLead", e.target.checked)}
              className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-sm text-slate-700">Send email notification on new lead</span>
          </label>
          <div>
            <label className={labelClasses}>Sales Team Email</label>
            <input value={settings.notifications.salesEmail} onChange={(e) => set("notifications.salesEmail", e.target.value)} className={inputClasses} type="email" />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Social Media Links</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(settings.social).map(([key, value]) => (
            <div key={key}>
              <label className={labelClasses}>{key}</label>
              <input value={value} onChange={(e) => set(`social.${key}`, e.target.value)} className={inputClasses} dir="ltr" />
            </div>
          ))}
        </div>
      </div>

      {/* Login Button */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-semibold text-slate-700">Login Button</h3>
        <p className="mb-4 text-xs text-slate-400">The URL the navbar &ldquo;Login&rdquo; button opens.</p>
        <input
          value={settings.loginUrl || ""}
          onChange={(e) => set("loginUrl", e.target.value)}
          className={inputClasses}
          dir="ltr"
          placeholder="https://falcon-valley.com"
        />
      </div>

      {/* SEO */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">SEO &amp; Meta Tags</h3>
          <div className="flex items-center gap-3">
            {seoSaved && <span className="text-sm text-emerald-600">Saved!</span>}
            <button onClick={handleSaveSeo} className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-cyan-700">Save SEO</button>
          </div>
        </div>
        {seo ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelClasses}>Meta Title (EN)</label><input value={seo.metaTitle.en} onChange={(e) => setSeoField("metaTitle.en", e.target.value)} className={inputClasses} /></div>
            <div><label className={labelClasses}>Meta Title (AR)</label><input value={seo.metaTitle.ar} onChange={(e) => setSeoField("metaTitle.ar", e.target.value)} className={inputClasses} dir="rtl" /></div>
            <div className="sm:col-span-2"><label className={labelClasses}>Meta Description (EN)</label><textarea value={seo.metaDescription.en} onChange={(e) => setSeoField("metaDescription.en", e.target.value)} className={inputClasses} rows={2} /></div>
            <div className="sm:col-span-2"><label className={labelClasses}>Meta Description (AR)</label><textarea value={seo.metaDescription.ar} onChange={(e) => setSeoField("metaDescription.ar", e.target.value)} className={inputClasses} rows={2} dir="rtl" /></div>
            <div className="sm:col-span-2"><label className={labelClasses}>Keywords (EN) — comma separated</label><textarea value={seo.metaKeywords.en} onChange={(e) => setSeoField("metaKeywords.en", e.target.value)} className={inputClasses} rows={2} /></div>
            <div className="sm:col-span-2"><label className={labelClasses}>Keywords (AR) — مفصولة بفواصل</label><textarea value={seo.metaKeywords.ar} onChange={(e) => setSeoField("metaKeywords.ar", e.target.value)} className={inputClasses} rows={2} dir="rtl" /></div>
            <div className="sm:col-span-2"><label className={labelClasses}>OG Image URL</label><input value={seo.ogImage} onChange={(e) => setSeoField("ogImage", e.target.value)} className={inputClasses} dir="ltr" /></div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Loading...</p>
        )}
      </div>

      {/* Footer Links */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Footer Links</h3>
            <p className="mt-0.5 text-xs text-slate-400">Edit label &amp; URL for each footer link (bilingual). Section: about / support / legal.</p>
          </div>
          <div className="flex items-center gap-2">
            {footerSaved && <span className="text-sm text-emerald-600">Saved!</span>}
            <button
              onClick={() => setFooter((f) => [...(f ?? []), { id: genFid(), section: "about", label: { en: "", ar: "" }, url: "" }])}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >+ Add</button>
            <button onClick={handleSaveFooter} className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-cyan-700">Save Footer</button>
          </div>
        </div>
        {footer ? (
          <div className="space-y-3">
            {footer.map((link, i) => (
              <div key={link.id} className="grid items-end gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-[120px_1fr_1fr_1fr_auto]">
                <div>
                  <label className={labelClasses}>Section</label>
                  <select
                    value={link.section}
                    onChange={(e) => setFooter((f) => f!.map((x, j) => (j === i ? { ...x, section: e.target.value as FooterLink["section"] } : x)))}
                    className={inputClasses}
                  >
                    <option value="about">about</option>
                    <option value="support">support</option>
                    <option value="legal">legal</option>
                  </select>
                </div>
                <div><label className={labelClasses}>Label EN</label><input value={link.label.en} onChange={(e) => setFooter((f) => f!.map((x, j) => (j === i ? { ...x, label: { ...x.label, en: e.target.value } } : x)))} className={inputClasses} /></div>
                <div><label className={labelClasses}>Label AR</label><input value={link.label.ar} onChange={(e) => setFooter((f) => f!.map((x, j) => (j === i ? { ...x, label: { ...x.label, ar: e.target.value } } : x)))} className={inputClasses} dir="rtl" /></div>
                <div><label className={labelClasses}>URL</label><input value={link.url} onChange={(e) => setFooter((f) => f!.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} className={inputClasses} dir="ltr" /></div>
                <button onClick={() => setFooter((f) => f!.filter((_, j) => j !== i))} className="rounded-md px-2 py-2 text-xs font-medium text-red-500 hover:bg-red-50">✕</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Loading...</p>
        )}
      </div>

      {/* Security & Rate Limiting */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Security & Rate Limiting</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClasses}>New Admin Password</label>
            <input
              value={settings.security?.adminPassword || ""}
              onChange={(e) => set("security.adminPassword", e.target.value)}
              className={inputClasses}
              type="password"
              autoComplete="new-password"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div>
            <label className={labelClasses}>Confirm New Password</label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClasses}
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter new password"
            />
          </div>
          <div className="sm:col-span-2 -mt-1">
            {pwError ? (
              <p className="text-xs font-medium text-red-600">{pwError}</p>
            ) : (
              <p className="text-xs text-slate-400">
                Changes the password for the current admin ({settings.security?.adminUsername || "admin"}). Min 6 characters. You stay logged in.
              </p>
            )}
          </div>
          <div>
            <label className={labelClasses}>JWT Secret</label>
            <input
              value={settings.security?.jwtSecret || ""}
              onChange={(e) => set("security.jwtSecret", e.target.value)}
              className={inputClasses}
              type="password"
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-slate-400">Changing this will log out all active sessions</p>
          </div>
          <div>
            <label className={labelClasses}>Rate Limit (requests per window)</label>
            <input
              value={settings.security?.rateLimitMax ?? 10}
              onChange={(e) => set("security.rateLimitMax", Number(e.target.value) || 10)}
              className={inputClasses}
              type="number"
              min={1}
              max={100}
            />
          </div>
          <div>
            <label className={labelClasses}>Rate Limit Window (ms)</label>
            <input
              value={settings.security?.rateLimitWindowMs ?? 60000}
              onChange={(e) => set("security.rateLimitWindowMs", Number(e.target.value) || 60000)}
              className={inputClasses}
              type="number"
              min={1000}
            />
            <p className="mt-1 text-xs text-slate-400">{((settings.security?.rateLimitWindowMs ?? 60000) / 1000)}s window</p>
          </div>
        </div>
      </div>

      {/* Regional */}
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">🌍 Gulf Market Only</h3>
            <p className="mt-1 text-xs text-slate-500">
              Hide Egypt office, phone number, and address across the entire website. The site will be fully dedicated to the Gulf market (KSA, UAE, Qatar, Bahrain, Kuwait, Oman).
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.regional?.gulfOnly ?? false}
              onChange={(e) => set("regional.gulfOnly", e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-amber-500 peer-checked:after:translate-x-full" />
          </label>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-emerald-600">Settings saved!</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
