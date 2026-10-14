import { expect, test } from "@playwright/test";

for (const [path, type, lang] of [
  ["/thank-you?type=demo", "demo", "en"],
  ["/thank-you?type=contact", "contact", "en"],
  ["/ar/thank-you?type=demo", "demo", "ar"],
  ["/ar/thank-you", "demo", "ar"],
] as const) {
  test(`${path} confirms the ${type} request, one H1, noindex`, async ({ page }, info) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator(`[data-thank-you="${type}"]`)).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.screenshot({ path: info.outputPath(`thank-you-${lang}-${type}.png`), fullPage: true });
  });
}
