import { expect, test } from "@playwright/test";
import { testDb } from "./test-db";

/**
 * Owner decision 2026-10-15: a visitor in Egypt (Cloudflare cf-ipcountry=EG)
 * sees the Egypt phone and WhatsApp; everyone else sees the Saudi ones. The
 * local server has no Cloudflare, so the header is sent by the test.
 */
const EG_PHONE = "+201132323095";
let original: string | null = null;

test.beforeAll(async () => {
  const db = testDb();
  try {
    original = (await db.query(`SELECT phone_egypt FROM site_settings WHERE id = 1`)).rows[0]?.phone_egypt ?? null;
    await db.query(`UPDATE site_settings SET phone_egypt = $1 WHERE id = 1`, [EG_PHONE]);
  } finally {
    await db.end();
  }
});

test.afterAll(async () => {
  const db = testDb();
  try {
    await db.query(`UPDATE site_settings SET phone_egypt = $1 WHERE id = 1`, [original ?? ""]);
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
  await expect(page.locator("body")).not.toContainText(/Cairo|القاهرة/);
  await ctx.close();
});

test("a visitor in Saudi Arabia keeps the Saudi number", async ({ browser }) => {
  const ctx = await browser.newContext({ extraHTTPHeaders: { "cf-ipcountry": "SA" } });
  const page = await ctx.newPage();
  await page.goto("/contact");
  await expect(page.locator(`footer a[href^="tel:+966"]`).first()).toBeVisible();
  await expect(page.locator(`a[href^="tel:+20"]`)).toHaveCount(0);
  await expect(page.locator('a[href^="https://wa.me/20"]')).toHaveCount(0);
  await ctx.close();
});
