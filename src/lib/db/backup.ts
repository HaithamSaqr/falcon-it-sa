/**
 * Portable JSON backup / restore of all public tables.
 * Works without external postgres binaries — uses the pg pool directly.
 * Restore is fully transactional (all-or-nothing) and replaces existing data.
 */

import type { Pool } from "pg";

export interface BackupFile {
  app: "falcon";
  version: number;
  createdAt: string;
  tables: Record<string, Record<string, unknown>[]>;
}

const SERIAL_TABLES = ["admin_users", "stats", "sector_pricing"];

export async function dumpDatabase(pool: Pool): Promise<BackupFile> {
  const res = await pool.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  const tables: BackupFile["tables"] = {};
  for (const { tablename } of res.rows) {
    const rows = await pool.query(`SELECT * FROM "${tablename}"`);
    tables[tablename] = rows.rows;
  }
  return { app: "falcon", version: 1, createdAt: new Date().toISOString(), tables };
}

export async function restoreDatabase(pool: Pool, backup: BackupFile): Promise<{ tables: number; rows: number }> {
  if (!backup || backup.app !== "falcon" || typeof backup.tables !== "object") {
    throw new Error("Invalid backup file");
  }

  const client = await pool.connect();
  let tableCount = 0;
  let rowCount = 0;
  try {
    await client.query("BEGIN");

    for (const [table, rows] of Object.entries(backup.tables)) {
      // Only restore into tables that currently exist.
      const exists = await client.query(`SELECT to_regclass($1) AS t`, [`public.${table}`]);
      if (!exists.rows[0]?.t) continue;

      await client.query(`DELETE FROM "${table}"`);
      tableCount++;

      for (const row of rows) {
        const cols = Object.keys(row);
        if (cols.length === 0) continue;
        const values = cols.map((c) => {
          const v = (row as Record<string, unknown>)[c];
          // jsonb columns: pass JSON text so pg casts it back.
          if (v !== null && typeof v === "object" && !Array.isArray(v)) return JSON.stringify(v);
          return v;
        });
        const placeholders = cols.map((_, i) => `$${i + 1}`);
        await client.query(
          `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(",")}) VALUES (${placeholders.join(",")})`,
          values
        );
        rowCount++;
      }
    }

    // Reset serial sequences so future inserts don't collide.
    for (const table of SERIAL_TABLES) {
      await client
        .query(
          `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "${table}"), 1))`
        )
        .catch(() => {});
    }

    await client.query("COMMIT");
    return { tables: tableCount, rows: rowCount };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
