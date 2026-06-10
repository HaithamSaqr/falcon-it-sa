import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readDbConfig, writeDbConfig, type DbConnection } from "@/lib/db/config";
import { ensureDatabaseExists } from "@/lib/db/provision";
import { createPool, resetPool } from "@/lib/db/pool";
import { ensureReady } from "@/lib/db/migrate";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// GET /api/admin/connection — current connection (password never returned)
export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const db = (await readDbConfig())?.db;
  return jsonSuccess({
    host: db?.host ?? "",
    port: db?.port ?? 5432,
    database: db?.database ?? "",
    user: db?.user ?? "",
    hasPassword: Boolean(db?.password),
    ssl: db?.ssl ?? false,
  });
}

// PUT /api/admin/connection — test, provision, persist, reconnect
export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const current = (await readDbConfig())?.db;

  // Empty password field → keep the existing password.
  const conn: DbConnection = {
    host: String(body?.host || "").trim(),
    port: Number(body?.port) || 5432,
    database: String(body?.database || "").trim(),
    user: String(body?.user || "").trim(),
    password: body?.password ? String(body.password) : current?.password ?? "",
    ssl: Boolean(body?.ssl),
  };
  if (!conn.host || !conn.database || !conn.user) {
    return jsonError("Host, database and user are required.", 400);
  }

  // Create the database if missing, then connect + provision.
  try {
    await ensureDatabaseExists(conn);
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
    let msg = err instanceof Error ? err.message : "Connection failed";
    if (code === "42501" || code === "42P04") {
      msg = `User "${conn.user}" cannot create database "${conn.database}" (needs CREATEDB).`;
    } else if (code === "28P01" || code === "28000") {
      msg = `Authentication failed for user "${conn.user}".`;
    } else if (code === "ECONNREFUSED") {
      msg = `No PostgreSQL server is reachable at ${conn.host}:${conn.port}.`;
    }
    return jsonError(`Connection failed: ${msg}`, 400);
  }

  const pool = createPool(conn);
  try {
    await pool.query("SELECT 1");
    await ensureReady(pool);
  } catch (err) {
    await pool.end().catch(() => {});
    const msg = err instanceof Error ? err.message : "Provisioning failed";
    return jsonError(`Connection failed: ${msg}`, 400);
  }
  await pool.end().catch(() => {});

  await writeDbConfig(conn);
  await resetPool();

  return jsonSuccess({ saved: true }, "Database connection updated");
}
