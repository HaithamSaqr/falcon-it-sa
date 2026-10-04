import { expect, test, type Page } from "@playwright/test";
import { testDb } from "./test-db";

/**
 * Task 11: the remaining public pages on v2 (about, contact, demo, faq,
 * clients, terms, the new website privacy policy), the Falcon Valley app
 * policy kept at /privacy, the blog gate, the kept legacy routes, and sector
 * and role attribution on demo leads.
 */

const LOCALES = [
  { prefix: "", name: "en" },
  { prefix: "/ar", name: "ar" },
] as const;

// Several pages per test against one dev server: give slow first compiles room.
test.describe.configure({ timeout: 90_000 });

/** Pages rendered from blocks (or a block page with a form island). */
const V2_PAGES = ["/about", "/contact", "/demo", "/faq", "/clients", "/terms", "/privacy-policy"] as const;

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

/** The v2 chrome: server-rendered footer columns and the v2 nav links. */
async function hasV2Chrome(page: Page, prefix: string) {
  expect(await page.locator("footer [data-footer-column]").count()).toBeGreaterThanOrEqual(3);
  expect(await page.locator(`header a[href="${prefix}/erp/falcon"]`).count()).toBeGreaterThan(0);
}

for (const L of LOCALES) {
  test.describe(`v2 pages (${L.name})`, () => {
    for (const path of V2_PAGES) {
      test(`${L.prefix}${path} returns 200 in v2 chrome with one H1, clean console and no overflow`, async ({ page }) => {
        const problems = watchProblems(page);
        const res = await page.goto(`${L.prefix}${path}`);
        expect(res?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", L.name);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("main [data-block-type]").first()).toBeVisible();
        await hasV2Chrome(page, L.prefix);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${L.prefix}${path}$`));
        const text = await page.locator("main").innerText();
        expect(text).not.toContain("undefined");
        expect(text).not.toMatch(/[–—]/);
        await noOverflow(page);
        await scrollThrough(page);
        expect(problems).toEqual([]);
      });
    }

    test(`${L.prefix}: every page has its own title`, async ({ page }) => {
      test.setTimeout(120_000);
      const titles: string[] = [];
      for (const path of ["", ...V2_PAGES, "/privacy"]) {
        await page.goto(`${L.prefix}${path}` || "/", { waitUntil: "domcontentloaded" });
        titles.push(await page.title());
      }
      for (const t of titles) expect(t.trim()).not.toBe("");
      expect(new Set(titles).size, titles.join(" | ")).toBe(titles.length);
    });

    test(`${L.prefix}: demo and contact forms link to the website privacy policy`, async ({ page }) => {
      for (const path of ["/demo", "/contact"]) {
        await page.goto(`${L.prefix}${path}`);
        const form = page.locator("main form");
        await expect(form).toHaveCount(1);
        const link = form.locator(`a[href="${L.prefix}/privacy-policy"]`);
        await expect(link).toHaveCount(1);
        // A new tab, so the visitor keeps what they typed.
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    });

    test(`${L.prefix}/privacy-policy is the website policy`, async ({ page }) => {
      await page.goto(`${L.prefix}/privacy-policy`);
      await expect(page.locator("h1")).toHaveText(L.prefix ? "سياسة خصوصية الموقع" : "Website privacy policy");
      await expect(page.locator('[data-block-type="rich_text"]')).toContainText("7049432656");
    });

    test(`${L.prefix}/privacy still serves the Falcon Valley app policy`, async ({ page }) => {
      const problems = watchProblems(page);
      const res = await page.goto(`${L.prefix}/privacy`);
      expect(res?.status()).toBe(200);
      await hasV2Chrome(page, L.prefix);
      const main = page.locator("main");
      // Both language versions of the app policy, as before.
      await expect(main.locator('section[lang="ar"] h1')).toHaveText("سياسة الخصوصية");
      await expect(main.locator('section[lang="en"] h1')).toHaveText("Falcon Valley privacy policy");
      // Copy rule: no em or en dash anywhere on the page.
      expect(await main.innerText()).not.toMatch(/[–—]/);
      await expect(main).toContainText("Falcon Valley");
      await expect(main).toContainText("آخر تحديث: ٧ سبتمبر ٢٠٢٦");
      await expect(main).toContainText("Last updated: September 7, 2026");
      await expect(main.locator('a[href="mailto:info@falcon-v.com"]')).toHaveCount(2);
      await expect(main.locator('a[href="https://policies.google.com/privacy"]')).toHaveCount(2);
      // Not the website policy.
      await expect(main).not.toContainText("Website privacy policy");
      await scrollThrough(page);
      expect(problems).toEqual([]);
    });

    test(`${L.prefix}/clients shows the client logos and a booking block`, async ({ page }) => {
      await page.goto(`${L.prefix}/clients`);
      await expect(page.locator("h1")).toHaveText(L.prefix ? "عملاؤنا" : "Our clients");
      const logos = page.locator('[data-block-type="logo_wall"] img');
      expect(await logos.count()).toBeGreaterThanOrEqual(8);
      // Every logo shows at phone width too (the page is the full wall, not the strip).
      for (const img of await logos.all()) await expect(img).toBeVisible();
      await expect(page.locator('[data-block-type="booking"]')).toHaveCount(1);
    });

    test(`${L.prefix}/faq lists questions and emits FAQPage JSON-LD`, async ({ page }) => {
      await page.goto(`${L.prefix}/faq`);
      await expect(page.locator('[data-block-type="faq_ref"]')).toHaveCount(1);
      const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));
      expect(ld.some((d) => d["@type"] === "FAQPage" && d.mainEntity.length > 3)).toBe(true);
    });

    test(`${L.prefix}/blog returns 404 and is linked from nowhere while the blog is off`, async ({ page, request }) => {
      const res = await page.goto(`${L.prefix}/blog`);
      expect(res?.status()).toBe(404);
      for (const path of ["", "/about", "/contact"]) {
        await page.goto(`${L.prefix}${path}` || "/", { waitUntil: "domcontentloaded" });
        expect(await page.locator('header a[href*="/blog"], footer a[href*="/blog"]').count(), path).toBe(0);
      }
      const xml = await (await request.get("/sitemap.xml")).text();
      expect(xml).not.toContain("/blog");
    });

    // Ruling R3: kept routes. A permanent redirect, in one hop, to their v2 page in the same language.
    const KEPT: [string, string][] = [
      ["/careers", "/about"],
      ["/help", "/contact"],
      ["/partners", "/contact"],
      ["/webinars", "/demo"],
    ];
    for (const [from, to] of KEPT) {
      test(`${L.prefix}${from} redirects permanently to ${L.prefix}${to}`, async ({ page, request }) => {
        const hop = await request.get(`${L.prefix}${from}`, { maxRedirects: 0 });
        expect(hop.status()).toBe(308);
        expect(new URL(hop.headers()["location"], "http://x").pathname).toBe(`${L.prefix}${to}`);
        const res = await page.goto(`${L.prefix}${from}`);
        expect(res?.status()).toBe(200);
        expect(new URL(page.url()).pathname).toBe(`${L.prefix}${to}`);
        await expect(page.locator("html")).toHaveAttribute("lang", L.name);
        await hasV2Chrome(page, L.prefix);
      });
    }

    test(`${L.prefix}: footer links go straight to the page, never through a kept route`, async ({ page }) => {
      await page.goto(`${L.prefix}/about`);
      const hrefs = await page.locator("footer a[href]").evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
      expect(hrefs.length).toBeGreaterThan(0);
      for (const [from] of KEPT) {
        expect(hrefs.filter((h) => h === from || h === `${L.prefix}${from}` || h === `/ar${from}`), from).toEqual([]);
      }
    });

    test(`${L.prefix}/demo and ${L.prefix}/contact show validation errors in the page language`, async ({ page }) => {
      for (const path of ["/demo", "/contact"]) {
        await page.goto(`${L.prefix}${path}`);
        const id = path === "/demo" ? "fullName" : "name";
        const submit = page.locator("main form button[type=submit]");
        await submit.evaluate((el) => el.scrollIntoView({ block: "center" }));
        await submit.click();
        const error = page.locator(`#${id}-error`);
        await expect(error).toBeVisible();
        await expect(error).toHaveText(L.prefix ? "الاسم مطلوب" : "Name is required");
        await expect(page.locator(`#${id}`)).toHaveAttribute("aria-invalid", "true");
        if (path === "/demo") {
          await expect(page.locator("#consent-error")).toHaveText(
            L.prefix ? "يجب الموافقة على سياسة الخصوصية" : "You must agree to the privacy policy",
          );
        }
      }
    });
  });
}

test.describe("demo booking attribution", () => {
  test("/demo?sector=retail&role=owner preselects Retail and the lead records sector and role", async ({ page }, info) => {
    const problems = watchProblems(page);
    await page.goto("/demo?sector=retail&role=owner");
    const sector = page.locator("select#industry");
    await expect(sector).toHaveValue("indRetail");
    await expect(sector.locator("option:checked")).toHaveText("Retail and e-commerce");
    // The pre-v2 industries stay selectable next to the v2 sectors.
    const values = await sector.locator("option").evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
    for (const v of ["indConstruction", "indHealthcare", "indEducation", "indOther"]) expect(values).toContain(v);

    const email = `e2e-${info.project.name}-${Date.now()}@example.com`;
    await page.fill("#fullName", "E2E Attribution");
    await page.fill("#email", email);
    await page.fill("#phone", "0500000000");
    await page.fill("#company", "E2E Attribution Co");
    await page.selectOption("#jobTitle", "jobCeo");
    await page.selectOption("#country", "countrySaudi");
    // Click like a visitor: the size chip (its radio is visually hidden) and the
    // consent box, each scrolled clear of the fixed mobile bottom bar first.
    const chip = page.locator('label:has(input[name="companySize"][value="11-50"])');
    await chip.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await chip.click();
    await expect(page.locator('input[name="companySize"][value="11-50"]')).toBeChecked();
    const consent = page.locator('input[name="consent"]');
    await consent.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await consent.check();

    const submit = page.locator("main form button[type=submit]");
    await submit.evaluate((el) => el.scrollIntoView({ block: "center" }));
    const [req] = await Promise.all([
      page.waitForRequest((r) => r.url().endsWith("/api/leads/demo") && r.method() === "POST"),
      submit.click(),
    ]);
    const body = req.postDataJSON();
    expect(body.sector).toBe("retail");
    expect(body.role).toBe("owner");
    expect(body.industry).toBe("indRetail");
    const res = await req.response();
    expect(res?.status()).toBe(200);
    await expect(page.locator('[data-demo-success]')).toBeVisible();

    const db = testDb();
    try {
      const r = await db.query(`SELECT data FROM leads WHERE type = 'demo' AND data->>'email' = $1`, [email]);
      expect(r.rowCount).toBe(1);
      expect(r.rows[0].data.sector).toBe("retail");
      expect(r.rows[0].data.role).toBe("owner");
      await db.query(`DELETE FROM leads WHERE data->>'email' = $1`, [email]);
    } finally {
      await db.end();
    }
    expect(problems).toEqual([]);
  });

  test("/ar/demo?sector=logistics preselects Logistics in Arabic", async ({ page }) => {
    await page.goto("/ar/demo?sector=logistics");
    await expect(page.locator("select#industry")).toHaveValue("indLogistics");
    await expect(page.locator("select#industry option:checked")).toHaveText("الخدمات اللوجستية والأساطيل");
  });

  test("an unknown sector leaves the field for the visitor to choose", async ({ page }) => {
    for (const q of ["?sector=RetailBasic&role=owner", "?sector=%3Cscript%3E", ""]) {
      await page.goto(`/demo${q}`);
      await expect(page.locator("select#industry"), q).toHaveValue("");
    }
  });

  test("the form shows the demo_form heading from the CMS as the page H1", async ({ page }) => {
    await page.goto("/demo?sector=retail&role=owner");
    await expect(page.locator('[data-block-type="demo_form"] h1')).toHaveText("Book a demo");
    await expect(page.locator('[data-block-type="demo_form"] form')).toHaveCount(1);
  });
});

test.describe("contact form", () => {
  test("posts the unchanged contact payload to /api/leads/contact", async ({ page }, info) => {
    const problems = watchProblems(page);
    await page.goto("/contact");
    await expect(page.locator('[data-block-type="contact_info"] h1')).toBeVisible();
    const email = `e2e-contact-${info.project.name}-${Date.now()}@example.com`;
    await page.fill("#name", "E2E Contact");
    await page.fill("#email", email);
    await page.fill("#subject", "Question");
    await page.fill("#message", "A question about Odoo implementation.");
    const submit = page.locator("main form button[type=submit]");
    await submit.evaluate((el) => el.scrollIntoView({ block: "center" }));
    const [req] = await Promise.all([
      page.waitForRequest((r) => r.url().endsWith("/api/leads/contact") && r.method() === "POST"),
      submit.click(),
    ]);
    expect(Object.keys(req.postDataJSON()).sort()).toEqual(["email", "message", "name", "phone", "subject"]);
    expect((await req.response())?.status()).toBe(200);
    await expect(page.locator("[data-contact-success]")).toBeVisible();
    const db = testDb();
    try {
      await db.query(`DELETE FROM leads WHERE data->>'email' = $1`, [email]);
    } finally {
      await db.end();
    }
    expect(problems).toEqual([]);
  });
});
