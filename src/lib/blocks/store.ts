/**
 * Page blocks and per-page SEO.
 *
 * Public reads (`getPageBlocks`, `getPageSeo`) never throw: when the app is not
 * installed or the database fails they fall back to the v2 seed (or null).
 * Admin functions (`getPageBlocksAdmin`, `savePageBlocks`, `listPages`,
 * `savePageSeo`) throw so the API can report the failure.
 *
 * Every function takes an optional pool; without one it uses the app pool
 * (`getPool()`, which also runs the boot migrations). Tests inject their own.
 */
import type { Pool } from "pg";
import { getPool } from "@/lib/db/pool";
import { isInstalledSync } from "@/lib/db/config";
import type { Bi } from "./bi";
import { isSafeImage } from "./fields";
import { parseBlock } from "./registry";
import { isBlockType, type Block } from "./types";
import { SEED, SEED_PAGES } from "./seed";
import { insertBlocks, lockPage, markPageSeeded, pageSeededKey } from "./db";
import { withTransaction } from "@/lib/db/tx";

export interface PageSeo {
  page: string;
  title: Bi;
  description: Bi;
  /** "" means use the global OG image. */
  ogImage: string;
}

/** Thrown by savePageBlocks / savePageSeo; message is "<path>: <message>". */
export class BlockValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockValidationError";
  }
}

const PAGE_KEY = /^[a-z0-9][a-z0-9:_-]{0,99}$/;

function checkPageKey(page: string): void {
  if (typeof page !== "string" || !PAGE_KEY.test(page)) {
    throw new BlockValidationError(`page: invalid page key "${String(page)}"`);
  }
}

/** Seed blocks for a page as Block rows (ids are stable placeholders). */
function seedBlocks(page: string, onlyEnabled: boolean): Block[] {
  return (SEED[page] ?? [])
    .filter((b) => !onlyEnabled || b.enabled)
    .map((b) => ({ ...structuredClone(b), id: `seed:${page}:${b.sortOrder}` }) as Block);
}

interface BlockRow {
  id: string;
  page: string;
  type: string;
  sort_order: number;
  enabled: boolean;
  content: unknown;
}

const SELECT_BLOCKS = `SELECT id, page, type, sort_order, enabled, content FROM page_blocks`;

function rowMeta(r: BlockRow) {
  return { id: r.id, page: r.page, sortOrder: r.sort_order, enabled: r.enabled };
}

/** Enabled blocks of a page, in order. Never throws; falls back to the seed. */
export async function getPageBlocks(page: string, pool?: Pool): Promise<Block[]> {
  if (!pool && !isInstalledSync()) return seedBlocks(page, true);
  try {
    const db = pool ?? (await getPool());
    const res = await db.query<BlockRow>(
      `${SELECT_BLOCKS} WHERE page = $1 AND enabled = true ORDER BY sort_order, id`,
      [page],
    );
    if (res.rows.length === 0 && (SEED[page]?.length ?? 0) > 0) {
      // No rows and never seeded or saved (seeding failed or has not run yet):
      // serve the seed. A page the admin cleared carries the marker and stays empty.
      const marked = await db.query(`SELECT 1 FROM data_fixes WHERE key = $1`, [pageSeededKey(page)]);
      if (marked.rowCount === 0) return seedBlocks(page, true);
    }
    const blocks: Block[] = [];
    for (const r of res.rows) {
      const parsed = parseBlock(r.type, r.content, rowMeta(r));
      if (parsed.ok) blocks.push(parsed.block);
      else console.error(`[blocks] skipping invalid block ${r.id} on "${page}": ${parsed.error}`);
    }
    return blocks;
  } catch (err) {
    console.error(`[blocks] getPageBlocks("${page}") failed, serving seed:`, err);
    return seedBlocks(page, true);
  }
}

/**
 * Every block of a page (enabled or not), in order, for the admin editor.
 * A stored block that no longer validates is returned as stored so the admin
 * can fix it; saving re-validates.
 */
export async function getPageBlocksAdmin(page: string, pool?: Pool): Promise<Block[]> {
  const db = pool ?? (await getPool());
  const res = await db.query<BlockRow>(`${SELECT_BLOCKS} WHERE page = $1 ORDER BY sort_order, id`, [page]);
  return res.rows.map((r) => {
    const parsed = parseBlock(r.type, r.content, rowMeta(r));
    if (parsed.ok) return parsed.block;
    return { ...rowMeta(r), type: r.type, content: r.content } as Block;
  });
}

