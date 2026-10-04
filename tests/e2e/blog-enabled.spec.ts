import { expect, test } from "@playwright/test";
import { testDb } from "./test-db";

/**
 * Task 11: the blog with `site_settings.blog_enabled` switched on. This flips
 * a site-wide flag, so it runs in its own Playwright project after the
 * desktop and mobile projects (which assert the blog is hidden), and always
 * switches the flag back off.
 */

async function setBlog(enabled: boolean) {
  const db = testDb();
  try {
    await db.query(`UPDATE site_settings SET blog_enabled = $1 WHERE id = 1`, [enabled]);
  } finally {
    await db.end();
  }
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => setBlog(true));
test.afterAll(async () => setBlog(false));

for (const prefix of ["", "/ar"]) {
  test(`${prefix}/blog renders with every image loading`, async ({ page }) => {
    const problems: string[] = [];
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") problems.push(`console: ${m.text().slice(0, 300)}`);
    });
    page.on("response", (r) => {
      if (r.status() >= 400) problems.push(`http ${r.status()}: ${r.url()}`);
    });

    const res = await page.goto(`${prefix}/blog`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.locator("footer [data-footer-column]").count()).toBeGreaterThanOrEqual(3);

    const imgs = page.locator("main img");
    expect(await imgs.count()).toBeGreaterThan(0);
    const srcs = await imgs.evaluateAll((els) => els.map((e) => e.getAttribute("src") ?? ""));
    for (const src of srcs) expect(src, src).not.toContain("/images/industry/");
    for (const img of await imgs.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }

    // Post dates follow the page language.
    const dates = await page.locator("main time").allTextContents();
    expect(dates.length).toBeGreaterThan(0);
    for (const d of dates) {
      if (prefix) expect(d).toMatch(/[؀-ۿ]/);
      else expect(d).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
    }

    const xml = await (await page.request.get("/sitemap.xml")).text();
    expect(xml).toContain("/blog");
    await page.waitForLoadState("networkidle");
    expect(problems).toEqual([]);
  });
}
