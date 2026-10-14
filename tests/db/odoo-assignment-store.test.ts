/**
 * The Odoo lead owner (salesperson + sales team) persists through the
 * integrations row. Runs only under `npm run test:db` against a local `_test`
 * database, inside its own scratch schema that is dropped before and after.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";

const SCHEMA = "t_odoo_assignment";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const canUseDb =
  !!process.env.PGDATABASE &&
  process.env.PGDATABASE.endsWith("_test") &&
  LOCAL_HOSTS.has(process.env.PGHOST ?? "");

vi.hoisted(() => {
  process.env.PGOPTIONS = "-c search_path=t_odoo_assignment";
});

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

describe.skipIf(!canUseDb)("odoo lead assignment in the integrations store", () => {
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
  }, 60_000);

  afterAll(async () => {
    await pool?.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await pool?.end();
    const { resetPool } = await import("@/lib/db/pool");
    await resetPool();
    delete process.env.PGOPTIONS;
    vi.restoreAllMocks();
  });

  it("defaults to the previous fixed owner (user 2, team 1) on a fresh database", async () => {
    const ds = await import("@/lib/data-store");
    const ig = await ds.getIntegrations();
    expect(ig.odoo.salespersonId).toBe(2);
    expect(ig.odoo.teamId).toBe(1);
  });

  it("saves and reads back a chosen salesperson and team", async () => {
    const ds = await import("@/lib/data-store");
    const ig = await ds.getIntegrations();
    await ds.updateIntegrations({ ...ig, odoo: { ...ig.odoo, salespersonId: 17, teamId: 5 } });
    const after = await ds.getIntegrations();
    expect(after.odoo.salespersonId).toBe(17);
    expect(after.odoo.teamId).toBe(5);
  });

  it("stores 0 (Odoo default) for cleared or invalid values", async () => {
    const ds = await import("@/lib/data-store");
    const ig = await ds.getIntegrations();
    await ds.updateIntegrations({
      ...ig,
      odoo: { ...ig.odoo, salespersonId: Number.NaN, teamId: -3 },
    });
    const after = await ds.getIntegrations();
    expect(after.odoo.salespersonId).toBe(0);
    expect(after.odoo.teamId).toBe(0);
  });
});
