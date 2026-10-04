/**
 * The `v2-client-logos-2026-10` data fix on a production-shaped `clients`
 * table (the 38 rows production held on 2026-10-04) and stored logo strips.
 *
 * Runs only under `npm run test:db` against a local `_test` database, inside
 * scratch schemas dropped before and after (the e2e `public` schema is never
 * touched).
 */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool, type PoolConfig } from "pg";
import { CLIENT_LOGOS_FIX_KEY, ensureReady } from "@/lib/db/migrate";
import { ensureSchema } from "@/lib/db/schema";
import { CLIENT_LOGOS, clientLogoPath, newClientId } from "@/lib/db/client-logos";
import { logoWallDefaults } from "@/lib/blocks/schemas/logo_wall";

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

async function resetSchema(pool: Pool, schema: string) {
  await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await pool.query(`CREATE SCHEMA ${schema}`);
}

/** Production `clients` on 2026-10-04: sort_order | id | name_en | name_ar | logo. */
const PROD_ROWS: [number, string, string, string, string][] = [
  [0, "847e9898-0d41-4ad2-ab16-cda9db4df169", "امان العاصمة", "فالكون", "/api/uploads/0f3d43f7-fe74-4127-9eed-c8db20cfbe1a.jpg"],
  [1, "demo-1", "Zamil", "الزامل", "/api/uploads/79182ffa-157d-4877-8f43-abd8e596cdaf.webp"],
  [2, "demo-2", "SMS", "تقنيات الجوال", "/api/uploads/5e37f97e-6d9b-4e3c-9d31-9c55a1dcf6fc.svg"],
  [3, "demo-3", "Gulf Logistics", "التميميى", "/api/uploads/d9f16699-8ca1-4cba-a840-f539e96547db.png"],
  [4, "demo-4", "Talwin", "تلوين", "/api/uploads/84d4fa94-d548-4567-bcb4-30546d68fe3b.png"],
  [5, "ad762ba5-8110-4637-aee9-92b74ab77d1f", "Smart Care", "سمارت كير", "/api/uploads/2f522e7d-6742-4b6b-8efb-e6fca2964a45.png"],
  [6, "109925b2-eed6-41f8-8f68-b620c70bc8c8", "EMAR", "شركة اعمار", "/api/uploads/304cd69b-f271-404a-a920-517e2676be75.webp"],
  [7, "4819646c-185c-4438-a67b-6abeea0a159c", "Royal Steel", "رويال ستيل", "/api/uploads/9093bc25-0ff0-4ee1-bea0-98e7e8495a54.jpg"],
  [8, "9904ce0a-f9ad-4964-bb23-93273e82bf14", "Kurdistan Government", "حكومة كوردستان", "/api/uploads/b7a133af-9560-45c2-b89a-46a365dbb2c2.png"],
  [9, "e3e2cb33-7eac-4439-bef3-8883644d15db", "Burechame", "بيور كيم", "/api/uploads/b265f8cd-63ae-458c-9a05-23aca2a55631.jpg"],
  [10, "8c4216d5-03c1-4ec0-86a3-1bff730568a5", "NGD", "نيوجينريشن", "/api/uploads/68aef120-bb15-4aef-b2a6-8486d1f8ec42.png"],
  [11, "c42dbe2d-db75-46f4-8b53-515e08445d7b", "Nama Cheam", "نماكيم", "/api/uploads/06eb5270-6b62-4296-a989-8e5e836766ba.jpg"],
  [12, "94d5a043-b487-4142-8fd7-c69942446b7d", "Naghy Marin", "ناغى مارين", "/api/uploads/e752cdd5-31cf-4967-8215-e227f08bc4a4.svg"],
  [13, "db8c052e-3716-4f03-878d-ee005a107046", "", "مودرن ارك", "/api/uploads/6e64cf62-6026-4fe5-a455-cb278e8d59e1.png"],
  [14, "1e17b143-0b4b-40fe-a0e5-57d21be8befa", "", "ماونتن", "/api/uploads/02f93184-f000-4d50-a199-42d5f9288d04.jpg"],
  [15, "1eaea6e2-f9a8-49cf-b9f2-c9d5d8997681", "", "", "/api/uploads/6bec0a72-6b42-4d15-b21c-1d0f82d34a89.webp"],
  [16, "a0009ea6-ec82-4499-bcf8-034b28e621f1", "", "مهارة", "/api/uploads/9a888dcc-87b7-4449-a616-ebf0ceaa3416.png"],
  [17, "661328d9-9162-4e75-b14a-8019a27427d4", "", "لزوم", "/api/uploads/f72250d6-63cb-44b5-9eaf-3b4e9065ae03.png"],
  [18, "61ec0423-c677-4e7d-a01b-762429d47336", "", "لافيردى", "/api/uploads/51a523a7-b9a7-4700-97fa-1f66c5d8bd8f.png"],
  [19, "8df66a6a-8e5f-4dec-a8be-4741a35be63c", "", "كامكو", "/api/uploads/bc3bc67b-2f1d-413a-82b4-4adec7d82709.webp"],
  [20, "2b86efe2-3674-4036-991d-c5a6ee3eea6d", "", "انسباير", "/api/uploads/932f8705-1b0c-4024-b111-e86d115504e9.jpg"],
  [21, "07733fc1-97e7-400a-a61e-1fd517cc55be", "", "الحداد", "/api/uploads/52e13a95-c654-43f9-8f71-c04c4f5a15be.svg"],
  [22, "95800565-e9d8-4dc3-a382-3e0b01d3bf11", "", "الحبيب للاعاشة", "/api/uploads/f1b0832f-1b61-425b-a0fb-be3f058aeb77.png"],
  [23, "5246f635-c074-49c8-bd58-03085a56d628", "", "الدولية", "/api/uploads/98f7765f-e751-486e-baa6-c3f2b8521fbf.png"],
  [24, "b5e21cc0-5554-48ba-8385-1d783cf84184", "", "جيودسى", "/api/uploads/b65d4b84-69c0-4b1e-a0ac-16c572fe82cb.png"],
  [25, "a996648f-596e-4f5d-a689-ec73b63c310a", "", "فودكس", "/api/uploads/1dfa3c0f-e9de-4f34-9357-1c89e09af0b5.png"],
  [26, "f58a2bf0-df0b-419b-90bd-934c8f8d37f3", "", "ايليت", "/api/uploads/6be207a0-e270-48e8-8885-cfc893ec3772.png"],
  [27, "df7dc044-99d1-461e-949a-0edf66f7c14c", "", "ايكوارت", "/api/uploads/3b7511e4-ec03-4e46-80e0-7034305a468c.png"],
  [28, "78c06b26-411b-4cba-b3f8-8c6489989ddf", "", "", "/api/uploads/a07e11d0-c873-421e-9680-7eaa27ad3aec.png"],
  [29, "2dee0f69-5e78-4af3-89ed-5c15af01581d", "", "دايت فتنس", ""],
  [30, "30023a8d-1be5-408e-a65a-9edd0c0008d6", "", "الديار", "/api/uploads/c02e3996-371a-4318-8f7a-a0e760586ee1.webp"],
  [31, "5a0b5b94-c263-4f05-b61a-3b330e1b88f4", "", "المنزل الماسى", "/api/uploads/0b430241-c0c0-40e7-8216-9925c9208175.jpg"],
  [32, "100f0e21-e86e-479d-8af3-42d8eb9ce9fa", "", "دايموند", ""],
  [33, "841139ca-691e-4126-a667-ae45b84554bf", "", "كابيتال", "/api/uploads/4f57395c-fdd3-4e68-b107-e6e509aeb6a0.png"],
  [34, "efef4980-5d09-40cb-baec-d3cebfdc2d00", "", "بنش مارك", "/api/uploads/bb83c800-014a-4b68-9760-53b41ce13165.png"],
  [35, "26183274-ceae-4b56-bc50-5c3022b35f48", "", "مجموعة المدى", "/api/uploads/e37c8ee1-1284-49fd-88cd-8110c9352aec.png"],
  [36, "42fa3152-d351-4785-9a05-7d02e4fab856", "", "الدور المتكاملة", "/api/uploads/08c61fea-b162-431f-95c6-ff5b20a0c9be.png"],
  [37, "eccbc5b1-f99b-4a85-996f-5a1143366240", "", "الامين للتطوير العقاري", "/api/uploads/35ef5e91-3119-48a7-be5e-23bca35d3956.png"],
];

