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

test("unknown URL: the localized 404 uses the v2 fonts and tokens", async ({ page }) => {
  const res = await page.goto("/no-such-page-xyz");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "This page could not be found." })).toBeVisible();
  const style = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    const section = document.querySelector("main section");
    return { font: b.fontFamily, bg: section ? getComputedStyle(section).backgroundColor : "" };
  });
  expect(style.font).toMatch(/Schibsted/i);
  expect(style.font).not.toMatch(/\bInter\b/);
  expect(style.bg).toBe("rgb(245, 247, 250)");
  await expect(page.locator('a[href="/"]').first()).toBeVisible();
});

test("a path outside the locale routes keeps the root 404 in the v2 tokens", async ({ page }) => {
  const res = await page.goto("/no-such-file.txt");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
  const style = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    return { font: b.fontFamily, bg: b.backgroundColor };
  });
  expect(style.font).toMatch(/Schibsted/i);
  expect(style.bg).toBe("rgb(245, 247, 250)");
  await expect(page.locator('a[href="/"]').first()).toBeVisible();
});

test("the test environment loads no third-party trackers", async ({ request }) => {
  // scripts/prepare-test-env.mjs switches the Snap Pixel and Google tags off in the test database.
  const html = await (await request.get("/")).text();
  expect(html).not.toMatch(/sc-static\.net|snapchat\.com|googletagmanager\.com/);
});
