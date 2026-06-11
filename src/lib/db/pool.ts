/**
 * PostgreSQL connection pool — lazy singleton.
 * Cached on globalThis to survive Next.js dev hot-reload (avoids pool leaks).
 */

import { Pool, type PoolConfig, type QueryResultRow } from "pg";
import { getConnection, type DbConnection } from "./config";
import { ensureReady } from "./migrate";

type PoolCache = { pool: Pool | null; signature: string | null; ready: Promise<void> | null };

const globalForPg = globalThis as unknown as { __falconPg?: PoolCache };
const cache: PoolCache = globalForPg.__falconPg ?? { pool: null, signature: null, ready: null };
globalForPg.__falconPg = cache;
// Re-run migrations on every hot-reload so new schema changes are picked up automatically.
cache.ready = null;

function toPoolConfig(c: DbConnection): PoolConfig {
  return {
    host: c.host,
    port: c.port,
    database: c.database,
    user: c.user,
    password: c.password,
    ssl: c.ssl ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  };
}

function signature(c: DbConnection): string {
  return `${c.host}:${c.port}/${c.database}/${c.user}`;
}

/** Build a one-off pool from explicit params (used by the setup wizard to test). */
export function createPool(conn: DbConnection): Pool {
  return new Pool(toPoolConfig(conn));
}

/** Get the active pool (from saved config). Throws if the DB isn't configured yet. */
export async function getPool(): Promise<Pool> {
  const conn = await getConnection();
  if (!conn) {
    throw new Error("Database is not configured. Complete setup at /setup first.");
  }
  const sig = signature(conn);
  if (cache.pool && cache.signature === sig) {
    await ensureReadyOnce(cache.pool);
    return cache.pool;
  }

  // Config changed (or first use) — dispose old pool, create new.
  if (cache.pool) {
    const old = cache.pool;
    cache.pool = null;
    cache.ready = null;
    old.end().catch(() => {});
  }
  cache.pool = createPool(conn);
  cache.signature = sig;
  cache.ready = null;
  await ensureReadyOnce(cache.pool);
  return cache.pool;
}

/** Run schema + migration exactly once per pool; retry on failure. */
async function ensureReadyOnce(pool: Pool): Promise<void> {
  if (!cache.ready) {
    cache.ready = ensureReady(pool).catch((err) => {
      cache.ready = null; // allow retry on next call
      throw err;
    });
  }
  await cache.ready;
}

/** Reset the cached pool — call after the connection config changes. */
export async function resetPool(): Promise<void> {
  cache.ready = null;
  if (cache.pool) {
    const old = cache.pool;
    cache.pool = null;
    cache.signature = null;
    await old.end().catch(() => {});
  }
}

/** Convenience query helper against the active pool. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  const pool = await getPool();
  return pool.query<T>(text, params as never[]);
}
