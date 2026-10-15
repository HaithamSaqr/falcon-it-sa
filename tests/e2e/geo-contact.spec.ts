import { expect, test } from "@playwright/test";
import { testDb } from "./test-db";

/**
 * Owner decision 2026-10-15: a visitor in Egypt (Cloudflare cf-ipcountry=EG)
 * sees the Egypt phone and WhatsApp; everyone else sees the Saudi ones. The
 * local server has no Cloudflare, so the header is sent by the test.
 */
const EG_PHONE = "+201132323095";
const ENTITY = {
  nameEn: "Falcon IT Smart Solutions LLC",
  nameAr: "شركة فالكون لتقنية المعلومات والحلول الذكية ذ.م.م",
  addressEn: "17 North 90th Street, Fifth Settlement, New Cairo, Cairo, Egypt",
  addressAr: "17 شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة، القاهرة",
  crNumber: "268153",
  taxNumber: "774-895-454",
  odooFromEgp: "25,000",
  falconFromEgp: "",
};
let original: string | null = null;
let originalEntity: unknown = null;

test.beforeAll(async () => {
  const db = testDb();
  try {
    const row = (await db.query(`SELECT phone_egypt, egypt_entity FROM site_settings WHERE id = 1`)).rows[0];
    original = row?.phone_egypt ?? null;
    originalEntity = row?.egypt_entity ?? {};
    await db.query(`UPDATE site_settings SET phone_egypt = $1, egypt_entity = $2 WHERE id = 1`, [EG_PHONE, JSON.stringify(ENTITY)]);
  } finally {
    await db.end();
  }
});

test.afterAll(async () => {
  const db = testDb();
  try {
    await db.query(`UPDATE site_settings SET phone_egypt = $1, egypt_entity = $2 WHERE id = 1`, [
      original ?? "",
      JSON.stringify(originalEntity ?? {}),
    ]);
  } finally {
    await db.end();
  }
});

test("a visitor in Egypt gets the Egypt number in the footer, contact page and WhatsApp", async ({ browser }) => {
  const ctx = await browser.newContext({ extraHTTPHeaders: { "cf-ipcountry": "EG" } });
  const page = await ctx.newPage();
  await page.goto("/contact");
  const footer = page.locator("footer");
  await expect(footer.locator(`a[href="tel:${EG_PHONE}"]`)).toHaveText("+20 11 3232 3095");
  await expect(page.locator(`main a[href="tel:${EG_PHONE}"]`).first()).toBeVisible();
  await expect(page.locator('main a[href^="https://wa.me/201132323095"]').first()).toBeVisible();
  // The Egyptian company: registered address, register and tax numbers.
  await expect(footer).toContainText(ENTITY.addressEn);
  await expect(footer).toContainText("Commercial Register No. 268153");
  await expect(footer).toContainText("Tax Registration No. 774-895-454");
  await expect(footer).toContainText("Falcon IT Smart Solutions LLC");
  await expect(page.locator("main")).toContainText(ENTITY.addressEn);
  await page.screenshot({ path: test.info().outputPath("contact-eg.png"), fullPage: true });
  await page.goto("/ar/contact");
  await expect(page.locator("footer")).toContainText("سجل تجاري رقم 268153");
  await expect(page.locator("footer")).toContainText(ENTITY.addressAr);
  // EGP starting price under the Odoo hero; none on Falcon ERP (no price set).
  await page.goto("/erp/odoo");
  await expect(page.locator('[data-egypt-price="odoo"]')).toContainText("25,000 EGP");
  await page.screenshot({ path: test.info().outputPath("odoo-eg.png"), fullPage: false });
  await page.goto("/erp/falcon");
  await expect(page.locator("[data-egypt-price]")).toHaveCount(0);
  // The home hero's "Talk on WhatsApp" link (CMS content) follows the country too.
  await page.goto("/");
  await expect(page.locator('a[href^="https://wa.me/966"]')).toHaveCount(0);
  await ctx.close();
});

test("a visitor in Saudi Arabia keeps the Saudi number", async ({ browser }) => {
  const ctx = await browser.newContext({ extraHTTPHeaders: { "cf-ipcountry": "SA" } });
  const page = await ctx.newPage();
  await page.goto("/contact");
  await expect(page.locator(`footer a[href^="tel:+966"]`).first()).toBeVisible();
  await expect(page.locator(`a[href^="tel:+20"]`)).toHaveCount(0);
  await expect(page.locator('a[href^="https://wa.me/20"]')).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/268153|774-895-454|New Cairo|EGP/);
  await page.goto("/erp/odoo");
  await expect(page.locator("[data-egypt-price]")).toHaveCount(0);
  await ctx.close();
});
