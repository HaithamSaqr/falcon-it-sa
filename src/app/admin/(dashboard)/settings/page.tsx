"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/types/admin";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
      });
  }, []);

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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

      {/* Addresses */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Addresses</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClasses}>KSA Address (EN)</label>
            <input value={settings.company.address.ksa.en} onChange={(e) => set("company.address.ksa.en", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>KSA Address (AR)</label>
            <input value={settings.company.address.ksa.ar} onChange={(e) => set("company.address.ksa.ar", e.target.value)} className={inputClasses} dir="rtl" />
          </div>
          <div>
            <label className={labelClasses}>Egypt Address (EN)</label>
            <input value={settings.company.address.egypt.en} onChange={(e) => set("company.address.egypt.en", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Egypt Address (AR)</label>
            <input value={settings.company.address.egypt.ar} onChange={(e) => set("company.address.egypt.ar", e.target.value)} className={inputClasses} dir="rtl" />
          </div>
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
