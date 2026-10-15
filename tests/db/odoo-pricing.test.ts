/**
 * The daily Odoo price refresh, end to end against the database: a page Odoo
 * served to Egypt updates Settings > Egypt; a page for another country leaves
 * the price alone and records why. odoo.com and the proxy are faked (undici is
 * mocked); runs only under `npm run test:db` in a scratch schema.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";

const SCHEMA = "t_odoo_pricing";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const canUseDb =
  !!process.env.PGDATABASE && process.env.PGDATABASE.endsWith("_test") && LOCAL_HOSTS.has(process.env.PGHOST ?? "");

vi.hoisted(() => {
  process.env.PGOPTIONS = "-c search_path=t_odoo_pricing";
});

const page = vi.hoisted(() => ({ html: "", proxies: [] as string[] }));
vi.mock("undici", () => ({
  ProxyAgent: class {
    constructor(url: string) {
      page.proxies.push(url);
    }
    close() {
      return Promise.resolve();
    }
  },
  fetch: async () => ({ ok: true, status: 200, text: async () => page.html }),
}));

vi.mock("@/lib/db/config", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/db/config")>();
  const conn = () => ({
    host: process.env.PGHOST ?? "localhost",
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE ?? "",
    user: process.env.PGUSER ?? "",
    password: process.env.PGPASSWORD ?? "",
    ssl: false,
  });
  return {
    ...orig,
    isInstalledSync: () => true,
    isInstalled: async () => true,
    getConnection: async () => conn(),
    readDbConfig: async () => ({ installed: true, db: conn() }),
  };
});

const fixture = (name: string) => readFileSync(path.join(__dirname, "..", "fixtures", name), "utf8");

describe.skipIf(!canUseDb)("Odoo Egypt price refresh", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      max: 2,
    });
    await pool.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await pool.query(`CREATE SCHEMA ${SCHEMA}`);
    const ds = await import("@/lib/data-store");
    await ds.getIntegrations(); // migrates the fresh schema
    await ds.getSettings();
  }, 60_000);

  afterAll(async () => {
    await pool?.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await pool?.end();
    const { resetPool } = await import("@/lib/db/pool");
    await resetPool();
    delete process.env.PGOPTIONS;
    vi.restoreAllMocks();
  });

  it("does nothing until enabled with a proxy", async () => {
    const { refreshOdooEgyptPrice } = await import("@/lib/odoo-pricing");
    expect(await refreshOdooEgyptPrice(true)).toMatchObject({ ok: false, skipped: true });
  });

  it("stores Odoo's Egypt Standard price and the check time", async () => {
    const { refreshOdooEgyptPrice, savePricingConfig, readPricingStatus } = await import("@/lib/odoo-pricing");
    await savePricingConfig(true, "http://u:p@eg.proxy.test:8000");
    page.html = fixture("odoo-pricing-eg.html");
    expect(await refreshOdooEgyptPrice(true)).toEqual({ ok: true, priceUsd: "8.95", changed: true });
    expect(page.proxies.at(-1)).toBe("http://u:p@eg.proxy.test:8000");
    const usd = (await pool.query(`SELECT egypt_entity->>'odooFromUsd' AS usd FROM site_settings WHERE id = 1`)).rows[0].usd;
    expect(usd).toBe("8.95");
    const s = await readPricingStatus();
    expect(s.lastPriceUsd).toBe("8.95");
    expect(s.lastError).toBe("");
    expect(s.lastSuccessAt).not.toBeNull();
  });

  it("checks at most once a day unless forced", async () => {
    const { refreshOdooEgyptPrice } = await import("@/lib/odoo-pricing");
    expect(await refreshOdooEgyptPrice()).toMatchObject({ ok: false, skipped: true });
  });

  it("keeps the price and records the reason when the proxy is not in Egypt", async () => {
    const { refreshOdooEgyptPrice, readPricingStatus } = await import("@/lib/odoo-pricing");
    page.html = fixture("odoo-pricing-de.html");
    const r = await refreshOdooEgyptPrice(true);
    expect(r.ok).toBe(false);
    const usd = (await pool.query(`SELECT egypt_entity->>'odooFromUsd' AS usd FROM site_settings WHERE id = 1`)).rows[0].usd;
    expect(usd).toBe("8.95");
    expect((await readPricingStatus()).lastError).toMatch(/proxy as DE.*must be in Egypt/);
  });
});
