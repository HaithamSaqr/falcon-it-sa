/**
 * Low-level page_blocks SQL shared by the store (src/lib/blocks/store.ts) and
 * the boot-time seeding (src/lib/db/migrate.ts). Takes a client/pool argument
 * and never imports the global pool, so migrate.ts can use it without an
 * import cycle through getPool() -> ensureReady().
 */
import { randomUUID } from "crypto";
import type { Pool, PoolClient } from "pg";

type Queryable = Pool | PoolClient;

export interface BlockRowInput {
  id?: string;
  type: string;
  enabled: boolean;
  content: unknown;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

/** data_fixes key recording that a page got its seed (or was saved by an admin). */
export function pageSeededKey(page: string): string {
  return `page-seeded:${page}`;
}

/** Serialise writers of one page (admin saves and boot seeding) inside a transaction. */
export async function lockPage(c: PoolClient, page: string): Promise<void> {
  await c.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [pageSeededKey(page)]);
}

export async function markPageSeeded(c: Queryable, page: string): Promise<void> {
  await c.query(`INSERT INTO data_fixes (key) VALUES ($1) ON CONFLICT (key) DO NOTHING`, [pageSeededKey(page)]);
}

/** Insert blocks for a page with sort_order 0..n-1. Ids that are not unique UUIDs are replaced. */
export async function insertBlocks(c: Queryable, page: string, blocks: BlockRowInput[]): Promise<void> {
  const seen = new Set<string>();
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const id = isUuid(b.id) && !seen.has(b.id.toLowerCase()) ? b.id.toLowerCase() : randomUUID();
    seen.add(id);
    await c.query(
      `INSERT INTO page_blocks (id, page, type, sort_order, enabled, content, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, now())`,
      [id, page, b.type, i, b.enabled, JSON.stringify(b.content)],
    );
  }
}
