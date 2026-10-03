import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Task 9: sector pages are `sector:<slug>` blocks rendered with the sector
 * context; `/sectors` lists the enabled sectors; retired slugs redirect.
 */

const SECTORS = [
  "real-estate",
  "manufacturing",
  "trading",
  "hospitality",
  "retail",
  "logistics",
  "professional-services",
] as const;

const LOCALES = [
  { prefix: "", name: "en" },
  { prefix: "/ar", name: "ar" },
] as const;

async function litStages(scope: Locator | Page): Promise<string[]> {
  return scope
    .locator("[data-stage]")
    .evaluateAll((els) => els.filter((e) => e.getAttribute("data-lit") === "true").map((e) => e.getAttribute("data-stage") ?? ""));
}

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

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 25));
    }
  });
  await page.waitForLoadState("networkidle", { timeout: 60_000 });
}

for (const L of LOCALES) {
  test.describe(`sector pages (${L.name})`, () => {
    for (const slug of SECTORS) {
      test(`${L.prefix}/sectors/${slug} returns 200 with a role switcher and one H1`, async ({ page }) => {
        const res = await page.goto(`${L.prefix}/sectors/${slug}`);
        expect(res?.status()).toBe(200);
        await expect(page.locator("h1")).toHaveCount(1);
        const roles = page.locator('[data-block-type="sector_hero"]').getByRole("radio");
        expect(await roles.count()).toBeGreaterThanOrEqual(2);
        await expect(page.locator('[data-block-type="booking"]')).toHaveCount(1);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test(`${L.prefix}/sectors/real-estate: no console error or failed request, breadcrumb JSON-LD, canonical`, async ({ page }) => {
      const problems = watchProblems(page);
      await page.goto(`${L.prefix}/sectors/real-estate`);
      await scrollThrough(page);
      expect(problems).toEqual([]);
      const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));
      const crumbs = ld.find((d) => d["@type"] === "BreadcrumbList");
      expect(crumbs).toBeTruthy();
      expect(crumbs.itemListElement).toHaveLength(3);
      expect(crumbs.itemListElement[1].item).toMatch(new RegExp(`${L.prefix}/sectors$`));
      expect(crumbs.itemListElement[2].item).toMatch(new RegExp(`${L.prefix}/sectors/real-estate$`));
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${L.prefix}/sectors/real-estate$`));
    });

    test(`${L.prefix}/sectors lists the seven sectors, a closing card and a booking block`, async ({ page }) => {
      const problems = watchProblems(page);
      const res = await page.goto(`${L.prefix}/sectors`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(L.prefix ? "القطاعات التي نخدمها" : "Sectors we serve");
      const grid = page.locator('[data-block-type="sector_grid"]');
      const hrefs = await grid.locator("ul > li a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
      expect(hrefs.slice(0, 7)).toEqual(SECTORS.map((s) => `${L.prefix}/sectors/${s}`));
      await expect(grid.locator("ul > li")).toHaveCount(8);
      await expect(page.locator('[data-block-type="booking"]')).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await scrollThrough(page);
      expect(problems).toEqual([]);
    });
  });
}

test("on /ar/sectors/real-estate choosing the contractor lights stages 2, 3 and 6 and swaps the H1", async ({ page }) => {
  await page.goto("/ar/sectors/real-estate");
  const dev = page.getByRole("radio", { name: "مطوّر عقاري", exact: true });
  const con = page.getByRole("radio", { name: "مقاول", exact: true });
  await expect(dev).toHaveAttribute("aria-checked", "true");
  expect(await litStages(page)).toEqual(["1", "2", "3", "4", "5", "6"]);
  await con.click();
  await expect(con).toHaveAttribute("aria-checked", "true");
  await expect.poll(() => litStages(page)).toEqual(["2", "3", "6"]);
  await expect(page.locator("h1")).toHaveText("مستخلصك في موعده، وهامشك أمامك.");
  await expect(page.locator('[data-block-type="booking"] a').first()).toHaveAttribute(
    "href",
    "/ar/demo?sector=real-estate&role=con",
  );
});

test("the booking CTA carries ?sector=real-estate&role=dev after choosing the developer", async ({ page }) => {
  await page.goto("/sectors/real-estate");
  const con = page.getByRole("radio", { name: "Contractor", exact: true });
  const dev = page.getByRole("radio", { name: "Developer", exact: true });
  const booking = page.locator('[data-block-type="booking"] a').first();
  await con.click();
  await expect(booking).toHaveAttribute("href", "/demo?sector=real-estate&role=con");
  await dev.click();
  await expect(dev).toHaveAttribute("aria-checked", "true");
  await expect(booking).toHaveAttribute("href", "/demo?sector=real-estate&role=dev");
  await expect(page.locator('[data-block-type="sector_hero"]').getByRole("link", { name: "Book a demo" })).toHaveAttribute(
    "href",
    "/demo?sector=real-estate&role=dev",
  );
});

test("?role= in the URL picks the starting role when it is declared, and is ignored otherwise", async ({ page }) => {
  await page.goto("/sectors/real-estate?role=con");
  await expect(page.getByRole("radio", { name: "Contractor", exact: true })).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("h1")).toHaveText("Claims on time. Margin you can see from site.");
  await page.goto("/sectors/real-estate?role=nope");
  await expect(page.getByRole("radio", { name: "Developer", exact: true })).toHaveAttribute("aria-checked", "true");
});

test.describe("redirects and 404", () => {
  const MOVED: [string, string][] = [
    ["RetailBasic", "retail"],
    ["construction", "real-estate"],
    ["food-beverage", "hospitality"],
  ];
  const TO_INDEX = ["healthcare", "education", "automotive", "pharma", "agriculture", "energy", "fashion", "jewelry", "nonprofit"];

  for (const L of LOCALES) {
    for (const [from, to] of MOVED) {
      test(`${L.prefix}/sectors/${from} redirects permanently to ${L.prefix}/sectors/${to}`, async ({ request }) => {
        const res = await request.get(`${L.prefix}/sectors/${from}`, { maxRedirects: 0 });
        expect([301, 308]).toContain(res.status());
        expect(new URL(res.headers()["location"], "http://x").pathname).toBe(`${L.prefix}/sectors/${to}`);
      });
    }
    test(`${L.prefix}: every other retired sector slug redirects permanently to ${L.prefix}/sectors`, async ({ request }) => {
      for (const from of TO_INDEX) {
        const res = await request.get(`${L.prefix}/sectors/${from}`, { maxRedirects: 0 });
        expect([301, 308], from).toContain(res.status());
        expect(new URL(res.headers()["location"], "http://x").pathname, from).toBe(`${L.prefix}/sectors`);
      }
    });
    test(`${L.prefix}: following the RetailBasic redirect lands on the retail page`, async ({ page }) => {
      const res = await page.goto(`${L.prefix}/sectors/RetailBasic`);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`${L.prefix}/sectors/retail$`));
    });
    test(`${L.prefix}/sectors/<unknown> returns 404`, async ({ page }) => {
      const res = await page.goto(`${L.prefix}/sectors/definitely-not-a-sector`);
      expect(res?.status()).toBe(404);
    });
  }
});
