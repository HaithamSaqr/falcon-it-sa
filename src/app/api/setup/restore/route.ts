import { NextRequest } from "next/server";
import { isInstalled, writeDbConfig, type DbConnection } from "@/lib/db/config";
import { createPool } from "@/lib/db/pool";
import { ensureDatabaseExists } from "@/lib/db/provision";
import { ensureReady } from "@/lib/db/migrate";
import { restoreDatabase, type BackupFile } from "@/lib/db/backup";
import { resetPool } from "@/lib/db/pool";
import { isSetupComplete } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// POST /api/setup/restore — first-time setup via backup restore (no admin creation needed)
export async function POST(request: NextRequest) {
  if ((await isInstalled()) && (await isSetupComplete())) {
    return jsonError("Already installed.", 400);
  }

  let db: Record<string, unknown> = {};
  let backup: BackupFile | null = null;

  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("multipart/form-data")) {
      const form = await request.formData();
      const dbRaw = form.get("db");
      const file = form.get("file");
      if (typeof dbRaw === "string") db = JSON.parse(dbRaw);
      if (file instanceof File) backup = JSON.parse(await file.text());
    } else {
      const body = await request.json().catch(() => null);
      db = body?.db ?? {};
      backup = body?.backup ?? null;
    }
  } catch {
    return jsonError("Could not parse the request body.", 400);
  }

  if (!backup) return jsonError("No backup file provided.", 400);
  if (backup.app !== "falcon" || typeof backup.tables !== "object") {
    return jsonError("Invalid backup file format.", 400);
  }

  const conn: DbConnection = {
    host: String(db.host || "").trim(),
    port: Number(db.port) || 5432,
    database: String(db.database || "").trim(),
    user: String(db.user || "").trim(),
    password: String(db.password ?? ""),
    ssl: Boolean(db.ssl),
  };
  if (!conn.host || !conn.database || !conn.user) {
    return jsonError("Database host, name and user are required.", 400);
  }

  // Ensure the database exists
  try {
    await ensureDatabaseExists(conn);
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
    let msg = err instanceof Error ? err.message : "Connection failed";
    if (code === "42501" || code === "42P04") {
      msg = `User "${conn.user}" is not allowed to create the database "${conn.database}". Create it manually or use a role with CREATEDB privilege.`;
    } else if (code === "28P01" || code === "28000") {
      msg = `Authentication failed for user "${conn.user}". Check the username/password.`;
    } else if (code === "ECONNREFUSED") {
      msg = `No PostgreSQL server is reachable at ${conn.host}:${conn.port}.`;
    }
    return jsonError(`Could not connect to PostgreSQL: ${msg}`, 400);
  }

  const pool = createPool(conn);
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    await pool.end().catch(() => {});
    const msg = err instanceof Error ? err.message : "Connection failed";
    return jsonError(`Could not connect to the database: ${msg}`, 400);
  }

  try {
    // Run migrations to create schema first, then restore data on top
    await ensureReady(pool);
    const result = await restoreDatabase(pool, backup);
    await pool.end().catch(() => {});

    // Persist config and activate
    await writeDbConfig(conn);
    await resetPool();

    return jsonSuccess(
      { installed: true, tables: result.tables, rows: result.rows },
      `Backup restored: ${result.rows} rows across ${result.tables} tables`
    );
  } catch (err) {
    await pool.end().catch(() => {});
    const msg = err instanceof Error ? err.message : "Restore failed";
    return jsonError(`Restore failed: ${msg}`, 500);
  }
}
