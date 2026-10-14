"use client";

import { useEffect, useState } from "react";

type ProfileInfo = { size: number; updatedAt: string } | null;

/** Public download route (an API route, so a plain anchor, not a page link). */
const DOWNLOAD_URL = "/api/company-profile";

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Settings > Company Profile: upload, replace or remove the PDF that the
 * thank-you page offers as "Download our company profile". Saved on its own
 * (no need to press the page's Save button).
 */
export default function CompanyProfileCard() {
  const [profile, setProfile] = useState<ProfileInfo | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/company-profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.data?.profile ?? null))
      .catch(() => setProfile(null));
  }, []);

  async function upload(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/company-profile", { method: "POST", body });
      const d = await res.json();
      if (res.ok && d.success !== false) {
        setProfile(d.data?.profile ?? null);
        setMsg({ ok: true, text: "Company profile uploaded. The thank-you page now shows the download button." });
      } else {
        setMsg({ ok: false, text: d.error || "Upload failed" });
      }
    } catch {
      setMsg({ ok: false, text: "Upload failed (network error)" });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Remove the company profile? The download button will disappear from the thank-you page.")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/company-profile", { method: "DELETE" });
      if (res.ok) {
        setProfile(null);
        setMsg({ ok: true, text: "Company profile removed." });
      } else {
        setMsg({ ok: false, text: "Could not remove the file" });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6" data-company-profile-card="">
      <h3 className="mb-1 text-sm font-semibold text-slate-700">Company Profile (PDF)</h3>
      <p className="mb-4 text-xs text-slate-400">
        Visitors can download it from the thank-you page after they send the demo or contact form. PDF only, up to 25 MB.
      </p>

      {msg && (
        <div className={`mb-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {profile === undefined ? (
          <span className="text-sm text-slate-400">Loading…</span>
        ) : profile ? (
          <span className="text-sm text-slate-600">
            Current file: {formatSize(profile.size)}, uploaded {new Date(profile.updatedAt).toLocaleString()}
          </span>
        ) : (
          <span className="text-sm text-slate-500">No profile uploaded yet. The download button is hidden.</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700">
          {busy ? "Working…" : profile ? "Replace PDF" : "Upload PDF"}
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </label>
        {profile && (
          <>
            <a
              href={DOWNLOAD_URL}
              download
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Download current
            </a>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
}
