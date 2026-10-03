/**
 * Task 3: page_blocks / page_seo store, v2 seeds and one-off data fixes.
 *
 * The "SEED" and "unreachable DB" suites need no database and always run.
 * The DB suites run only under `npm run test:db` (PG* from .env.test) and only
 * against a local database whose name ends in `_test`. Each suite works inside
 * its own scratch schema (search_path), dropped before and after, so the
 * `public` schema used by the e2e dev server is never touched.
 */
import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool, type PoolConfig } from "pg";
import { ensureReady } from "@/lib/db/migrate";
import * as dbStore from "@/lib/db/store";
import { SEED, SEED_PAGES } from "@/lib/blocks/seed";
import { V2_SECTORS, withV2Sectors } from "@/lib/blocks/seed/sectors";
import { DEFAULT_SECTORS } from "@/lib/db/defaults";
import { parseBlock } from "@/lib/blocks/registry";
import type { Block } from "@/lib/blocks/types";
import {
  getPageBlocks,
  getPageBlocksAdmin,
  savePageBlocks,
  listPages,
  getPageSeo,
  savePageSeo,
} from "@/lib/blocks/store";

const EXPECTED_PAGES = [
  "home",
  "sector:real-estate",
  "sector:manufacturing",
  "sector:trading",
  "sector:hospitality",
  "sector:retail",
  "sector:logistics",
  "sector:professional-services",
  "erp:falcon",
  "erp:odoo",
  "product:server-management",
  "product:data-management",
  "product:applications",
  "about",
  "contact",
  "demo",
  "faq",
  "privacy-policy",
  "terms",
];

const DASHES = /[–—]/;

/** Walk every string inside a value. */
function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => strings(x, out));
  return out;
}

/** Comparable shape of a block list (ids and timestamps ignored). */
function shape(blocks: { type: string; enabled: boolean; content: unknown }[]) {
  return blocks.map((b) => ({ type: b.type, enabled: b.enabled, content: b.content }));
}

