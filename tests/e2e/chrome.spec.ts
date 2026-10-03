import { expect, test, type Page } from "@playwright/test";

/**
 * Task 5: v2 layout chrome. The footer and nav are server-rendered, so the
 * raw HTML (JavaScript disabled) already carries every column, the company
 * ids and no Egypt placeholder phone.
 */

const CR = "7049432656";
const VAT = "311410985900003";
const SECTOR_SLUGS = [
  "real-estate",
  "manufacturing",
  "trading",
  "hospitality",
  "retail",
  "logistics",
  "professional-services",
];

test.describe("server-rendered chrome (JavaScript disabled)", () => {
  test.use({ javaScriptEnabled: false });

  for (const path of ["/", "/ar"]) {
    test(`footer columns all have links on ${path}`, async ({ page }) => {
      await page.goto(path);
      const columns = page.locator("footer [data-footer-column]");
      expect(await columns.count()).toBeGreaterThanOrEqual(3);
      for (const column of await columns.all()) {
        expect(await column.locator("a[href]").count()).toBeGreaterThan(0);
      }
    });

    test(`footer shows the company ids on ${path}`, async ({ page }) => {
      await page.goto(path);
      const footer = page.locator("footer");
      await expect(footer).toContainText(CR);
      await expect(footer).toContainText(VAT);
      if (path === "/ar") {
        await expect(footer).toContainText(`الرقم الوطني الموحد ${CR}`);
        await expect(footer).toContainText(`الرقم الضريبي ${VAT}`);
      } else {
        await expect(footer).toContainText(`Unified national number ${CR}`);
        await expect(footer).toContainText(`VAT ${VAT}`);
      }
    });

    test(`nav lists the seven sectors and both ERPs on ${path}`, async ({ page }) => {
      await page.goto(path);
      const prefix = path === "/ar" ? "/ar" : "";
      const header = page.locator("header");
      for (const slug of SECTOR_SLUGS) {
        expect(await header.locator(`a[href="${prefix}/sectors/${slug}"]`).count(), slug).toBeGreaterThan(0);
      }
      for (const href of ["/sectors", "/erp/falcon", "/erp/odoo", "/about", "/contact"]) {
        expect(await header.locator(`a[href="${prefix}${href}"]`).count(), href).toBeGreaterThan(0);
      }
      // No pricing, no blog while blog_enabled is false.
      expect(await header.locator('a[href*="pricing"], a[href*="/blog"]').count()).toBe(0);
      expect(await page.locator('footer a[href*="/blog"]').count()).toBe(0);
    });
  }

  test("primary CTA is Book a demo to /demo in both languages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('header a[href="/demo"]', { hasText: "Book a demo" }).first()).toBeAttached();
    await page.goto("/ar");
    await expect(
      page.locator('header a[href="/ar/demo"]', { hasText: "احجز عرضًا تجريبيًا" }).first(),
    ).toBeAttached();
  });
});

test.describe("raw HTML", () => {
  for (const path of ["/", "/ar", "/contact", "/ar/contact", "/sectors/real-estate"]) {
    test(`${path} never contains the Egypt placeholder phone or an Egyptian WhatsApp link`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).not.toContain("+201000000000");
      expect(html).not.toContain("201000000000");
      expect(html).not.toMatch(/wa\.me\/(\+|00)?20/);
    });
  }

  test("footer HTML is complete before any client JavaScript runs", async ({ request }) => {
    const html = await (await request.get("/")).text();
    const footer = html.slice(html.indexOf("<footer"), html.indexOf("</footer>"));
    expect(footer).toContain(CR);
    expect(footer).toContain(VAT);
    expect(footer).toContain('href="/sectors/real-estate"');
    expect(footer).toContain('href="/erp/falcon"');
    expect(footer).toContain('href="/about"');
  });

  test("/api/settings/public still answers and hides Egypt", async ({ request }) => {
    const res = await request.get("/api/settings/public");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.company.crNumber).toBe(CR);
    expect(body.data.company.vatNumber).toBe(VAT);
    expect(body.data.sectors.length).toBe(7);
    expect(JSON.stringify(body)).not.toContain("201000000000");
  });
});

async function navBox(page: Page) {
  const nav = page.locator("header nav").first();
  await expect(nav).toBeVisible();
  const box = await nav.boundingBox();
  if (!box) throw new Error("nav has no box");
  return { nav, box };
}

test.describe("navbar layout", () => {
  for (const path of ["/", "/ar"]) {
    test(`is one line at 1024px on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 800 });
      await page.goto(path);
      const { nav, box } = await navBox(page);
      expect(box.height).toBeLessThanOrEqual(72);
      // Every visible link and the CTA sit inside the single row.
      const links = nav.locator("a:visible");
      expect(await links.count()).toBeGreaterThanOrEqual(7);
      for (const link of await links.all()) {
        const b = await link.boundingBox();
        expect(b).not.toBeNull();
        expect(b!.y).toBeGreaterThanOrEqual(box.y - 1);
        expect(b!.y + b!.height).toBeLessThanOrEqual(box.y + box.height + 1);
      }
      // No horizontal page scroll.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test(`is one line at 1440px on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      const { box } = await navBox(page);
      expect(box.height).toBeLessThanOrEqual(72);
    });
  }
});

test.describe("mobile sheet", () => {
  test("opens, traps focus and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Book a demo" })).toBeVisible();

    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      const inside = await dialog.evaluate((el) => el.contains(document.activeElement));
      expect(inside, `focus escaped the sheet after ${i + 1} tabs`).toBe(true);
    }
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Shift+Tab");
      const inside = await dialog.evaluate((el) => el.contains(document.activeElement));
      expect(inside).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("Arabic sheet opens from the RTL island", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ar");
    await page.getByRole("button", { name: "فتح القائمة" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "احجز عرضًا تجريبيًا" })).toBeVisible();
  });
});

test.describe("mobile bottom bar", () => {
  test("shows WhatsApp and Book a demo below lg", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const bar = page.getByTestId("mobile-bottom-bar");
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: "Book a demo" })).toHaveAttribute("href", "/demo");
    const wa = bar.getByRole("link", { name: /WhatsApp/ });
    await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/966/);
  });

  test("is hidden at desktop width, where the WhatsApp pill shows instead", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByTestId("mobile-bottom-bar")).toBeHidden();
    await expect(page.getByTestId("whatsapp-widget")).toBeVisible();
    await expect(page.getByTestId("whatsapp-widget")).toHaveAttribute("href", /^https:\/\/wa\.me\/966/);
  });
});

test.describe("language toggle", () => {
  test("goes from /sectors/real-estate to /ar/sectors/real-estate", async ({ page }) => {
    await page.goto("/sectors/real-estate");
    await page.locator('header a[lang="ar"]:visible').first().click();
    await expect(page).toHaveURL(/\/ar\/sectors\/real-estate$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("goes back to English from /ar/sectors/real-estate", async ({ page }) => {
    await page.goto("/ar/sectors/real-estate");
    await page.locator('header a[lang="en"]:visible').first().click();
    await expect(page).toHaveURL(/\/sectors\/real-estate$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
