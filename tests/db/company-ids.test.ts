/**
 * Task 5: company registration and VAT numbers (site_settings.cr_number,
 * site_settings.vat_number) and the v2 footer link fix.
 *
 * Runs only under `npm run test:db` against a local `_test` database, inside
 * scratch schemas that are dropped before and after (the e2e `public` schema
 * is never touched).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool, type PoolConfig } from "pg";
import { ensureReady } from "@/lib/db/migrate";
import * as dbStore from "@/lib/db/store";

const CR = "7049432656";
const VAT = "311410985900003";

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

describe.skipIf(!canUseDb)("company ids on a fresh database", () => {
  const schema = "t5_fresh";
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

  it("seeds the unified national number and VAT number once", async () => {
    const r = await pool.query(`SELECT cr_number, vat_number FROM site_settings WHERE id = 1`);
    expect(r.rows[0]).toEqual({ cr_number: CR, vat_number: VAT });
    const fixes = await pool.query(`SELECT key FROM data_fixes WHERE key = 'v2-company-ids'`);
    expect(fixes.rowCount).toBe(1);
  });

  it("reads them into the settings", async () => {
    const s = await dbStore.readSettings(pool);
    expect(s.company.crNumber).toBe(CR);
    expect(s.company.vatNumber).toBe(VAT);
  });

  it("keeps the stored numbers when an older admin client saves without them", async () => {
    const s = await dbStore.readSettings(pool);
    const { crNumber: _cr, vatNumber: _vat, ...company } = s.company;
    void _cr;
    void _vat;
    await dbStore.writeSettings(pool, { ...s, company });
    const after = await dbStore.readSettings(pool);
    expect(after.company.crNumber).toBe(CR);
    expect(after.company.vatNumber).toBe(VAT);
  });

  it("saves new numbers when the payload carries them", async () => {
    const s = await dbStore.readSettings(pool);
    await dbStore.writeSettings(pool, { ...s, company: { ...s.company, crNumber: "111", vatNumber: "222" } });
    const after = await dbStore.readSettings(pool);
    expect(after.company.crNumber).toBe("111");
    expect(after.company.vatNumber).toBe("222");
    // Restore for the other tests in this suite.
    await dbStore.writeSettings(pool, { ...s, company: { ...s.company, crNumber: CR, vatNumber: VAT } });
  });

  it("links the footer privacy entry to the website policy", async () => {
    const links = await dbStore.readFooterLinks(pool);
    const privacy = links.find((l) => l.id === "privacy");
    expect(privacy?.url).toBe("/privacy-policy");
  });
});

describe.skipIf(!canUseDb)("company ids on an existing production-like database", () => {
  const schema = "t5_legacy";
  let pool: Pool;

  beforeAll(async () => {
    pool = scratchPool(schema);
    await resetSchema(pool, schema);
    // site_settings and footer_links as they exist in production today (no v2 columns).
    await pool.query(`
      CREATE TABLE site_settings (
        id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        company_name_en text NOT NULL DEFAULT '', company_name_ar text NOT NULL DEFAULT '',
        company_email text NOT NULL DEFAULT '', phone_ksa text NOT NULL DEFAULT '',
        phone_egypt text NOT NULL DEFAULT '', whatsapp text NOT NULL DEFAULT '',
        gulf_only boolean NOT NULL DEFAULT false, notif_email_on_new_lead boolean NOT NULL DEFAULT true,
        notif_sales_email text NOT NULL DEFAULT '', social_linkedin text NOT NULL DEFAULT '',
        social_twitter text NOT NULL DEFAULT '', social_facebook text NOT NULL DEFAULT '',
        social_instagram text NOT NULL DEFAULT '', social_youtube text NOT NULL DEFAULT '',
        social_tiktok text NOT NULL DEFAULT '', login_url text NOT NULL DEFAULT 'https://falcon-valley.com',
        jwt_secret text NOT NULL DEFAULT '', rate_limit_max int NOT NULL DEFAULT 10,
        rate_limit_window_ms int NOT NULL DEFAULT 60000
      );
      INSERT INTO site_settings (id, company_name_en, phone_ksa, whatsapp)
        VALUES (1, 'Falcon Smart Solutions', '00966568406006', '966568406006');
      CREATE TABLE footer_links (
        id text PRIMARY KEY, section text NOT NULL DEFAULT 'about',
        label_en text NOT NULL DEFAULT '', label_ar text NOT NULL DEFAULT '',
        url text NOT NULL DEFAULT '', sort_order int NOT NULL DEFAULT 0
      );
      INSERT INTO footer_links (id, section, label_en, label_ar, url, sort_order) VALUES
        ('about', 'about', 'About Us', 'من نحن', '/about', 0),
        ('privacy', 'legal', 'Privacy Policy', 'سياسة الخصوصية', '/privacy', 1),
        ('terms', 'legal', 'Our terms', 'الشروط', '/terms', 2);
    `);
    await ensureReady(pool);
    await ensureReady(pool);
  }, 60_000);

  afterAll(async () => {
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.end();
  });

  it("adds the columns and fills them without touching the rest of the row", async () => {
    const r = await pool.query(`SELECT cr_number, vat_number, company_name_en, whatsapp FROM site_settings`);
    expect(r.rows).toEqual([
      { cr_number: CR, vat_number: VAT, company_name_en: "Falcon Smart Solutions", whatsapp: "966568406006" },
    ]);
  });

  it("moves the untouched default footer links to sentence case and the website privacy policy", async () => {
    const r = await pool.query(`SELECT id, label_en, url FROM footer_links ORDER BY sort_order`);
    expect(r.rows).toEqual([
      { id: "about", label_en: "About us", url: "/about" },
      { id: "privacy", label_en: "Privacy policy", url: "/privacy-policy" },
      // Edited by an admin: left alone.
      { id: "terms", label_en: "Our terms", url: "/terms" },
    ]);
  });
});

describe.skipIf(!canUseDb)("company ids entered by an admin before the fix ran", () => {
  const schema = "t5_admin";
  let pool: Pool;

  beforeAll(async () => {
    pool = scratchPool(schema);
    await resetSchema(pool, schema);
    await ensureReady(pool);
    await pool.query(`UPDATE site_settings SET cr_number = 'ADMIN-CR', vat_number = '' WHERE id = 1`);
    await pool.query(`DELETE FROM data_fixes WHERE key = 'v2-company-ids'`);
    await ensureReady(pool);
  }, 60_000);

  afterAll(async () => {
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.end();
  });

  it("never overwrites a value an admin entered; fills only blanks", async () => {
    const r = await pool.query(`SELECT cr_number, vat_number FROM site_settings WHERE id = 1`);
    expect(r.rows[0]).toEqual({ cr_number: "ADMIN-CR", vat_number: VAT });
  });
});
