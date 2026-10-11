"use client";

import { useEffect, useId, useState } from "react";
import type { IntegrationSettings } from "@/types/admin";
import { extractAdsLabel, isValidAdsId } from "@/lib/ads-label";

const TABS = [
  { key: "odoo", label: "Odoo CRM" },
  { key: "ai", label: "AI Assistant" },
  { key: "google", label: "Google" },
  { key: "snapchat", label: "Snapchat" },
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
  const [extractedLabel, setExtractedLabel] = useState<string | null>(null);

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
              <Field label="API Key" value={settings.odoo.apiKey} onChange={(v) => update("odoo", "apiKey", v)} type="password" placeholder="Odoo API Key" />
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

      {/* ── AI Assistant Tab ── */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">AI Assistant Server</h3>
                <p className="text-sm text-slate-500">
                  Connect your AI model server. Used by the smart assistant / chatbot on sector
                  landing pages.
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.ai.enabled}
                  onChange={(e) => update("ai", "enabled", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm text-slate-700">Enabled</span>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Field
                label="AI Server URL"
                value={settings.ai.serverUrl}
                onChange={(v) => update("ai", "serverUrl", v)}
                placeholder="https://ai.falcon-v.com/api"
              />
              <Field
                label="API Key (optional)"
                value={settings.ai.apiKey}
                onChange={(v) => update("ai", "apiKey", v)}
                type="password"
                placeholder="Bearer token / API key"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Google Tab ── */}
      {activeTab === "google" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Google Integration</h3>
                <p className="text-sm text-slate-500">
                  Verify site ownership (Search Console) and add Google tags (Tag Manager / Analytics / Ads).
                  Tags are injected on every public page when enabled.
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.google.enabled}
                  onChange={(e) => update("google", "enabled", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm text-slate-700">Enabled</span>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Field
                label="Site verification (meta tag content)"
                value={settings.google.verification}
                onChange={(v) => update("google", "verification", v)}
                placeholder="e.g. Xy12abc... (the content value only)"
              />
              <p className="-mt-2 text-xs text-slate-400">
                In Search Console choose the <b>HTML tag</b> method and paste only the <code className="rounded bg-slate-100 px-1">content</code> value here.
              </p>
              <Field
                label="Google Tag Manager ID"
                value={settings.google.gtmId}
                onChange={(v) => update("google", "gtmId", v)}
                placeholder="GTM-XXXXXXX"
              />
              <Field
                label="Google Analytics 4 ID"
                value={settings.google.ga4Id}
                onChange={(v) => update("google", "ga4Id", v)}
                placeholder="G-XXXXXXXXXX"
              />
              <Field
                label="Google Ads ID (conversions)"
                value={settings.google.adsId}
                onChange={(v) => update("google", "adsId", v)}
                placeholder="AW-XXXXXXXXX"
                warning={
                  settings.google.adsId.trim() && !isValidAdsId(settings.google.adsId)
                    ? "This does not look like a Google Ads ID. Expected AW- followed by digits only, for example AW-123456789."
                    : undefined
                }
              />
              <AdsLabelGuide adsId={settings.google.adsId} />
              {(
                [
                  ["adsQuoteLabel", "Quote-form conversion label", "e.g. qeqKCOOYwb4cEOLBtusD", "Fires on: quote request (sector quote calculator)"],
                  ["adsDemoLabel", "Demo-form conversion label", "e.g. MYEqCKe3rr4cEOLBtusD", "Fires on: demo booking (/demo)"],
                  ["adsContactLabel", "Contact-form conversion label", "e.g. c6-fCJyKxL4cEOLBtusD", "Fires on: contact form (/contact)"],
                  ["adsWhatsappLabel", "WhatsApp-click conversion label", "e.g. GOAtCJeOxL4cEOLBtusD", "Fires on: WhatsApp click (floating button, mobile bar, contact CTA)"],
                ] as const
              ).map(([key, label, placeholder, hint]) => (
                <Field
                  key={key}
                  label={label}
                  value={settings.google[key]}
                  onChange={(v) => {
                    update("google", key, v);
                    if (extractedLabel === key) setExtractedLabel(null);
                  }}
                  onBlur={() => {
                    const extracted = extractAdsLabel(settings.google[key]);
                    if (extracted !== null) {
                      update("google", key, extracted);
                      setExtractedLabel(key);
                    }
                  }}
                  placeholder={placeholder}
                  hint={hint}
                  note={extractedLabel === key ? "Label extracted" : undefined}
                />
              ))}
              <p className="-mt-2 text-xs text-slate-400">
                Each label fires a Google Ads conversion: sector quote calculator, /demo booking, /contact form, and clicks on
                the standalone WhatsApp buttons (floating button, mobile bar, contact CTA). Paste only the label (after
                <code className="rounded bg-slate-100 px-1">AW-…/</code>). All need the Ads ID above.
              </p>
              <p className="text-xs text-slate-400">
                Tip: if you use Tag Manager, you can manage Analytics &amp; Ads inside GTM and leave the GA4/Ads fields blank.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Snapchat Tab ── */}
      {activeTab === "snapchat" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Snapchat Snap Pixel</h3>
                <p className="text-sm text-slate-500">
                  Loads the Snap Pixel on every public page once the visitor accepts the cookie banner, and fires PAGE_VIEW on first load and each route change. While it is on, the site shows the cookie banner and a Cookie settings link in the footer.
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.snapchat.enabled}
                  onChange={(e) => update("snapchat", "enabled", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm text-slate-700">Enabled</span>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Field
                label="Snap Pixel ID"
                value={settings.snapchat.pixelId}
                onChange={(v) => update("snapchat", "pixelId", v)}
                placeholder="e.g. c0116458-0cf9-41e9-a95b-4f29bd552620"
              />
              <p className="-mt-2 text-xs text-slate-400">
                Find it in Snapchat Ads Manager → Events Manager → your Pixel. To switch ad accounts later, paste the new
                Pixel ID here and save — no code change needed.
              </p>
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
              <strong>Note:</strong> Customer login is handled on the external client portal.
              The website&apos;s <em>Login</em> button redirects to{" "}
              <a
                href="https://falcon-valley.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 underline"
              >
                falcon-valley.com
              </a>
              .
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
  onBlur,
  type = "text",
  placeholder,
  hint,
  note,
  warning,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  note?: string;
  warning?: string;
}) {
  const inputId = useId();
  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
      />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {note && <p className="mt-1 text-xs font-medium text-emerald-600">{note}</p>}
      {warning && <p className="mt-1 text-xs font-medium text-amber-600">{warning}</p>}
    </div>
  );
}

function Ar({ children }: { children: React.ReactNode }) {
  return (
    <bdi lang="ar" dir="rtl">
      {children}
    </bdi>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-slate-100 px-1 text-slate-700">{children}</code>;
}

/** Collapsible how-to for creating Google Ads conversion actions and copying their labels. */
function AdsLabelGuide({ adsId }: { adsId: string }) {
  const id = adsId.trim() || "AW-XXXXXXXXXX";
  const heading = "mb-1.5 text-sm font-semibold text-slate-800";
  const list = "list-decimal space-y-1 ps-5 text-sm text-slate-600";
  return (
    <details className="group rounded-lg border border-slate-200 bg-slate-50">
      <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900">
        <span>
          How to get the conversion labels <span className="font-normal text-slate-400">/</span>{" "}
          <Ar>كيفية الحصول على معرّفات الإحالات الناجحة</Ar>
        </span>
        <span aria-hidden className="text-slate-400 transition-transform group-open:rotate-180">
          &#9662;
        </span>
      </summary>
      <div className="space-y-6 border-t border-slate-200 px-4 py-4">
        <div lang="en" dir="ltr" className="space-y-4">
          <div>
            <h4 className={heading}>First: create a conversion action</h4>
            <ol className={list}>
              <li>
                In Google Ads, from the left-hand menu open Goals <Ar>(الأهداف)</Ar> &rarr; Conversions{" "}
                <Ar>(الإحالات الناجحة)</Ar> &rarr; Summary <Ar>(ملخص)</Ar>.
              </li>
              <li>
                Click <b>+ Create conversion action</b> <Ar>(إنشاء إجراء إحالة ناجحة)</Ar>.
              </li>
              <li>
                Choose <b>Website</b> <Ar>(موقع إلكتروني)</Ar>, enter <Code>falcon-it.sa</Code>, then click{" "}
                <b>Scan</b>.
              </li>
              <li>
                At the bottom of the page, choose <b>Add a conversion action manually</b>{" "}
                <Ar>(إضافة إجراء يدويًا)</Ar>.
              </li>
              <li>
                Fill in: Category &quot;Book appointment&quot; for the demo booking, or &quot;Submit lead
                form&quot; for the contact form; Name e.g. &quot;Demo booking&quot;; Count &quot;One&quot;{" "}
                <Ar>(واحدة)</Ar>.
              </li>
              <li>
                Click <b>Done</b> <Ar>(تم)</Ar>, then <b>Save and continue</b> <Ar>(حفظ ومتابعة)</Ar>.
              </li>
            </ol>
          </div>
          <div>
            <h4 className={heading}>Second: copy the label</h4>
            <ol className={list}>
              <li>
                Choose <b>Use Google tag</b> &rarr; <b>Install the tag yourself</b>{" "}
                <Ar>(تثبيت العلامة بنفسك)</Ar>.
              </li>
              <li>
                Under <b>Event snippet</b> <Ar>(مقتطف الحدث)</Ar> find a line like{" "}
                <Code>&apos;send_to&apos;: &apos;{id}/AbC123xYz&apos;</Code>
              </li>
              <li>
                The label is the part after the slash (<Code>AbC123xYz</Code>). Copy it into the matching
                field below.
              </li>
              <li>
                Don&apos;t paste any code into the site: the Google tag is already installed; only the label
                is needed.
              </li>
            </ol>
          </div>
          <p className="text-sm text-slate-600">
            Repeat for each event: Demo booking, Contact form, WhatsApp click, Quote request (optional).
          </p>
          <p className="text-sm text-slate-600">
            To find a label later: Goals &rarr; Conversions &rarr; click the action&apos;s name &rarr; Tag
            setup <Ar>(إعداد العلامة)</Ar>.
          </p>
        </div>

        <div lang="ar" dir="rtl" className="space-y-4 border-t border-slate-200 pt-4">
          <div>
            <h4 className={heading}>أولًا: إنشاء إجراء إحالة ناجحة</h4>
            <ol className={list}>
              <li>
                في Google Ads، من القائمة الجانبية افتح <b>الأهداف</b> (Goals) &larr;{" "}
                <b>الإحالات الناجحة</b> (Conversions) &larr; <b>ملخص</b> (Summary).
              </li>
              <li>
                انقر على <b>+ إنشاء إجراء إحالة ناجحة</b> (Create conversion action).
              </li>
              <li>
                اختر <b>موقع إلكتروني</b> (Website)، وأدخل <Code>falcon-it.sa</Code>، ثم انقر على{" "}
                <b>Scan</b>.
              </li>
              <li>
                في أسفل الصفحة، اختر <b>إضافة إجراء يدويًا</b> (Add a conversion action manually).
              </li>
              <li>
                املأ الحقول: الفئة (Category) &quot;Book appointment&quot; لحجز العرض التجريبي، أو
                &quot;Submit lead form&quot; لنموذج التواصل؛ الاسم مثل &quot;Demo booking&quot;؛ العدّ
                (Count) &quot;واحدة&quot; (One).
              </li>
              <li>
                انقر على <b>تم</b> (Done)، ثم <b>حفظ ومتابعة</b> (Save and continue).
              </li>
            </ol>
          </div>
          <div>
            <h4 className={heading}>ثانيًا: نسخ المعرّف (label)</h4>
            <ol className={list}>
              <li>
                اختر <b>Use Google tag</b> &larr; <b>تثبيت العلامة بنفسك</b> (Install the tag yourself).
              </li>
              <li>
                تحت <b>مقتطف الحدث</b> (Event snippet) ستجد سطرًا مثل{" "}
                <span dir="ltr" className="inline-block">
                  <Code>&apos;send_to&apos;: &apos;{id}/AbC123xYz&apos;</Code>
                </span>
              </li>
              <li>
                المعرّف هو الجزء الذي يلي الشرطة المائلة (<Code>AbC123xYz</Code>). انسخه إلى الحقل
                المطابق أدناه.
              </li>
              <li>لا تلصق أي كود في الموقع: علامة Google مثبّتة بالفعل، والمطلوب هو المعرّف فقط.</li>
            </ol>
          </div>
          <p className="text-sm text-slate-600">
            كرّر الخطوات لكل حدث: حجز العرض التجريبي، نموذج التواصل، النقر على واتساب، طلب عرض السعر
            (اختياري).
          </p>
          <p className="text-sm text-slate-600">
            للعثور على المعرّف لاحقًا: الأهداف &larr; الإحالات الناجحة &larr; انقر على اسم الإجراء &larr;{" "}
            <b>إعداد العلامة</b> (Tag setup).
          </p>
        </div>
      </div>
    </details>
  );
}
