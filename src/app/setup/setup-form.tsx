"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Defaults {
  host: string;
  port: number;
  database: string;
  user: string;
}

type Tab = "new" | "restore";

export default function SetupForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("new");

  // Database connection (shared between both tabs)
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("5432");
  const [database, setDatabase] = useState("falcon");
  const [user, setUser] = useState("postgres");
  const [dbPassword, setDbPassword] = useState("");

  // New install – admin account
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Restore – backup file
  const [backupFile, setBackupFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill DB defaults from the server (env-aware).
  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && res.data?.defaults) {
          const d = res.data.defaults as Defaults;
          setHost(d.host || "localhost");
          setPort(String(d.port || 5432));
          setDatabase(d.database || "falcon");
          setUser(d.user || "postgres");
        }
      })
      .catch(() => {});
  }, []);

  async function handleNewInstall(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!adminUsername.trim()) return setError("Admin username is required / اسم الأدمن مطلوب");
    if (adminPassword.length < 6)
      return setError("Admin password must be at least 6 characters / كلمة المرور 6 أحرف على الأقل");
    if (adminPassword !== confirm)
      return setError("Passwords do not match / كلمتا المرور غير متطابقتين");

    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db: {
            host: host.trim(),
            port: Number(port) || 5432,
            database: database.trim(),
            user: user.trim(),
            password: dbPassword,
          },
          admin: { username: adminUsername.trim(), password: adminPassword },
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        setError(data.error || "Setup failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!backupFile) return setError("Please select a backup file / يرجى اختيار ملف النسخة الاحتياطية");

    setLoading(true);
    try {
      const form = new FormData();
      form.append(
        "db",
        JSON.stringify({
          host: host.trim(),
          port: Number(port) || 5432,
          database: database.trim(),
          user: user.trim(),
          password: dbPassword,
        })
      );
      form.append("file", backupFile);

      const res = await fetch("/api/setup/restore", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/login");
      } else {
        setError(data.error || "Restore failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const label = "mb-1.5 block text-sm font-medium text-slate-700";

  const dbFields = (
    <>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Database / قاعدة البيانات
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className={label} htmlFor="host">Host / المضيف</label>
          <input id="host" className={field} value={host} onChange={(e) => setHost(e.target.value)} placeholder="localhost" required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={label} htmlFor="port">Port / المنفذ</label>
          <input id="port" className={field} value={port} onChange={(e) => setPort(e.target.value)} placeholder="5432" inputMode="numeric" required />
        </div>
        <div className="col-span-2">
          <label className={label} htmlFor="database">Database name / اسم القاعدة</label>
          <input id="database" className={field} value={database} onChange={(e) => setDatabase(e.target.value)} placeholder="falcon" required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={label} htmlFor="user">User / المستخدم</label>
          <input id="user" className={field} value={user} onChange={(e) => setUser(e.target.value)} placeholder="postgres" required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={label} htmlFor="dbpass">Password / كلمة المرور</label>
          <input id="dbpass" type="password" className={field} value={dbPassword} onChange={(e) => setDbPassword(e.target.value)} placeholder="••••••••" autoComplete="off" />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            <span className="text-cyan-600">FAL</span>CON
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">Quick Setup · الإعداد السريع</p>
          <p className="mt-1 text-xs text-slate-400">
            Connect your PostgreSQL database and create the admin account.
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="mb-4 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setTab("new"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === "new"
                ? "bg-white text-cyan-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            New Install / تثبيت جديد
          </button>
          <button
            type="button"
            onClick={() => { setTab("restore"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === "restore"
                ? "bg-white text-cyan-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Restore Backup / استعادة نسخة
          </button>
        </div>

        {/* ── New Install Form ── */}
        {tab === "new" && (
          <form
            onSubmit={handleNewInstall}
            className="rounded-2xl bg-white p-7 shadow-lg shadow-slate-200/60"
          >
            {error && (
              <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            {dbFields}

            {/* Admin account */}
            <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Admin account / حساب الأدمن
            </h2>
            <div className="space-y-3">
              <div>
                <label className={label} htmlFor="adminUsername">Admin name / اسم الأدمن</label>
                <input id="adminUsername" className={field} value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="admin" autoComplete="username" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label} htmlFor="adminPassword">Password / كلمة المرور</label>
                  <input id="adminPassword" type="password" className={field} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Min. 6 chars" minLength={6} autoComplete="new-password" required />
                </div>
                <div>
                  <label className={label} htmlFor="confirm">Confirm / تأكيد</label>
                  <input id="confirm" type="password" className={field} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter" minLength={6} autoComplete="new-password" required />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Setting up… / جارٍ الإعداد…" : "Install & Continue / تثبيت ومتابعة"}
            </button>
          </form>
        )}

        {/* ── Restore Backup Form ── */}
        {tab === "restore" && (
          <form
            onSubmit={handleRestore}
            className="rounded-2xl bg-white p-7 shadow-lg shadow-slate-200/60"
          >
            {error && (
              <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            {dbFields}

            {/* Backup file */}
            <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Backup File / ملف النسخة الاحتياطية
            </h2>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-4 py-8 text-center transition-colors hover:border-cyan-400 hover:bg-cyan-50/50"
            >
              {backupFile ? (
                <>
                  <svg className="mb-2 h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <p className="text-sm font-medium text-cyan-700">{backupFile.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{(backupFile.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <svg className="mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm font-medium text-slate-600">
                    Click to select backup file
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    انقر لاختيار ملف النسخة الاحتياطية (.json)
                  </p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setBackupFile(f);
                  setError("");
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !backupFile}
              className="mt-6 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Restoring… / جارٍ الاستعادة…"
                : "Restore & Continue / استعادة ومتابعة"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          Falcon Smart Solutions &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
