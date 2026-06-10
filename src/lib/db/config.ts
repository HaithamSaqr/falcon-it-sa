/**
 * Database connection configuration.
 *
 * The DB connection params must live OUTSIDE the database (chicken-and-egg),
 * so they are persisted to `data/db-config.json` — written by the first-run
 * setup wizard and stored in the Docker volume. Environment variables act as
 * a fallback / pre-fill source (useful for docker-compose).
 */

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

export interface DbConnection {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

interface DbConfigFile {
  installed: boolean;
  db: DbConnection;
}

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "db-config.json");

// ── Env-based defaults (pre-fill the wizard, fallback in docker) ─────
export function envDefaults(): DbConnection {
  return {
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE || "falcon",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "",
    ssl: process.env.PGSSL === "true",
  };
}

// ── Read (sync + async) ─────────────────────────────────────────────
function readConfigSync(): DbConfigFile | null {
  try {
    const raw = fsSync.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as DbConfigFile;
  } catch {
    return null;
  }
}

export async function readDbConfig(): Promise<DbConfigFile | null> {
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as DbConfigFile;
  } catch {
    return null;
  }
}

/** Synchronous install check — safe to call from server components/layouts. */
export function isInstalledSync(): boolean {
  return readConfigSync()?.installed === true;
}

export async function isInstalled(): Promise<boolean> {
  const cfg = await readDbConfig();
  return cfg?.installed === true;
}

/** The active connection params, or null if not installed. */
export async function getConnection(): Promise<DbConnection | null> {
  const cfg = await readDbConfig();
  return cfg?.installed ? cfg.db : null;
}

// ── Write ───────────────────────────────────────────────────────────
export async function writeDbConfig(db: DbConnection): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const payload: DbConfigFile = { installed: true, db };
  const tmp = CONFIG_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(payload, null, 2), "utf-8");
  await fs.rename(tmp, CONFIG_FILE);
}
