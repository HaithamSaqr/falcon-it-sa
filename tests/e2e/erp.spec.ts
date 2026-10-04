import { expect, test, type Page } from "@playwright/test";

/**
 * Task 10: `/erp/falcon` and `/erp/odoo`, the supporting product pages, the
 * `/products` index, the old ERP product URLs (permanent redirects) and the
 * applications brochure (disabled, so 404 and never linked).
 */

const LOCALES = [
  { prefix: "", name: "en" },
  { prefix: "/ar", name: "ar" },
] as const;

const SYSTEMS = [
  { slug: "falcon", logo: "logo-falcon-erp", crumbEn: "Falcon ERP", crumbAr: "فالكون ERP" },
  { slug: "odoo", logo: "logo-odoo", crumbEn: "Odoo", crumbAr: "أودو" },
] as const;

const SERVICES = ["server-management", "data-management", "applications"] as const;

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

async function noOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

async function breadcrumbs(page: Page) {
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));
  return ld.find((d) => d["@type"] === "BreadcrumbList");
}

for (const L of LOCALES) {
  test.describe(`ERP pages (${L.name})`, () => {
    for (const sys of SYSTEMS) {
      test(`${L.prefix}/erp/${sys.slug} returns 200 with the official logo, one H1 and a booking block`, async ({ page }) => {
        const problems = watchProblems(page);
        const res = await page.goto(`${L.prefix}/erp/${sys.slug}`);
        expect(res?.status()).toBe(200);
        await expect(page.locator("h1")).toHaveCount(1);
        const logo = page.locator(`main img[src*="${sys.logo}"]`).first();
        await logo.scrollIntoViewIfNeeded(); // lazy-loaded when it sits below the fold
        await expect(logo).toBeVisible();
        await expect
          .poll(() => logo.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
          .toBe(true);
        await expect(page.locator('[data-block-type="booking"]')).toHaveCount(1);
        await noOverflow(page);
        const text = await page.locator("main").innerText();
        expect(text).not.toContain("undefined");
        await scrollThrough(page);
        expect(problems).toEqual([]);
      });

      test(`${L.prefix}/erp/${sys.slug}: breadcrumb Home to the system, canonical`, async ({ page }) => {
        await page.goto(`${L.prefix}/erp/${sys.slug}`);
        const crumbs = await breadcrumbs(page);
        expect(crumbs).toBeTruthy();
        expect(crumbs.itemListElement).toHaveLength(2);
        expect(crumbs.itemListElement[1].name).toBe(L.prefix ? sys.crumbAr : sys.crumbEn);
        expect(crumbs.itemListElement[1].item).toMatch(new RegExp(`${L.prefix}/erp/${sys.slug}$`));
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${L.prefix}/erp/${sys.slug}$`));
      });
    }

    test(`${L.prefix}/erp/<unknown> returns 404`, async ({ page }) => {
      for (const slug of ["sap", "Falcon", "falcon-cloud"]) {
        const res = await page.goto(`${L.prefix}/erp/${slug}`);
        expect(res?.status(), slug).toBe(404);
      }
    });
  });

  test.describe(`old ERP product URLs (${L.name})`, () => {
    const MOVED: [string, string][] = [
      ["falcon-erp-desktop", "falcon"],
      ["falcon-cloud", "falcon"],
      ["odoo-services", "odoo"],
    ];
    for (const [from, to] of MOVED) {
      test(`${L.prefix}/products/${from} redirects permanently to ${L.prefix}/erp/${to}`, async ({ request }) => {
        const res = await request.get(`${L.prefix}/products/${from}`, { maxRedirects: 0 });
        expect([301, 308]).toContain(res.status());
        expect(new URL(res.headers()["location"], "http://x").pathname).toBe(`${L.prefix}/erp/${to}`);
      });
    }
    test(`${L.prefix}: following /products/falcon-cloud lands on the Falcon ERP page`, async ({ page }) => {
      const res = await page.goto(`${L.prefix}/products/falcon-cloud`);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`${L.prefix}/erp/falcon$`));
    });
  });

  test.describe(`product pages (${L.name})`, () => {
    for (const slug of SERVICES) {
      test(`${L.prefix}/products/${slug} renders the v2 template with one H1, a process and a booking block`, async ({ page }) => {
        const problems = watchProblems(page);
        const res = await page.goto(`${L.prefix}/products/${slug}`);
        expect(res?.status()).toBe(200);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator('[data-block-type="hero"]')).toHaveCount(1);
        await expect(page.locator('[data-block-type="departments"]')).toHaveCount(1);
        await expect(page.locator('[data-block-type="process"]')).toHaveCount(1);
        await expect(page.locator('[data-block-type="booking"]')).toHaveCount(1);
        const crumbs = await breadcrumbs(page);
        expect(crumbs.itemListElement).toHaveLength(3);
        expect(crumbs.itemListElement[1].item).toMatch(new RegExp(`${L.prefix}/products$`));
        expect(crumbs.itemListElement[2].item).toMatch(new RegExp(`${L.prefix}/products/${slug}$`));
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${L.prefix}/products/${slug}$`));
        await noOverflow(page);
        await scrollThrough(page);
        expect(problems).toEqual([]);
      });
    }

    test(`${L.prefix}/products/<unknown> returns 404`, async ({ page }) => {
      const res = await page.goto(`${L.prefix}/products/definitely-not-a-product`);
      expect(res?.status()).toBe(404);
    });
  });

  test.describe(`products index (${L.name})`, () => {
    test(`${L.prefix}/products shows both ERPs, the supporting services and a booking block`, async ({ page }) => {
      const problems = watchProblems(page);
      const res = await page.goto(`${L.prefix}/products`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(L.prefix ? "أنظمة ERP والخدمات" : "ERP systems and services");

      const erp = page.locator('[data-block-type="erp_compare"]');
      const erpHrefs = await erp.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
      expect(erpHrefs).toContain(`${L.prefix}/erp/falcon`);
      expect(erpHrefs).toContain(`${L.prefix}/erp/odoo`);
      await expect(erp.locator('img[src*="logo-falcon-erp"]')).toHaveCount(1);
      await expect(erp.locator('img[src*="logo-odoo"]')).toHaveCount(1);

      const grid = page.locator('[data-block-type="sector_grid"]');
      const hrefs = await grid.locator("ul > li a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
      expect(hrefs.slice(0, 3)).toEqual(SERVICES.map((s) => `${L.prefix}/products/${s}`));
      await expect(page.locator('[data-block-type="booking"]')).toHaveCount(1);
      await noOverflow(page);
      await scrollThrough(page);
      expect(problems).toEqual([]);
    });
  });

  test.describe(`brochures (${L.name})`, () => {
    test(`${L.prefix}/brochure/applications returns 404 (disabled)`, async ({ page }) => {
      const res = await page.goto(`${L.prefix}/brochure/applications`);
      expect(res?.status()).toBe(404);
    });

    test(`${L.prefix}/brochure/server-management still works`, async ({ page }) => {
      const res = await page.goto(`${L.prefix}/brochure/server-management`);
      expect(res?.status()).toBe(200);
    });

    test(`${L.prefix}: no page links to the applications brochure`, async ({ page }) => {
      test.setTimeout(120_000);
      const pages = [
        "",
        "/products",
        ...SERVICES.map((s) => `/products/${s}`),
        ...SYSTEMS.map((s) => `/erp/${s.slug}`),
        "/sectors",
        "/about",
        "/contact",
      ];
      for (const p of pages) {
        await page.goto(`${L.prefix}${p}` || "/", { waitUntil: "domcontentloaded" });
        const hrefs = await page.locator("a[href]").evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
        expect(
          hrefs.filter((h) => /brochure\/applications/.test(h)),
          p,
        ).toEqual([]);
      }
    });
  });
}
