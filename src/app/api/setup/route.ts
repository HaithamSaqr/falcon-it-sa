import { NextRequest } from "next/server";
import crypto from "crypto";
import { isInstalled, writeDbConfig, envDefaults, type DbConnection } from "@/lib/db/config";
import { createPool, resetPool } from "@/lib/db/pool";
import { ensureDatabaseExists } from "@/lib/db/provision";
import { ensureSchema, seedDefaults } from "@/lib/db/schema";
import { DEFAULT_SETTINGS } from "@/lib/db/defaults";
import { hashPassword } from "@/lib/password";
import { createToken, setSessionCookie } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// GET /api/setup — status + suggested defaults to pre-fill the wizard
export async function GET() {
  const installed = await isInstalled();
  const d = envDefaults();
  return jsonSuccess({
    installed,
    defaults: { host: d.host, port: d.port, database: d.database, user: d.user },
  });
}

// POST /api/setup — run first-time installation
export async function POST(request: NextRequest) {
  if (await isInstalled()) {
    return jsonError("Already installed.", 400);
  }

  const body = await request.json().catch(() => null);
  const db = body?.db ?? {};
  const admin = body?.admin ?? {};

  // ── Validate ──
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

  const adminUsername = String(admin.username || "").trim();
  const adminPassword = String(admin.password || "");
  if (!adminUsername) return jsonError("Admin username is required.", 400);
  if (adminPassword.length < 6) {
    return jsonError("Admin password must be at least 6 characters.", 400);
  }

  // ── Ensure the database exists (create it if missing) ──
  let dbCreated = false;
  try {
    const result = await ensureDatabaseExists(conn);
    dbCreated = result.created;
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
    let msg = err instanceof Error ? err.message : "Connection failed";
    if (code === "42501" || code === "42P04") {
      msg = `User "${conn.user}" is not allowed to create the database "${conn.database}". Create it manually or use a role with the CREATEDB privilege.`;
    } else if (code === "28P01" || code === "28000") {
      msg = `Authentication failed for user "${conn.user}". Check the username/password.`;
    } else if (code === "ECONNREFUSED") {
      msg = `No PostgreSQL server is reachable at ${conn.host}:${conn.port}.`;
    }
    return jsonError(`Could not connect to PostgreSQL: ${msg}`, 400);
  }

  // ── Connect to the (existing or newly-created) database ──
  const pool = createPool(conn);
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    await pool.end().catch(() => {});
    const msg = err instanceof Error ? err.message : "Connection failed";
    return jsonError(`Could not connect to PostgreSQL: ${msg}`, 400);
  }

  try {
    await ensureSchema(pool);
    await seedDefaults(pool);

    // Store admin credentials + a fresh JWT secret in the settings singleton.
    const settings = {
      ...DEFAULT_SETTINGS,
      security: {
        ...DEFAULT_SETTINGS.security,
        adminUsername,
        adminPassword: "",
        adminPasswordHash: hashPassword(adminPassword),
        jwtSecret: crypto.randomBytes(48).toString("hex"),
      },
    };
    await pool.query(
      `INSERT INTO singletons (key, value) VALUES ('settings', $1::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [JSON.stringify(settings)]
    );
  } catch (err) {
    await pool.end().catch(() => {});
    const msg = err instanceof Error ? err.message : "Provisioning failed";
    return jsonError(`Setup failed while creating tables: ${msg}`, 500);
  }

  await pool.end().catch(() => {});

  // ── Persist connection config + activate ──
  await writeDbConfig(conn);
  await resetPool();

  // Auto-login the new admin.
  const token = await createToken();
  await setSessionCookie(token);

  return jsonSuccess(
    { installed: true, databaseCreated: dbCreated },
    dbCreated
      ? `Database "${conn.database}" created and setup complete`
      : "Setup complete"
  );
}
