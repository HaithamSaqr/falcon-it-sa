/**
 * Ensure the target database exists before installing.
 *
 * PostgreSQL won't let you connect to a non-existent database, so if the
 * target is missing (SQLSTATE 3D000) we connect to a maintenance database
 * (`postgres` / `template1`) and `CREATE DATABASE` it, then proceed.
 */

import { createPool } from "./pool";
import type { DbConnection } from "./config";

const MAINTENANCE_DBS = ["postgres", "template1"];

/** Quote a SQL identifier safely (DDL can't be parameterized). */
function quoteIdent(name: string): string {
  return '"' + name.replace(/"/g, '""') + '"';
}

function pgCode(err: unknown): string | undefined {
  return (err as { code?: string } | null)?.code;
}

export async function ensureDatabaseExists(
  conn: DbConnection
): Promise<{ created: boolean }> {
  // 1) Try connecting to the target database directly.
  const direct = createPool(conn);
  try {
    await direct.query("SELECT 1");
    return { created: false }; // exists & reachable
  } catch (err) {
    // 3D000 = invalid_catalog_name → database doesn't exist yet.
    if (pgCode(err) !== "3D000") throw err; // refused / auth / etc. → surface it
  } finally {
    await direct.end().catch(() => {});
  }

  // 2) Database is missing — create it via a maintenance database.
  let lastErr: unknown = null;
  for (const maint of MAINTENANCE_DBS) {
    const admin = createPool({ ...conn, database: maint });
    try {
      await admin.query(`CREATE DATABASE ${quoteIdent(conn.database)}`);
      return { created: true };
    } catch (err) {
      lastErr = err;
      const code = pgCode(err);
      if (code === "42P04") return { created: false }; // created concurrently — fine
      if (code === "3D000") continue; // this maintenance db is missing → try next
      throw err; // e.g. 42501 insufficient_privilege → report it
    } finally {
      await admin.end().catch(() => {});
    }
  }
  throw lastErr ?? new Error("Could not create the database.");
}
