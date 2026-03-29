"use client";

import { useEffect, useState } from "react";
import type { IntegrationSettings } from "@/types/admin";

const TABS = [
  { key: "odoo", label: "Odoo CRM" },
  { key: "calendar", label: "Calendar" },
  { key: "helpdesk", label: "Helpdesk Portal" },
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
] as const;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function IntegrationsPage() {
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  const [activeTab, setActiveTab] = useState<string>("odoo");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/admin/integrations")
      .then((r) => r.json())
      .then((d) => setSettings(d.data))
      .catch(console.error);
  }, []);

  if (!settings) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>;
  }

  function update(section: keyof IntegrationSettings, key: string, value: unknown) {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: { ...prev[section], [key]: value },
      };
    });
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/admin/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setToast("Settings saved!");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error(err);
      setToast("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    if (!settings) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/integrations/test-odoo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings.odoo),
      });
      const data = await res.json();
      setTestResult(data.data);
    } catch {
      setTestResult({ success: false, message: "Network error" });
    } finally {
      setTesting(false);
    }
  }

  function toggleDay(day: number) {
    const days = settings?.calendar.availableDays || [];
    const newDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();
    update("calendar", "availableDays", newDays);
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {/* Status dot */}
              <span
                className={`ml-2 inline-block h-2 w-2 rounded-full ${
                  settings[tab.key as keyof IntegrationSettings] &&
                  (settings[tab.key as keyof IntegrationSettings] as { enabled: boolean }).enabled
                    ? "bg-emerald-400"
                    : "bg-slate-300"
                }`}
              />
            </button>
          ))}
        </nav>
      </div>

      {/* ── Odoo CRM Tab ── */}
      {activeTab === "odoo" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Odoo CRM Connection</h3>
                <p className="text-sm text-slate-500">Connect to your Odoo ERP to sync leads and calendar</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.odoo.enabled}
                  onChange={(e) => update("odoo", "enabled", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-cyan-500 peer-checked:after:translate-x-full" />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Odoo URL" value={settings.odoo.url} onChange={(v) => update("odoo", "url", v)} placeholder="https://erp.falcon-v.com" />
              <Field label="Database" value={settings.odoo.db} onChange={(v) => update("odoo", "db", v)} placeholder="falcon_production" />
              <Field label="Username" value={settings.odoo.username} onChange={(v) => update("odoo", "username", v)} placeholder="api@falcon-v.com" />
              <Field label="Password" value={settings.odoo.password} onChange={(v) => update("odoo", "password", v)} type="password" placeholder="••••••••" />
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={testConnection}
                disabled={testing}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                {testing ? "Testing..." : "Test Connection"}
              </button>
              {testResult && (
                <span className={`text-sm font-medium ${testResult.success ? "text-emerald-600" : "text-red-600"}`}>
                  {testResult.success ? "✓ " : "✗ "}
                  {testResult.message}
                </span>
              )}
              {settings.odoo.lastTestedAt && !testResult && (
                <span className="text-xs text-slate-400">
                  Last tested: {new Date(settings.odoo.lastTestedAt).toLocaleString()} —{" "}
                  <span className={settings.odoo.lastTestResult === "success" ? "text-emerald-500" : "text-red-500"}>
                    {settings.odoo.lastTestResult}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Calendar Tab ── */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Odoo Calendar Booking</h3>
                <p className="text-sm text-slate-500">Allow visitors to pick a demo time slot on the booking page</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.calendar.enabled}
                  onChange={(e) => update("calendar", "enabled", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-cyan-500 peer-checked:after:translate-x-full" />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Slot Duration
                </label>
                <select
                  value={settings.calendar.slotDuration}
                  onChange={(e) => update("calendar", "slotDuration", Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <Field
                label="Odoo Calendar User ID"
                value={String(settings.calendar.resourceId)}
                onChange={(v) => update("calendar", "resourceId", Number(v))}
                type="number"
                placeholder="1"
              />

              <Field
                label="Start Hour"
                value={String(settings.calendar.startHour)}
                onChange={(v) => update("calendar", "startHour", Number(v))}
                type="number"
                placeholder="9"
              />

              <Field
                label="End Hour"
                value={String(settings.calendar.endHour)}
                onChange={(v) => update("calendar", "endHour", Number(v))}
                type="number"
                placeholder="17"
              />

              <Field
                label="Buffer Between Slots (min)"
                value={String(settings.calendar.bufferMinutes)}
                onChange={(v) => update("calendar", "bufferMinutes", Number(v))}
                type="number"
                placeholder="10"
              />

              <Field
                label="Max Advance Days"
                value={String(settings.calendar.maxAdvanceDays)}
                onChange={(v) => update("calendar", "maxAdvanceDays", Number(v))}
                type="number"
                placeholder="30"
              />
            </div>

            {/* Available Days */}
            <div className="mt-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Available Days
              </label>
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleDay(idx)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      settings.calendar.availableDays.includes(idx)
                        ? "bg-cyan-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Helpdesk Portal Tab ── */}
      {activeTab === "helpdesk" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Helpdesk Client Portal</h3>
                <p className="text-sm text-slate-500">Allow customers to log in and manage support tickets via Odoo Helpdesk</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.helpdesk?.enabled ?? false}
                  onChange={(e) => update("helpdesk", "enabled", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-cyan-500 peer-checked:after:translate-x-full" />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field
                label="Default Team ID"
                value={String(settings.helpdesk?.defaultTeamId ?? 1)}
                onChange={(v) => update("helpdesk", "defaultTeamId", Number(v))}
                type="number"
                placeholder="1"
              />

              <div className="flex flex-col gap-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.helpdesk?.allowRating ?? true}
                    onChange={(e) => update("helpdesk", "allowRating", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-700">Allow customer ratings on closed tickets</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.helpdesk?.allowNewTickets ?? true}
                    onChange={(e) => update("helpdesk", "allowNewTickets", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-700">Allow customers to create new tickets</span>
                </label>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <strong>Note:</strong> Customers log in using their Odoo portal credentials (email & password).
              Make sure the Odoo <code>fv_helpdesk</code> module is installed and customers have portal access.
              Portal URL: <code>/login</code>
            </div>
          </div>
        </div>
      )}

      {/* ── Email Tab ── */}
      {activeTab === "email" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Email Service (Resend)</h3>
                <p className="text-sm text-slate-500">Configure transactional email for lead confirmations</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.email.enabled}
                  onChange={(e) => update("email", "enabled", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-cyan-500 peer-checked:after:translate-x-full" />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="API Key" value={settings.email.apiKey} onChange={(v) => update("email", "apiKey", v)} type="password" placeholder="re_xxxxxxxxxxxxxxxxxxxx" />
              </div>
              <Field label="From Email" value={settings.email.fromEmail} onChange={(v) => update("email", "fromEmail", v)} placeholder="noreply@falcon-it.sa" />
              <Field label="Reply-To Email" value={settings.email.replyTo} onChange={(v) => update("email", "replyTo", v)} placeholder="info@falcon-v.com" />
            </div>
          </div>
        </div>
      )}

      {/* ── WhatsApp Tab ── */}
      {activeTab === "whatsapp" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">WhatsApp Business API</h3>
                <p className="text-sm text-slate-500">Send automated WhatsApp notifications on new leads</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.whatsapp.enabled}
                  onChange={(e) => update("whatsapp", "enabled", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-cyan-500 peer-checked:after:translate-x-full" />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="API Token" value={settings.whatsapp.apiToken} onChange={(v) => update("whatsapp", "apiToken", v)} type="password" placeholder="EAAxxxxxxx..." />
              <Field label="Phone Number ID" value={settings.whatsapp.phoneId} onChange={(v) => update("whatsapp", "phoneId", v)} placeholder="1234567890" />
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-600 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

// ── Reusable Field Component ──
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
      />
    </div>
  );
}