/**
 * Replace a page's blocks. Validates every block first (nothing is written if
 * one fails), then deletes the page's rows and inserts the new list in one
 * transaction. Order of `blocks` becomes sort_order; `page` on each block is
 * ignored. Marks the page as admin-owned so boot seeding never refills it.
 */
export async function savePageBlocks(page: string, blocks: Block[], pool?: Pool): Promise<void> {
  checkPageKey(page);
  if (!Array.isArray(blocks)) throw new BlockValidationError("blocks: expected a list");

  const rows = blocks.map((b, i) => {
    const type = (b as { type?: unknown } | null)?.type;
    if (typeof type !== "string" || !isBlockType(type)) {
      throw new BlockValidationError(`blocks.${i}.type: unknown block type "${String(type)}"`);
    }
    const parsed = parseBlock(type, b.content);
    if (!parsed.ok) {
      const error = parsed.error.startsWith("(content): ")
        ? parsed.error.slice("(content)".length)
        : `.${parsed.error}`;
      throw new BlockValidationError(`blocks.${i}.content${error}`);
    }
    return { id: b.id, type, enabled: b.enabled !== false, content: parsed.block.content };
  });

  const db = pool ?? (await getPool());
  await withTransaction(db, async (client) => {
    await lockPage(client, page);
    await client.query(`DELETE FROM page_blocks WHERE page = $1`, [page]);
    await insertBlocks(client, page, rows);
    await markPageSeeded(client, page);
  });
}

/** Every known page (seed pages first, then any other stored page) with its block count. */
export async function listPages(pool?: Pool): Promise<{ page: string; count: number }[]> {
  const db = pool ?? (await getPool());
  const res = await db.query<{ page: string; n: number }>(
    `SELECT page, count(*)::int AS n FROM page_blocks GROUP BY page`,
  );
  const counts = new Map(res.rows.map((r) => [r.page, Number(r.n)]));
  const extra = [...counts.keys()].filter((p) => !Object.hasOwn(SEED, p)).sort();
  return [...SEED_PAGES, ...extra].map((page) => ({ page, count: counts.get(page) ?? 0 }));
}

interface SeoRow {
  page: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  og_image: string;
}

/** Per-page SEO row, or null when there is none (or the DB is unavailable). Never throws. */
export async function getPageSeo(page: string, pool?: Pool): Promise<PageSeo | null> {
  if (!pool && !isInstalledSync()) return null;
  try {
    const db = pool ?? (await getPool());
    const res = await db.query<SeoRow>(
      `SELECT page, title_en, title_ar, description_en, description_ar, og_image FROM page_seo WHERE page = $1`,
      [page],
    );
    const r = res.rows[0];
    if (!r) return null;
    return {
      page: r.page,
      title: { en: r.title_en, ar: r.title_ar },
      description: { en: r.description_en, ar: r.description_ar },
      ogImage: r.og_image,
    };
  } catch (err) {
    console.error(`[blocks] getPageSeo("${page}") failed:`, err);
    return null;
  }
}

const str = (v: unknown, max: number) => typeof v === "string" && v.length <= max;

/** Insert or update a page's SEO row. */
export async function savePageSeo(row: PageSeo, pool?: Pool): Promise<void> {
  checkPageKey(row?.page);
  for (const [field, max] of [
    ["title", 300],
    ["description", 1000],
  ] as const) {
    const v = row[field];
    if (!v || !str(v.en, max) || !str(v.ar, max)) {
      throw new BlockValidationError(`${field}: expected { en, ar } text up to ${max} characters`);
    }
  }
  if (typeof row.ogImage !== "string" || !isSafeImage(row.ogImage)) {
    throw new BlockValidationError("ogImage: Use /images/..., /api/uploads/... or an https:// URL, or leave empty");
  }
  const db = pool ?? (await getPool());
  await db.query(
    `INSERT INTO page_seo (page, title_en, title_ar, description_en, description_ar, og_image, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (page) DO UPDATE SET
       title_en = EXCLUDED.title_en, title_ar = EXCLUDED.title_ar,
       description_en = EXCLUDED.description_en, description_ar = EXCLUDED.description_ar,
       og_image = EXCLUDED.og_image, updated_at = now()`,
    [row.page, row.title.en, row.title.ar, row.description.en, row.description.ar, row.ogImage],
  );
}
