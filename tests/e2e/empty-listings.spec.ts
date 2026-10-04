import { expect, test } from "@playwright/test";
import { testDb } from "./test-db";

/**
 * An enabled sector or supporting service with no page blocks 404s, so it must
 * not be linked from the nav, footer, /sectors, /products or the sitemap. This
 * adds rows to the shared test database (always removed afterwards), so it runs
 * in the serial site-wide project, after the desktop and mobile projects.
 */

const SECTOR = "e2e-no-blocks";
const PRODUCT = "e2e-no-blocks-service";

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  const db = testDb();
  try {
    await db.query(
      `INSERT INTO sectors (id, name_en, name_ar, title_en, title_ar, enabled, sort_order)
       VALUES ($1, 'E2E empty sector', 'قطاع فارغ', 'E2E empty sector', 'قطاع فارغ', true, 98)
       ON CONFLICT (id) DO UPDATE SET enabled = true`,
      [SECTOR],
    );
    await db.query(
      `INSERT INTO products (slug, name_en, name_ar, enabled, sort_order)
       VALUES ($1, 'E2E empty service', 'خدمة فارغة', true, 98)
       ON CONFLICT (slug) DO UPDATE SET enabled = true`,
      [PRODUCT],
    );
  } finally {
    await db.end();
  }
});

test.afterAll(async () => {
  const db = testDb();
  try {
    await db.query(`DELETE FROM sectors WHERE id = $1`, [SECTOR]);
    await db.query(`DELETE FROM products WHERE slug = $1`, [PRODUCT]);
  } finally {
    await db.end();
  }
});

for (const prefix of ["", "/ar"]) {
  test(`${prefix || "/"} lists only sectors and services that have a page`, async ({ page, request }) => {
    test.setTimeout(120_000);
    // The page itself is a 404, as before.
    expect((await request.get(`${prefix}/sectors/${SECTOR}`)).status()).toBe(404);
    expect((await request.get(`${prefix}/products/${PRODUCT}`)).status()).toBe(404);

    // Server-rendered HTML (nav, footer, index pages): the empty ones are absent, a real one is present.
    for (const path of [`${prefix}/`, `${prefix}/sectors`, `${prefix}/products`]) {
      const html = await (await request.get(path)).text();
      expect(html, path).not.toContain(`/sectors/${SECTOR}`);
      expect(html, path).not.toContain(`/products/${PRODUCT}`);
      expect(html, path).toContain("/sectors/real-estate");
    }

    // Client-side nav data comes from the same source.
    const settings = await (await request.get("/api/settings/public")).json();
    const sectorSlugs = settings.data.sectors.map((s: { slug: string }) => s.slug);
    expect(sectorSlugs).toContain("real-estate");
    expect(sectorSlugs).not.toContain(SECTOR);
    expect(settings.data.products.map((p: { slug: string }) => p.slug)).not.toContain(PRODUCT);

    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).not.toContain(`/sectors/${SECTOR}`);
    expect(xml).not.toContain(`/products/${PRODUCT}`);
    expect(xml).toContain("/sectors/real-estate");

    // Sanity: the sectors index page still renders.
    await page.goto(`${prefix}/sectors`);
    await expect(page.locator("main a[href*='/sectors/real-estate']").first()).toBeVisible();
  });
}
