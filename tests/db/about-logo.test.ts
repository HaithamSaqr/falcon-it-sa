/**
 * The `v2-about-logo-under-hero` data fix: on the about page the client logo
 * strip moves back to right under the hero, only while the enabled blocks are
 * still exactly the old seeded order.
 *
 * Runs only under `npm run test:db` against a local `_test` database, inside
 * scratch schemas dropped before and after.
 */
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool, type PoolConfig } from "pg";
import { ABOUT_LOGO_FIX_KEY, ABOUT_OLD_ORDER, ensureReady } from "@/lib/db/migrate";
import { ensureSchema } from "@/lib/db/schema";
import { ABOUT_SEED } from "@/lib/blocks/seed/about";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const canUseDb =
  !!process.env.PGDATABASE && process.env.PGDATABASE.endsWith("_test") && LOCAL_HOSTS.has(process.env.PGHOST ?? "");

function scratchPool(schema: string): Pool {
  const cfg: PoolConfig = {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    max: 4,
    options: `-c search_path=${schema}`,
  };
  return new Pool(cfg);
}

type Row = { type: string; enabled?: boolean };

/** A scratch schema whose about page holds `rows` (plus one block on home that must not move). */
async function setup(schema: string, rows: Row[]) {
  const pool = scratchPool(schema);
  await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await pool.query(`CREATE SCHEMA ${schema}`);
  await ensureSchema(pool);
  const content = (type: string) => ABOUT_SEED.find((b) => b.type === type)?.content ?? {};
  for (let i = 0; i < rows.length; i++) {
    await pool.query(
      `INSERT INTO page_blocks (id, page, type, sort_order, enabled, content) VALUES ($1, 'about', $2, $3, $4, $5::jsonb)`,
      [randomUUID(), rows[i].type, i, rows[i].enabled ?? true, JSON.stringify(content(rows[i].type))],
    );
  }
  // Another page in the old about order: never touched.
  for (let i = 0; i < ABOUT_OLD_ORDER.length; i++) {
    await pool.query(`INSERT INTO page_blocks (id, page, type, sort_order, enabled, content) VALUES ($1, 'contact', $2, $3, true, '{}'::jsonb)`, [
      randomUUID(),
      ABOUT_OLD_ORDER[i],
      i,
    ]);
  }
  await ensureReady(pool);
  await ensureReady(pool);
  return pool;
}

async function order(pool: Pool, page: string): Promise<string[]> {
  const r = await pool.query(`SELECT type, enabled, sort_order FROM page_blocks WHERE page = $1 ORDER BY sort_order`, [page]);
  return r.rows.map((x) => `${x.sort_order}:${x.type}${x.enabled ? "" : "(off)"}`);
}

const drop = async (pool: Pool, schema: string) => {
  await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await pool.end();
};

describe("about seed", () => {
  it("puts the logo strip right under the hero", () => {
    expect(ABOUT_SEED.map((b) => b.type)).toEqual(["hero", "logo_wall", "departments", "process", "booking"]);
  });
});

describe.skipIf(!canUseDb)("about logo fix on the production order", () => {
  const schema = "t_about_logo";
  let pool: Pool;
  beforeAll(async () => {
    pool = await setup(schema, ABOUT_OLD_ORDER.map((type) => ({ type })));
  }, 60_000);
  afterAll(() => drop(pool, schema));

  it("moves the strip right under the hero and renumbers", async () => {
    expect(await order(pool, "about")).toEqual(["0:hero", "1:logo_wall", "2:departments", "3:process", "4:booking"]);
  });

  it("leaves other pages alone and runs once", async () => {
    expect(await order(pool, "contact")).toEqual(["0:hero", "1:departments", "2:process", "3:logo_wall", "4:booking"]);
    expect((await pool.query(`SELECT 1 FROM data_fixes WHERE key = $1`, [ABOUT_LOGO_FIX_KEY])).rowCount).toBe(1);
  });
});

describe.skipIf(!canUseDb)("about logo fix with a disabled block in between", () => {
  const schema = "t_about_logo_off";
  let pool: Pool;
  beforeAll(async () => {
    pool = await setup(schema, [
      { type: "hero" },
      { type: "faq_ref", enabled: false },
      { type: "departments" },
      { type: "process" },
      { type: "logo_wall" },
      { type: "booking" },
    ]);
  }, 60_000);
  afterAll(() => drop(pool, schema));

  it("still moves the strip (enabled order matches) and keeps the disabled block's place", async () => {
    expect(await order(pool, "about")).toEqual(["0:hero", "1:logo_wall", "2:faq_ref(off)", "3:departments", "4:process", "5:booking"]);
  });
});

describe.skipIf(!canUseDb)("about logo fix after an admin reordered the page", () => {
  const schema = "t_about_logo_admin";
  let pool: Pool;
  beforeAll(async () => {
    pool = await setup(schema, ["hero", "process", "departments", "logo_wall", "booking"].map((type) => ({ type })));
  }, 60_000);
  afterAll(() => drop(pool, schema));

  it("leaves the admin's order untouched", async () => {
    expect(await order(pool, "about")).toEqual(["0:hero", "1:process", "2:departments", "3:logo_wall", "4:booking"]);
    expect((await pool.query(`SELECT 1 FROM data_fixes WHERE key = $1`, [ABOUT_LOGO_FIX_KEY])).rowCount).toBe(1);
  });
});

describe.skipIf(!canUseDb)("about on a fresh database", () => {
  const schema = "t_about_logo_fresh";
  let pool: Pool;
  beforeAll(async () => {
    pool = scratchPool(schema);
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.query(`CREATE SCHEMA ${schema}`);
    await ensureReady(pool);
  }, 60_000);
  afterAll(() => drop(pool, schema));

  it("seeds the strip right under the hero", async () => {
    expect(await order(pool, "about")).toEqual(["0:hero", "1:logo_wall", "2:departments", "3:process", "4:booking"]);
  });
});