describe("SEED", () => {
  it("registers every v2 page key", () => {
    expect([...SEED_PAGES].sort()).toEqual([...EXPECTED_PAGES].sort());
    expect(Object.keys(SEED).sort()).toEqual([...EXPECTED_PAGES].sort());
  });

  it("every SEED entry passes parseBlock", () => {
    for (const [page, blocks] of Object.entries(SEED)) {
      blocks.forEach((b, i) => {
        const r = parseBlock(b.type, b.content);
        expect(r.ok, `${page}[${i}] ${b.type}: ${r.ok ? "" : r.error}`).toBe(true);
        expect(b.page).toBe(page);
        expect(b.sortOrder).toBe(i);
      });
    }
  });

  it("home and sector:real-estate are seeded in both languages", () => {
    for (const page of ["home", "sector:real-estate"]) {
      expect(SEED[page].length).toBeGreaterThan(5);
      for (const b of SEED[page]) {
        // Every Bi with English text also has Arabic text, and vice versa.
        const walk = (v: unknown, at: string) => {
          if (v && typeof v === "object" && !Array.isArray(v)) {
            const o = v as Record<string, unknown>;
            if (typeof o.en === "string" && typeof o.ar === "string" && Object.keys(o).length === 2) {
              expect(o.en.trim() === "", `${page} ${b.type} ${at}: ${o.en}|${o.ar}`).toBe(o.ar.trim() === "");
              return;
            }
            Object.entries(o).forEach(([k, x]) => walk(x, `${at}.${k}`));
          } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${at}.${i}`));
        };
        walk(b.content, "");
      }
    }
  });

  it("has no em or en dash anywhere", () => {
    for (const [page, blocks] of Object.entries(SEED)) {
      for (const s of strings(blocks)) expect(DASHES.test(s), `${page}: ${s}`).toBe(false);
    }
    for (const s of strings(V2_SECTORS)) expect(DASHES.test(s), s).toBe(false);
  });

  it("ships quote blocks disabled and primary CTAs as Book a demo to /demo", () => {
    for (const blocks of Object.values(SEED)) {
      for (const b of blocks) {
        if (b.type === "quote") expect(b.enabled).toBe(false);
        const c = b.content as Record<string, unknown>;
        for (const key of ["primaryCta", "cta"]) {
          const cta = c[key] as { label: { en: string; ar: string }; href: string } | undefined;
          if (!cta) continue;
          expect(cta.label).toEqual({ en: "Book a demo", ar: "احجز عرضًا تجريبيًا" });
          expect(cta.href).toBe("/demo");
        }
      }
    }
  });

  it("only references images that exist under public/images/v2", () => {
    const all = [...strings(SEED), ...strings(V2_SECTORS)].filter((s) => s.startsWith("/images/"));
    expect(all.length).toBeGreaterThan(0);
    for (const src of all) {
      expect(src.startsWith("/images/v2/"), src).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), "public", src)), src).toBe(true);
    }
  });

  it("lights the real-estate lifecycle stages per role", () => {
    const lc = SEED["sector:real-estate"].find((b) => b.type === "lifecycle");
    expect(lc).toBeDefined();
    const stages = (lc!.content as { stages: { roles: string[] }[] }).stages;
    expect(stages.map((s) => s.roles)).toEqual([
      ["dev"],
      ["dev", "con"],
      ["dev", "con"],
      ["dev", "bro"],
      ["dev", "bro"],
      ["dev", "con", "bro"],
    ]);
  });

  it("defines the seven v2 sectors with the existing slugs", () => {
    expect(V2_SECTORS.map((s) => s.slug)).toEqual([
      "real-estate",
      "manufacturing",
      "trading",
      "hospitality",
      "retail",
      "logistics",
      "professional-services",
    ]);
    expect(V2_SECTORS[0].name.en).toBe("Real estate and construction");
    for (const s of V2_SECTORS) {
      expect(s.name.ar.trim()).not.toBe("");
      expect(s.promise.en.trim()).not.toBe("");
      expect(s.promise.ar.trim()).not.toBe("");
      expect(s.photo.startsWith("/images/v2/photo-")).toBe(true);
    }
  });
});

describe("sector fallback (DB down or not installed)", () => {
  it("matches the data fix: seven v2 sectors enabled in order, the rest disabled", () => {
    const list = withV2Sectors(DEFAULT_SECTORS);
    expect(list.filter((s) => s.enabled).map((s) => s.id)).toEqual(V2_SECTORS.map((s) => s.slug));
    expect(list.filter((s) => !s.enabled).map((s) => s.id)).toContain("construction");
    const re = list.find((s) => s.id === "real-estate")!;
    expect(re.name).toEqual(V2_SECTORS[0].name);
    expect(re.photo).toBe(V2_SECTORS[0].photo);
    expect(withV2Sectors([]).map((s) => s.id)).toEqual(V2_SECTORS.map((s) => s.slug));
  });
});

describe("getPageBlocks with the database unreachable", () => {
  it("returns SEED.home (enabled only) and never throws", async () => {
    const dead = new Pool({
      host: "127.0.0.1",
      port: 1,
      database: "nope",
      user: "nope",
      password: "nope",
      connectionTimeoutMillis: 3000,
    });
    try {
      const blocks = await getPageBlocks("home", dead);
      const expected = SEED.home.filter((b) => b.enabled);
      expect(expected.length).toBeGreaterThan(0);
      expect(shape(blocks)).toEqual(shape(expected));
      expect(blocks.every((b) => b.enabled)).toBe(true);
      expect(blocks.some((b) => b.type === "quote")).toBe(false);
      expect(await getPageBlocks("no-such-page", dead)).toEqual([]);
      expect(await getPageSeo("home", dead)).toBeNull();
    } finally {
      await dead.end().catch(() => {});
    }
  }, 30_000);
});

// ── Database suites ─────────────────────────────────────────────────

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const canUseDb =
  !!process.env.PGDATABASE &&
  process.env.PGDATABASE.endsWith("_test") &&
  LOCAL_HOSTS.has(process.env.PGHOST ?? "");

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

async function resetSchema(pool: Pool, schema: string) {
  await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await pool.query(`CREATE SCHEMA ${schema}`);
}

async function count(pool: Pool, sql: string, params: unknown[] = []): Promise<number> {
  const r = await pool.query(sql, params as never[]);
  return Number(r.rows[0].n);
}

describe.skipIf(!canUseDb)("page blocks on a fresh database", () => {
  const schema = "t3a_fresh";
  let pool: Pool;

  beforeAll(async () => {
    pool = scratchPool(schema);
    await resetSchema(pool, schema);
    await ensureReady(pool);
    await ensureReady(pool);
  }, 60_000);

  afterAll(async () => {
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.end();
  });

  it("ensureReady twice leaves exactly one set of seed rows per page", async () => {
    for (const page of SEED_PAGES) {
      const n = await count(pool, `SELECT count(*) AS n FROM page_blocks WHERE page = $1`, [page]);
      expect(n, page).toBe(SEED[page].length);
    }
    const stored = await getPageBlocksAdmin("home", pool);
    expect(shape(stored)).toEqual(shape(SEED.home));
  });

  it("getPageBlocks returns enabled blocks only, in order", async () => {
    const blocks = await getPageBlocks("home", pool);
    expect(shape(blocks)).toEqual(shape(SEED.home.filter((b) => b.enabled)));
    expect(blocks.map((b) => b.sortOrder)).toEqual([...blocks.map((b) => b.sortOrder)].sort((a, b) => a - b));
    for (const b of blocks) {
      expect(b.page).toBe("home");
      expect(b.id).toMatch(/^[0-9a-f-]{36}$/);
    }
  });

  it("a page edited via savePageBlocks is not reseeded", async () => {
    const before = await getPageBlocksAdmin("home", pool);
    const edited = structuredClone(before).slice(0, 3) as Block[];
    const hero = edited[0];
    if (hero.type !== "hero") throw new Error("expected hero first");
    hero.content.title = { en: "Edited by admin", ar: "عدّلها المشرف" };
    edited.reverse();
    await savePageBlocks("home", edited, pool);

    await ensureReady(pool);

    const after = await getPageBlocksAdmin("home", pool);
    expect(after).toHaveLength(3);
    expect(after.map((b) => b.type)).toEqual(edited.map((b) => b.type));
    expect(after.map((b) => b.sortOrder)).toEqual([0, 1, 2]);
    const savedHero = after.find((b) => b.type === "hero");
    expect(savedHero?.type === "hero" && savedHero.content.title.en).toBe("Edited by admin");
  });

  it("a page cleared by the admin stays empty after another ensureReady", async () => {
    await savePageBlocks("sector:real-estate", [], pool);
    await ensureReady(pool);
    expect(await getPageBlocksAdmin("sector:real-estate", pool)).toEqual([]);
  });

  it("savePageBlocks with one invalid block throws and leaves the previous rows intact", async () => {
    const before = await getPageBlocksAdmin("home", pool);
    const bad = structuredClone(before) as Block[];
    const target = bad.find((b) => b.type === "hero");
    if (!target || target.type !== "hero") throw new Error("expected hero");
    target.content.title = { en: "", ar: "" };
    await expect(savePageBlocks("home", bad, pool)).rejects.toThrow(/blocks\.\d+\.content\.title/);

    const unknown = [...structuredClone(before), { ...before[0], type: "nope" }] as unknown as Block[];
    await expect(savePageBlocks("home", unknown, pool)).rejects.toThrow(/blocks\.\d+\.type/);

    expect(await getPageBlocksAdmin("home", pool)).toEqual(before);
  });

  it("listPages reports every seed page with its row count", async () => {
    const pages = await listPages(pool);
    const byPage = new Map(pages.map((p) => [p.page, p.count]));
    for (const page of SEED_PAGES) expect(byPage.has(page), page).toBe(true);
    expect(byPage.get("home")).toBe(3);
    expect(byPage.get("sector:real-estate")).toBe(0);
  });

  it("page_seo round-trips and is null when missing", async () => {
    expect(await getPageSeo("about", pool)).toBeNull();
    await savePageSeo(
      {
        page: "about",
        title: { en: "About Falcon", ar: "عن فالكون" },
        description: { en: "Who we are", ar: "من نحن" },
        ogImage: "/images/v2/photo-hero-office.jpg",
      },
      pool,
    );
    expect(await getPageSeo("about", pool)).toEqual({
      page: "about",
      title: { en: "About Falcon", ar: "عن فالكون" },
      description: { en: "Who we are", ar: "من نحن" },
      ogImage: "/images/v2/photo-hero-office.jpg",
    });
  });

  it("adds the new site_settings columns with their defaults", async () => {
    const r = await pool.query(`SELECT blog_enabled, cta_label_en, cta_label_ar, demo_url FROM site_settings WHERE id = 1`);
    expect(r.rows[0]).toEqual({
      blog_enabled: false,
      cta_label_en: "Book a demo",
      cta_label_ar: "احجز عرضًا تجريبيًا",
      demo_url: "/demo",
    });
    const s = await dbStore.readSettings(pool);
    expect(s.blogEnabled).toBe(false);
    expect(s.primaryCta).toEqual({ label: { en: "Book a demo", ar: "احجز عرضًا تجريبيًا" }, demoUrl: "/demo" });
  });

  it("fresh install: v2 sectors enabled, others disabled, demo testimonials and applications brochure disabled", async () => {
    const enabled = await pool.query(`SELECT id FROM sectors WHERE enabled ORDER BY sort_order`);
    expect(enabled.rows.map((r) => r.id)).toEqual(V2_SECTORS.map((s) => s.slug));
    expect(await count(pool, `SELECT count(*) AS n FROM testimonials WHERE enabled`)).toBe(0);
    const br = await pool.query(`SELECT enabled FROM product_brochures WHERE slug = 'applications'`);
    expect(br.rows[0].enabled).toBe(false);
  });
});

describe.skipIf(!canUseDb)("v2 data fixes on an existing production-like database", () => {
  const schema = "t3a_legacy";
  let pool: Pool;

  beforeAll(async () => {
    pool = scratchPool(schema);
    await resetSchema(pool, schema);
    // Tables as they exist in production today (eb827f8), without the v2 columns.
    await pool.query(`
      CREATE TABLE sectors (
        id text PRIMARY KEY, icon text NOT NULL DEFAULT '', gradient text NOT NULL DEFAULT '',
        name_en text NOT NULL DEFAULT '', name_ar text NOT NULL DEFAULT '',
        title_en text NOT NULL DEFAULT '', title_ar text NOT NULL DEFAULT '',
        description_en text NOT NULL DEFAULT '', description_ar text NOT NULL DEFAULT '',
        systems text[] NOT NULL DEFAULT '{}', video_url text NOT NULL DEFAULT '',
        featured boolean NOT NULL DEFAULT false, enabled boolean NOT NULL DEFAULT true,
        sort_order int NOT NULL DEFAULT 0
      );
      INSERT INTO sectors (id, name_en, name_ar, title_en, description_en, enabled, sort_order) VALUES
        ('RetailBasic', 'Retail Basic', 'تجزئة', 'Retail Basic', 'old landing copy', true, 0),
        ('construction', 'Construction', 'المقاولات', 'Construction', 'old', true, 1),
        ('real-estate', 'Real Estate', 'العقارات', 'Real Estate title', 'kept description', true, 2),
        ('healthcare', 'Healthcare', 'الرعاية الصحية', 'Healthcare', '', true, 3),
        ('Retail', 'Retail duplicate', 'تجزئة', 'Retail', '', true, 4);
      CREATE TABLE product_brochures (
        slug text PRIMARY KEY, title_en text NOT NULL DEFAULT '', title_ar text NOT NULL DEFAULT '',
        content_en text NOT NULL DEFAULT '', content_ar text NOT NULL DEFAULT '',
        enabled boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now()
      );
      INSERT INTO product_brochures (slug, title_en, content_en, enabled) VALUES
        ('applications', 'Custom Applications', '<p>old</p>', true),
        ('server-management', 'Servers', '<p>kept</p>', true);
      CREATE TABLE testimonials (
        id text PRIMARY KEY, name text NOT NULL DEFAULT '', role text NOT NULL DEFAULT '',
        company text NOT NULL DEFAULT '', quote_en text NOT NULL DEFAULT '', quote_ar text NOT NULL DEFAULT '',
        image text NOT NULL DEFAULT '', sort_order int NOT NULL DEFAULT 0
      );
      INSERT INTO testimonials (id, name, role, company, quote_en, sort_order) VALUES
        ('ts-1', 'Ahmed Al-Rashid', 'CFO', 'Saudi Emar Developments', 'demo quote', 0),
        ('legacy-9', 'Khaled Al-Omari', 'CEO', 'Almada Construction', 'demo quote, other id', 1),
        ('real-1', 'Real Person', 'Owner', 'Real Client Co', 'a real, approved quote', 2);
      -- Production already has its content row, so ensureReady does not rewrite content.
      CREATE TABLE hero_content (
        id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        title_en text NOT NULL DEFAULT '', title_ar text NOT NULL DEFAULT '',
        subtitle_en text NOT NULL DEFAULT '', subtitle_ar text NOT NULL DEFAULT '',
        cta1_en text NOT NULL DEFAULT '', cta1_ar text NOT NULL DEFAULT '',
        cta2_en text NOT NULL DEFAULT '', cta2_ar text NOT NULL DEFAULT ''
      );
      INSERT INTO hero_content (id, title_en) VALUES (1, 'Live hero');
    `);
    await ensureReady(pool);
    await ensureReady(pool);
  }, 60_000);

  afterAll(async () => {
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.end();
  });

  it("migrations run twice without error and record each fix once", async () => {
    const r = await pool.query(`SELECT key FROM data_fixes ORDER BY key`);
    const keys = r.rows.map((x) => x.key);
    for (const k of ["v2-disable-applications-brochure", "v2-disable-demo-testimonials", "v2-sector-slugs"]) {
      expect(keys.filter((x) => x === k)).toHaveLength(1);
    }
  });

  it("disables RetailBasic, construction and every other old sector without deleting rows", async () => {
    const rows = (await pool.query(`SELECT id, enabled FROM sectors`)).rows as { id: string; enabled: boolean }[];
    const byId = new Map(rows.map((r) => [r.id, r.enabled]));
    expect(byId.get("RetailBasic")).toBe(false);
    expect(byId.get("construction")).toBe(false);
    expect(byId.get("healthcare")).toBe(false);
    expect(byId.get("Retail")).toBe(false);
    // 5 legacy rows kept + 6 v2 slugs that did not exist yet.
    expect(rows).toHaveLength(11);
    for (const s of V2_SECTORS) expect(byId.get(s.slug), s.slug).toBe(true);
  });

  it("upserts the seven v2 sectors with names, photos and promises", async () => {
    const r = await pool.query(
      `SELECT id, name_en, name_ar, photo, short_promise_en, short_promise_ar, description_en, sort_order
       FROM sectors WHERE enabled ORDER BY sort_order`,
    );
    expect(r.rows.map((x) => x.id)).toEqual(V2_SECTORS.map((s) => s.slug));
    r.rows.forEach((row, i) => {
      const s = V2_SECTORS[i];
      expect(row.name_en).toBe(s.name.en);
      expect(row.name_ar).toBe(s.name.ar);
      expect(row.photo).toBe(s.photo);
      expect(row.short_promise_en).toBe(s.promise.en);
      expect(row.short_promise_ar).toBe(s.promise.ar);
    });
    const re = r.rows.find((x) => x.id === "real-estate");
    expect(re.description_en).toBe("kept description");
  });

  it("disables the applications brochure only", async () => {
    const r = await pool.query(`SELECT slug, enabled FROM product_brochures ORDER BY slug`);
    const byId = new Map(r.rows.map((x) => [x.slug, x.enabled]));
    expect(byId.get("applications")).toBe(false);
    expect(byId.get("server-management")).toBe(true);
  });

  it("disables the demo testimonials and keeps real ones", async () => {
    const r = await pool.query(`SELECT id, enabled FROM testimonials ORDER BY id`);
    const byId = new Map(r.rows.map((x) => [x.id, x.enabled]));
    expect(byId.get("ts-1")).toBe(false);
    expect(byId.get("legacy-9")).toBe(false);
    expect(byId.get("real-1")).toBe(true);
    expect(r.rows).toHaveLength(3);
  });

  it("does not re-run a fix after the admin changes the data", async () => {
    await pool.query(`UPDATE sectors SET enabled = true WHERE id = 'healthcare'`);
    await pool.query(`UPDATE product_brochures SET enabled = true WHERE slug = 'applications'`);
    await pool.query(`UPDATE sectors SET name_en = 'Admin renamed' WHERE id = 'trading'`);
    await ensureReady(pool);
    const hc = await pool.query(`SELECT enabled FROM sectors WHERE id = 'healthcare'`);
    expect(hc.rows[0].enabled).toBe(true);
    const ap = await pool.query(`SELECT enabled FROM product_brochures WHERE slug = 'applications'`);
    expect(ap.rows[0].enabled).toBe(true);
    const tr = await pool.query(`SELECT name_en FROM sectors WHERE id = 'trading'`);
    expect(tr.rows[0].name_en).toBe("Admin renamed");
  });

  it("seeds page blocks on first boot", async () => {
    expect(await count(pool, `SELECT count(*) AS n FROM page_blocks WHERE page = 'home'`)).toBe(SEED.home.length);
  });

  it("admin sector saves keep photo and promise when the payload omits them", async () => {
    const sectors = await dbStore.readSectors(pool);
    const re = sectors.find((s) => s.id === "real-estate")!;
    expect(re.photo).toBe("/images/v2/photo-realestate.jpg");
    expect(re.shortPromise?.en).toBe(V2_SECTORS[0].promise.en);
    // An older admin client that does not know the new fields.
    const legacyPayload = sectors.map((s) => {
      const { photo: _p, shortPromise: _s, ...rest } = s;
      void _p;
      void _s;
      return rest;
    });
    await dbStore.writeSectors(pool, legacyPayload);
    const after = (await dbStore.readSectors(pool)).find((s) => s.id === "real-estate")!;
    expect(after.photo).toBe("/images/v2/photo-realestate.jpg");
    expect(after.shortPromise).toEqual(V2_SECTORS[0].promise);
  });

  it("admin content saves keep a disabled testimonial disabled", async () => {
    const content = await dbStore.readContent(pool);
    const payload = {
      ...content,
      testimonials: content.testimonials.map((t) => {
        const { enabled: _e, ...rest } = t;
        void _e;
        return rest;
      }),
    };
    await dbStore.writeContent(pool, payload);
    const r = await pool.query(`SELECT id, enabled FROM testimonials ORDER BY id`);
    const byId = new Map(r.rows.map((x) => [x.id, x.enabled]));
    expect(byId.get("ts-1")).toBe(false);
    expect(byId.get("real-1")).toBe(true);
  });
});
