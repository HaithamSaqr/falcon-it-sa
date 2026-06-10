"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Defaults {
  host: string;
  port: number;
  database: string;
  user: string;
}

export default function SetupForm() {
  const router = useRouter();

  // Database connection
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("5432");
  const [database, setDatabase] = useState("falcon");
  const [user, setUser] = useState("postgres");
  const [dbPassword, setDbPassword] = useState("");

  // Admin account
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirm, setConfirm] = useState("");

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

  async function handleSubmit(e: React.FormEvent) {
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

  const field =
    "w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const label = "mb-1.5 block text-sm font-medium text-slate-700";

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

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-7 shadow-lg shadow-slate-200/60"
        >
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {/* ── Database ── */}
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

          {/* ── Admin account ── */}
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

        <p className="mt-6 text-center text-xs text-slate-400">
          Falcon Smart Solutions &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
