/**
 * The `v2-home-screens-2026-10` data fix: the stored home hero and departments
 * images move from the scene photos to real Falcon ERP screens, only where
 * they still hold the old seeded values.
 *
 * Runs only under `npm run test:db` against a local `_test` database, inside
 * scratch schemas dropped before and after.
 */
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool, type PoolConfig } from "pg";
import { HOME_SCREENS_FIX_KEY, ensureReady } from "@/lib/db/migrate";
import { ensureSchema } from "@/lib/db/schema";
import { HOME_SCREENS, HOME_SEED } from "@/lib/blocks/seed/home";

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

const { dashboard, trialBalance } = HOME_SCREENS;
type Content = Record<string, unknown> & { card?: { image: string; alt: { en: string; ar: string } } };

/** The seeded home blocks as production stored them before the screens (old photos and alts). */
function oldHome(): { type: string; content: Content }[] {
  return HOME_SEED.map((blk) => {
    const content = structuredClone(blk.content) as Content;
    if (blk.type === "hero") content.card = { ...content.card!, image: dashboard.old.image, alt: { ...dashboard.old.alt } };
    if (blk.type === "departments") Object.assign(content, { image: trialBalance.old.image, imageAlt: { ...trialBalance.old.alt } });
    return { type: blk.type, content };
  });
}

async function setup(schema: string, edit: (blocks: { type: string; content: Content }[]) => void) {
  const pool = scratchPool(schema);
  await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await pool.query(`CREATE SCHEMA ${schema}`);
  await ensureSchema(pool);
  const blocks = oldHome();
  edit(blocks);
  for (let i = 0; i < blocks.length; i++) {
    await pool.query(`INSERT INTO page_blocks (id, page, type, sort_order, enabled, content) VALUES ($1, 'home', $2, $3, true, $4::jsonb)`, [
      randomUUID(),
      blocks[i].type,
      i,
      JSON.stringify(blocks[i].content),
    ]);
  }
  await ensureReady(pool);
  await ensureReady(pool);
  return pool;
}

async function block(pool: Pool, type: string): Promise<Content> {
  const r = await pool.query(`SELECT content FROM page_blocks WHERE page = 'home' AND type = $1`, [type]);
  return r.rows[0].content;
}

describe.skipIf(!canUseDb)("home screens fix on a production-shaped home page", () => {
  const schema = "t_home_screens";
  let pool: Pool;

  beforeAll(async () => {
    // An admin rewrote the English alt of the departments photo but kept the photo.
    pool = await setup(schema, (blocks) => {
      const d = blocks.find((b) => b.type === "departments")!;
      (d.content.imageAlt as { en: string }).en = "Our team at work";
    });
  }, 60_000);

  afterAll(async () => {
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.end();
  });

  it("puts the dashboard screen and its alt text in the hero", async () => {
    const hero = await block(pool, "hero");
    expect(hero.card!.image).toBe(dashboard.image);
    expect(hero.card!.alt).toEqual(dashboard.alt);
  });

  it("keeps the sector pills and their photos", async () => {
    const hero = await block(pool, "hero");
    const seeded = HOME_SEED.find((b) => b.type === "hero")!.content as Content;
    expect(hero.sectorPills).toEqual(seeded.sectorPills);
  });

  it("puts the trial balance in the departments block, keeping an admin-written alt", async () => {
    const d = await block(pool, "departments");
    expect(d.image).toBe(trialBalance.image);
    expect(d.imageAlt).toEqual({ en: "Our team at work", ar: trialBalance.alt.ar });
  });

  it("is recorded once", async () => {
    expect((await pool.query(`SELECT 1 FROM data_fixes WHERE key = $1`, [HOME_SCREENS_FIX_KEY])).rowCount).toBe(1);
  });
});

describe.skipIf(!canUseDb)("home screens fix when an admin changed the hero image", () => {
  const schema = "t_home_screens_admin";
  let pool: Pool;

  beforeAll(async () => {
    pool = await setup(schema, (blocks) => {
      blocks.find((b) => b.type === "hero")!.content.card!.image = "/api/uploads/admin-hero.jpg";
    });
  }, 60_000);

  afterAll(async () => {
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.end();
  });

  it("leaves the admin's image and its alt text alone", async () => {
    const hero = await block(pool, "hero");
    expect(hero.card!.image).toBe("/api/uploads/admin-hero.jpg");
    expect(hero.card!.alt).toEqual(dashboard.old.alt);
  });

  it("still moves the untouched departments photo", async () => {
    expect((await block(pool, "departments")).image).toBe(trialBalance.image);
  });
});

describe.skipIf(!canUseDb)("home screens on a fresh database", () => {
  const schema = "t_home_screens_fresh";
  let pool: Pool;

  beforeAll(async () => {
    pool = scratchPool(schema);
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.query(`CREATE SCHEMA ${schema}`);
    await ensureReady(pool);
  }, 60_000);

  afterAll(async () => {
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.end();
  });

  it("seeds the home page with the real screens", async () => {
    expect((await block(pool, "hero")).card!.image).toBe(dashboard.image);
    expect((await block(pool, "departments")).image).toBe(trialBalance.image);
  });
});
