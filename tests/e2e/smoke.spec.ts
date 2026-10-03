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