const OLD_HEADING = { en: "Companies across Saudi Arabia run on ERPs our team implemented", ar: "شركات في السعودية تعمل على أنظمة ERP طبّقها فريقنا" };
const NEW_HEADING = logoWallDefaults().heading;
const ADMIN_LOGO = "/api/uploads/admin-replaced-zamil.png";

type Strip = { page: string; limit: number; heading: { en: string; ar: string } };
/** Stored logo strips as an admin or the seeds left them. */
const STRIPS: Strip[] = [
  { page: "home", limit: 8, heading: OLD_HEADING },
  { page: "about", limit: 8, heading: OLD_HEADING },
  { page: "sector:trading", limit: 12, heading: OLD_HEADING },
  { page: "sector:real-estate", limit: 7, heading: { en: "Developers and contractors running on systems we implemented", ar: "مطوّرون ومقاولون يعملون على أنظمة طبّقها فريقنا" } },
  // Edited by an admin: a limit and an English heading of their own.
  { page: "sector:retail", limit: 20, heading: { en: "Retailers we work with", ar: OLD_HEADING.ar } },
  // Not a strip page: the limit stays, the old heading still moves.
  { page: "clients", limit: 12, heading: OLD_HEADING },
];

async function loadProductionShape(pool: Pool) {
  await ensureSchema(pool);
  for (const [sort, id, en, ar, logo] of PROD_ROWS) {
    await pool.query(`INSERT INTO clients (id, name_en, name_ar, logo, tags, sort_order) VALUES ($1,$2,$3,$4,'{}',$5)`, [id, en, ar, logo, sort]);
  }
  for (const s of STRIPS) {
    await pool.query(`INSERT INTO page_blocks (id, page, type, sort_order, enabled, content) VALUES ($1, $2, 'logo_wall', 1, true, $3::jsonb)`, [
      randomUUID(),
      s.page,
      JSON.stringify({ heading: s.heading, intro: { en: "", ar: "" }, limit: s.limit, link: { label: { en: "", ar: "" }, href: "" } }),
    ]);
  }
}

