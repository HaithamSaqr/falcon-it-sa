import { expect, test, type Page } from "@playwright/test";

/**
 * Task 8: the home page is the `home` blocks rendered by BlockRenderer.
 * Checked in both locales; the desktop and mobile projects cover 1440 and 390.
 */

const LOCALES = [
  { path: "/", prefix: "", h1: "One ERP for your whole company.", book: "Book a demo", falconAlt: "Falcon ERP" },
  { path: "/ar", prefix: "/ar", h1: "نظام واحد لشركتك كلها.", book: "احجز عرضًا تجريبيًا", falconAlt: "فالكون ERP" },
] as const;

/** Console errors, page errors and 4xx/5xx responses (assets included) on a page. */
function watchProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text().slice(0, 300)} @ ${m.location().url}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`http ${r.status()}: ${r.url()}`);
  });
  return problems;
}

for (const L of LOCALES) {
  test.describe(`home ${L.path}`, () => {
    test("H1 is the v2 headline and no sector pill is selected on load", async ({ page }) => {
      await page.goto(L.path);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(L.h1);
      const pills = page.locator('[data-block-type="hero"]').getByRole("radio");
      expect(await pills.count()).toBeGreaterThan(0);
      await expect(page.locator('[data-block-type="hero"] [role="radio"][aria-checked="true"]')).toHaveCount(0);
    });

    test("sector grid: six photo cards, Services, and the closing card", async ({ page }) => {
      await page.goto(L.path);
      const grid = page.locator('[data-block-type="sector_grid"]');
      const items = grid.locator("ul > li");
      await expect(items).toHaveCount(8);
      await expect(grid.locator("ul > li img")).toHaveCount(6);
      const hrefs = await grid.locator("ul > li a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
      expect(hrefs.slice(0, 7)).toEqual(
        ["real-estate", "manufacturing", "trading", "hospitality", "retail", "logistics", "professional-services"].map(
          (s) => `${L.prefix}/sectors/${s}`,
        ),
      );
      // Services (professional-services) has no photo; neither has the closing card.
      await expect(items.nth(6).locator("img")).toHaveCount(0);
      await expect(items.nth(7).locator("img")).toHaveCount(0);
    });

    test("every primary CTA says Book a demo and links to the configured demo url", async ({ page }) => {
      await page.goto(L.path);
      const demo = `${L.prefix}/demo`;
      const ctas = page.locator("main a").filter({ hasText: L.book });
      expect(await ctas.count()).toBeGreaterThanOrEqual(2);
      const hrefs = await ctas.evaluateAll((els) => els.map((e) => e.getAttribute("href")));
      expect(new Set(hrefs)).toEqual(new Set([demo]));
      await expect(page.locator('[data-block-type="hero"]').getByRole("link", { name: L.book })).toHaveAttribute("href", demo);
      await expect(page.locator('[data-block-type="booking"]').getByRole("link", { name: L.book })).toHaveAttribute("href", demo);
    });

    test("Falcon card shows the Falcon ERP logo with its alt text", async ({ page }) => {
      await page.goto(L.path);
      const img = page.locator('[data-block-type="erp_compare"]').getByRole("img", { name: L.falconAlt });
      await expect(img).toHaveCount(1);
      await expect(img).toHaveAttribute("src", /logo-falcon-erp/);
    });

    test("the #how anchor exists, no horizontal scroll, no undefined text", async ({ page }) => {
      await page.goto(L.path);
      await expect(page.locator("#how")).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const text = await page.locator("main").innerText();
      expect(text).not.toContain("undefined");
      expect(text).not.toContain("[object Object]");
    });

    test("no console error, page error or failed request; canonical and hreflang set", async ({ page }) => {
      const problems = watchProblems(page);
      const res = await page.goto(L.path);
      expect(res?.status()).toBe(200);
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 25));
        }
      });
      await page.waitForLoadState("networkidle", { timeout: 60_000 });
      expect(problems).toEqual([]);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        L.prefix ? /\/ar$/ : /^https?:\/\/[^/]+\/?$/,
      );
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveCount(1);
    });
  });
}

test("the old home sections are gone", async ({ page }) => {
  await page.goto("/");
  const text = await page.locator("main").innerText();
  expect(text).not.toContain("Book an Appointment");
  expect(text).not.toContain("ERP built for your business");
});
