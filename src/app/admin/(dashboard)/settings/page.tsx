"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/types/admin";

interface DbConn {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  hasPassword?: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Database connection (stored in db-config.json, editable here)
  const [conn, setConn] = useState<DbConn | null>(null);
  const [connSaving, setConnSaving] = useState(false);
  const [connMsg, setConnMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
  }, []);

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

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
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
          </>
        ) : (
          <p className="text-sm text-slate-400">Loading connection...</p>
        )}
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
              <input value={value} onChange={(e) => set(`social.${key}`, e.target.value)} className={inputClasses} />
            </div>
          ))}
        </div>
      </div>

      {/* Security & Rate Limiting */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Security & Rate Limiting</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClasses}>Admin Password</label>
            <input
              value={settings.security?.adminPassword || ""}
              onChange={(e) => set("security.adminPassword", e.target.value)}
              className={inputClasses}
              type="password"
              autoComplete="new-password"
            />
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