async function strip(pool: Pool, page: string) {
  const r = await pool.query(`SELECT content FROM page_blocks WHERE page = $1 AND type = 'logo_wall'`, [page]);
  return r.rows[0].content as { limit: number; heading: { en: string; ar: string } };
}

async function client(pool: Pool, id: string) {
  const r = await pool.query(`SELECT id, name_en, name_ar, logo, sort_order FROM clients WHERE id = $1`, [id]);
  return r.rows[0];
}

describe("client logo data", () => {
  it("every cleaned logo file exists and slugs are unique", () => {
    const slugs = CLIENT_LOGOS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(fs.existsSync(path.join(process.cwd(), "public", clientLogoPath(s))), s).toBe(true);
  });

  it("maps every production row that has a logo, with its exact upload", () => {
    const mapped = new Map(CLIENT_LOGOS.filter((c) => c.prod).map((c) => [c.prod!.id, c.prod!.upload]));
    for (const [, id, , , logo] of PROD_ROWS) {
      if (logo) expect(mapped.get(id), id).toBe(logo);
      else expect(mapped.has(id), id).toBe(false);
    }
  });
});

describe.skipIf(!canUseDb)("client logos fix on a production-shaped database", () => {
  const schema = "t_client_logos";
  let pool: Pool;

  beforeAll(async () => {
    pool = scratchPool(schema);
    await resetSchema(pool, schema);
    await loadProductionShape(pool);
    // An admin replaced Zamil's logo before the fix ran.
    await pool.query(`UPDATE clients SET logo = $1 WHERE id = 'demo-1'`, [ADMIN_LOGO]);
    await ensureReady(pool);
    await ensureReady(pool);
  }, 60_000);

  afterAll(async () => {
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.end();
  });

  it("points matched rows at the cleaned logo", async () => {
    for (const c of CLIENT_LOGOS) {
      if (!c.prod || c.prod.id === "demo-1") continue;
      expect((await client(pool, c.prod.id)).logo, c.slug).toBe(clientLogoPath(c.slug));
    }
  });

  it("fills blank names and keeps names an admin wrote", async () => {
    expect(await client(pool, "1eaea6e2-f9a8-49cf-b9f2-c9d5d8997681")).toMatchObject({
      name_en: "Marino Kitchen Equipment",
      name_ar: "مارينو لمعدات المطابخ",
    });
    expect(await client(pool, "db8c052e-3716-4f03-878d-ee005a107046")).toMatchObject({ name_en: "Modern Arch Vision", name_ar: "مودرن ارك" });
    expect(await client(pool, "demo-2")).toMatchObject({ name_en: "SMS", name_ar: "تقنيات الجوال", logo: clientLogoPath("taqnyat") });
    expect(await client(pool, "78c06b26-411b-4cba-b3f8-8c6489989ddf")).toMatchObject({ name_en: "Diet Fitness", name_ar: "دايت فتنس" });
  });

  it("corrects the placeholder names of the Capital Safety row", async () => {
    expect(await client(pool, "847e9898-0d41-4ad2-ab16-cda9db4df169")).toMatchObject({
      name_en: "Capital Safety Company",
      name_ar: "أمان العاصمة",
      logo: clientLogoPath("capital-safety"),
    });
  });

  it("leaves a row whose logo an admin changed untouched", async () => {
    expect(await client(pool, "demo-1")).toMatchObject({ name_en: "Zamil", name_ar: "الزامل", logo: ADMIN_LOGO });
  });

  it("leaves the logo-less duplicate rows as they were", async () => {
    expect(await client(pool, "2dee0f69-5e78-4af3-89ed-5c15af01581d")).toMatchObject({ name_en: "", name_ar: "دايت فتنس", logo: "" });
    expect(await client(pool, "100f0e21-e86e-479d-8af3-42d8eb9ce9fa")).toMatchObject({ name_en: "", name_ar: "دايموند", logo: "" });
  });

  it("inserts the missing clients after the existing rows, once", async () => {
    const fresh = CLIENT_LOGOS.filter((c) => !c.prod);
    expect(fresh.length).toBe(9);
    const r = await pool.query(`SELECT id, name_en, name_ar, logo, tags, sort_order FROM clients WHERE id LIKE 'v2-client-%' ORDER BY sort_order`);
    expect(r.rows).toEqual(
      fresh.map((c, i) => ({ id: newClientId(c.slug), name_en: c.name.en, name_ar: c.name.ar, logo: clientLogoPath(c.slug), tags: [], sort_order: 38 + i })),
    );
  });

  it("deletes nothing", async () => {
    const r = await pool.query(`SELECT id FROM clients`);
    const ids = new Set(r.rows.map((x) => x.id));
    for (const [, id] of PROD_ROWS) expect(ids.has(id), id).toBe(true);
    expect(r.rowCount).toBe(PROD_ROWS.length + 9);
  });

  it("shows every logo in the strips whose limit is still a seeded value", async () => {
    expect((await strip(pool, "home")).limit).toBe(60);
    expect((await strip(pool, "about")).limit).toBe(60);
    expect((await strip(pool, "sector:trading")).limit).toBe(60);
    expect((await strip(pool, "sector:real-estate")).limit).toBe(60);
    expect((await strip(pool, "sector:retail")).limit).toBe(20);
    expect((await strip(pool, "clients")).limit).toBe(12);
  });

  it("replaces the old Saudi-only heading only where it is exactly the old text", async () => {
    expect((await strip(pool, "home")).heading).toEqual(NEW_HEADING);
    expect((await strip(pool, "sector:trading")).heading).toEqual(NEW_HEADING);
    expect((await strip(pool, "clients")).heading).toEqual(NEW_HEADING);
    expect((await strip(pool, "sector:real-estate")).heading.en).toBe("Developers and contractors running on systems we implemented");
    expect((await strip(pool, "sector:retail")).heading).toEqual({ en: "Retailers we work with", ar: NEW_HEADING.ar });
  });

  it("runs once: a later reset is not redone", async () => {
    const fixes = await pool.query(`SELECT key FROM data_fixes WHERE key = $1`, [CLIENT_LOGOS_FIX_KEY]);
    expect(fixes.rowCount).toBe(1);
    const zamilUpload = PROD_ROWS[1][4];
    await pool.query(`UPDATE clients SET logo = $1 WHERE id = 'demo-1'`, [zamilUpload]);
    await pool.query(`UPDATE page_blocks SET content = jsonb_set(content, '{limit}', '8') WHERE page = 'home' AND type = 'logo_wall'`);
    await ensureReady(pool);
    expect((await client(pool, "demo-1")).logo).toBe(zamilUpload);
    expect((await strip(pool, "home")).limit).toBe(8);
    expect((await pool.query(`SELECT 1 FROM clients WHERE id LIKE 'v2-client-%'`)).rowCount).toBe(9);
  });
});

describe.skipIf(!canUseDb)("client logos fix on a fresh database", () => {
  const schema = "t_client_logos_fresh";
  let pool: Pool;

  beforeAll(async () => {
    pool = scratchPool(schema);
    await resetSchema(pool, schema);
    await ensureReady(pool);
  }, 60_000);

  afterAll(async () => {
    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await pool.end();
  });

  it("adds no clients to an empty table (the bundled set already shows) and records the fix", async () => {
    expect((await pool.query(`SELECT 1 FROM clients`)).rowCount).toBe(0);
    expect((await pool.query(`SELECT 1 FROM data_fixes WHERE key = $1`, [CLIENT_LOGOS_FIX_KEY])).rowCount).toBe(1);
  });

  it("seeds the strips with every logo and the new heading", async () => {
    for (const page of ["home", "about", "sector:trading", "sector:real-estate"]) {
      const s = await strip(pool, page);
      expect(s.limit, page).toBe(60);
      if (page !== "sector:real-estate") expect(s.heading, page).toEqual(NEW_HEADING);
    }
  });
});
