/**
 * Task 12: admin Pages API (GET/PUT /api/admin/pages[/page]), page SEO API and
 * the v2 settings checks, called as route handlers.
 *
 * The session is mocked (`requireAuth`), and the app pool is swapped for a
 * scratch-schema pool on the local `_test` database, so the e2e `public`
 * schema is never touched. Runs only under `npm run test:db`.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { Pool, type PoolConfig } from "pg";

const h = vi.hoisted(() => ({
  authenticated: true,
  pool: null as unknown as import("pg").Pool,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: async () => (h.authenticated ? { authenticated: true, username: "tester" } : { authenticated: false }),
}));
vi.mock("@/lib/db/pool", () => ({
  getPool: async () => h.pool,
  query: (text: string, params?: unknown[]) => h.pool.query(text, params as never[]),
}));
vi.mock("@/lib/db/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/config")>()),
  isInstalledSync: () => true,
  isInstalled: async () => true,
}));

import { ensureReady } from "@/lib/db/migrate";
import { getPageBlocks } from "@/lib/blocks/store";
import { pickBi } from "@/lib/blocks/bi";
import type { Block } from "@/lib/blocks/types";
import * as pagesRoute from "@/app/api/admin/pages/route";
import * as pageRoute from "@/app/api/admin/pages/[page]/route";
import * as seoRoute from "@/app/api/admin/page-seo/route";
import * as settingsRoute from "@/app/api/admin/settings/route";

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

function req(url: string, method = "GET", body?: unknown): NextRequest {
  return new NextRequest(`http://localhost${url}`, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

const ctx = (page: string) => ({ params: Promise.resolve({ page }) });

async function getBlocks(page: string): Promise<Block[]> {
  const res = await pageRoute.GET(req(`/api/admin/pages/${encodeURIComponent(page)}`), ctx(page));
  expect(res.status).toBe(200);
  return (await res.json()).data as Block[];
}

async function putBlocks(page: string, blocks: unknown) {
  const res = await pageRoute.PUT(req(`/api/admin/pages/${encodeURIComponent(page)}`, "PUT", { blocks }), ctx(page));
  return { status: res.status, body: await res.json() };
}

const shape = (blocks: Block[]) => blocks.map((b) => ({ id: b.id, type: b.type, enabled: b.enabled, content: b.content }));

describe("admin APIs without a session", () => {
  beforeEach(() => {
    h.authenticated = false;
  });

  it("every admin pages, page SEO and settings handler returns 401", async () => {
    const responses = await Promise.all([
      pagesRoute.GET(),
      pageRoute.GET(req("/api/admin/pages/home"), ctx("home")),
      pageRoute.PUT(req("/api/admin/pages/home", "PUT", { blocks: [] }), ctx("home")),
      seoRoute.GET(req("/api/admin/page-seo?page=home")),
      seoRoute.PUT(req("/api/admin/page-seo", "PUT", { page: "home" })),
      settingsRoute.GET(),
      settingsRoute.PUT(req("/api/admin/settings", "PUT", {})),
    ]);
    for (const r of responses) expect(r.status).toBe(401);
  });
});

describe.skipIf(!canUseDb)("admin pages API", () => {
  const schema = "t12_admin_pages";

  beforeAll(async () => {
    h.pool = scratchPool(schema);
    await h.pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await h.pool.query(`CREATE SCHEMA ${schema}`);
    await ensureReady(h.pool);
  }, 60_000);

  afterAll(async () => {
    await h.pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await h.pool.end();
  });

  beforeEach(() => {
    h.authenticated = true;
  });

  it("lists every seeded page with its block count", async () => {
    const res = await pagesRoute.GET();
    expect(res.status).toBe(200);
    const list = (await res.json()).data as { page: string; count: number }[];
    const home = list.find((p) => p.page === "home");
    expect(home?.count).toBeGreaterThan(0);
    expect(list.some((p) => p.page === "sector:real-estate")).toBe(true);
  });

  it("returns the page's blocks in order (URL-encoded key too)", async () => {
    const blocks = await getBlocks("sector:real-estate");
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.map((b) => b.sortOrder)).toEqual(blocks.map((_, i) => i));
    const res = await pageRoute.GET(req("/api/admin/pages/sector%3Areal-estate"), ctx("sector%3Areal-estate"));
    expect((await res.json()).data).toEqual(blocks);
  });

  it("rejects one invalid block with 400 and the Zod path, and writes nothing", async () => {
    const before = await getBlocks("home");
    const heroAt = before.findIndex((b) => b.type === "hero");
    const broken = structuredClone(before);
    (broken[heroAt].content as { title: unknown }).title = { en: "", ar: "" };

    const { status, body } = await putBlocks("home", broken);
    expect(status).toBe(400);
    expect(body.error).toMatch(new RegExp(`^blocks\\.${heroAt}\\.content\\.title: `));

    expect(shape(await getBlocks("home"))).toEqual(shape(before));
  });

  it("rejects a malformed body and an unknown block type with 400", async () => {
    const before = await getBlocks("home");
    const bad = await pageRoute.PUT(req("/api/admin/pages/home", "PUT", "{not json"), ctx("home"));
    expect(bad.status).toBe(400);
    const noList = await putBlocks("home", "nope");
    expect(noList.status).toBe(400);
    const unknown = await putBlocks("home", [...before, { id: "", type: "carousel", enabled: true, content: {} }]);
    expect(unknown.status).toBe(400);
    expect(unknown.body.error).toMatch(new RegExp(`^blocks\\.${before.length}\\.type: `));
    expect(shape(await getBlocks("home"))).toEqual(shape(before));
  });

  it("round-trips a blank Arabic field and the public page falls back to English", async () => {
    const before = await getBlocks("home");
    const heroAt = before.findIndex((b) => b.type === "hero");
    const next = structuredClone(before);
    const hero = next[heroAt].content as { title: { en: string; ar: string } };
    hero.title = { en: "Admin edited headline", ar: "" };

    const { status, body } = await putBlocks("home", next);
    expect(status).toBe(200);
    const saved = body.data as Block[];
    expect((saved[heroAt].content as typeof hero).title).toEqual({ en: "Admin edited headline", ar: "" });

    const after = await getBlocks("home");
    expect((after[heroAt].content as typeof hero).title).toEqual({ en: "Admin edited headline", ar: "" });

    const publicHero = (await getPageBlocks("home", h.pool)).find((b) => b.type === "hero");
    const title = (publicHero?.content as typeof hero).title;
    expect(pickBi(title, "ar")).toBe("Admin edited headline");
    expect(pickBi(title, "en")).toBe("Admin edited headline");
  });

  it("persists a reorder of two blocks as the new sort_order, keeping ids", async () => {
    const before = await getBlocks("about");
    expect(before.length).toBeGreaterThanOrEqual(2);
    const swapped = [before[1], before[0], ...before.slice(2)];
    const { status } = await putBlocks("about", swapped);
    expect(status).toBe(200);

    const rows = await h.pool.query<{ id: string; sort_order: number }>(
      `SELECT id, sort_order FROM page_blocks WHERE page = 'about' ORDER BY sort_order`,
    );
    expect(rows.rows.map((r) => r.id)).toEqual(swapped.map((b) => b.id));
    expect(rows.rows.map((r) => r.sort_order)).toEqual(swapped.map((_, i) => i));
  });

  it("saves the enabled flag", async () => {
    const before = await getBlocks("about");
    const next = before.map((b, i) => ({ ...b, enabled: i === 0 ? !b.enabled : b.enabled }));
    expect((await putBlocks("about", next)).status).toBe(200);
    expect((await getBlocks("about"))[0].enabled).toBe(!before[0].enabled);
    expect((await putBlocks("about", before)).status).toBe(200);
  });

  it("gives a block copied from another page a new id instead of failing", async () => {
    const faq = await getBlocks("faq");
    const contact = await getBlocks("contact");
    const copied = { ...faq[0], page: "contact" };
    const { status, body } = await putBlocks("contact", [...contact, copied]);
    expect(status).toBe(200);
    const saved = body.data as Block[];
    expect(saved).toHaveLength(contact.length + 1);
    expect(saved.at(-1)?.id).not.toBe(faq[0].id);
    expect(saved.slice(0, contact.length).map((b) => b.id)).toEqual(contact.map((b) => b.id));
    // The source page is untouched.
    expect(shape(await getBlocks("faq"))).toEqual(shape(faq));
  });

  it("rejects an invalid page key", async () => {
    const { status } = await putBlocks("Bad Key!", []);
    expect(status).toBe(400);
  });

  it("reads and writes page SEO, rejecting an unsafe image", async () => {
    const empty = await seoRoute.GET(req("/api/admin/page-seo?page=sectors"));
    expect(empty.status).toBe(200);
    expect((await empty.json()).data).toEqual({
      page: "sectors",
      title: { en: "", ar: "" },
      description: { en: "", ar: "" },
      ogImage: "",
    });

    const row = {
      page: "sectors",
      title: { en: "Sectors we serve", ar: "القطاعات" },
      description: { en: "One ERP set up per sector.", ar: "" },
      ogImage: "/api/uploads/og.png",
    };
    const put = await seoRoute.PUT(req("/api/admin/page-seo", "PUT", row));
    expect(put.status).toBe(200);
    const got = await seoRoute.GET(req("/api/admin/page-seo?page=sectors"));
    expect((await got.json()).data).toEqual(row);

    const bad = await seoRoute.PUT(req("/api/admin/page-seo", "PUT", { ...row, ogImage: "javascript:alert(1)" }));
    expect(bad.status).toBe(400);
    expect((await bad.json()).error).toMatch(/^ogImage: /);
    const missing = await seoRoute.GET(req("/api/admin/page-seo"));
    expect(missing.status).toBe(400);
  });

  it("settings PUT rejects an unsafe demo URL or empty CTA labels and keeps the stored values", async () => {
    const current = (await (await settingsRoute.GET()).json()).data;
    expect(current.primaryCta.demoUrl).toBe("/demo");

    const unsafe = await settingsRoute.PUT(
      req("/api/admin/settings", "PUT", { ...current, primaryCta: { ...current.primaryCta, demoUrl: "javascript:alert(1)" } }),
    );
    expect(unsafe.status).toBe(400);
    expect((await unsafe.json()).error).toMatch(/^primaryCta\.demoUrl: /);

    const blank = await settingsRoute.PUT(
      req("/api/admin/settings", "PUT", { ...current, primaryCta: { ...current.primaryCta, label: { en: "", ar: " " } } }),
    );
    expect(blank.status).toBe(400);

    const after = (await (await settingsRoute.GET()).json()).data;
    expect(after.primaryCta).toEqual(current.primaryCta);

    const good = await settingsRoute.PUT(
      req("/api/admin/settings", "PUT", {
        ...current,
        blogEnabled: false,
        primaryCta: { label: { en: "Book a demo", ar: "" }, demoUrl: "https://calendly.com/falcon/demo" },
      }),
    );
    expect(good.status).toBe(200);
    const saved = (await (await settingsRoute.GET()).json()).data;
    expect(saved.primaryCta).toEqual({ label: { en: "Book a demo", ar: "" }, demoUrl: "https://calendly.com/falcon/demo" });
  });
});
