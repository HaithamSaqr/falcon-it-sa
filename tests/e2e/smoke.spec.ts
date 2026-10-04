import { expect, test } from "@playwright/test";

test("GET / returns 200 with an English document", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("GET /ar returns 200 with an RTL document", async ({ page }) => {
  const response = await page.goto("/ar");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("unknown URL: 404 page uses the v2 fonts and tokens", async ({ page }) => {
  const res = await page.goto("/no-such-page-xyz");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
  const style = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    return { font: b.fontFamily, bg: b.backgroundColor };
  });
  expect(style.font).toMatch(/Schibsted/i);
  expect(style.font).not.toMatch(/\bInter\b/);
  expect(style.bg).toBe("rgb(245, 247, 250)");
  await expect(page.locator('a[href="/"]').first()).toBeVisible();
});
