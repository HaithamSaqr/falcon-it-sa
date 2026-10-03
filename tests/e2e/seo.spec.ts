import { expect, test } from "@playwright/test";

/**
 * Task 6: SEO infrastructure on the real pages. The site origin is the
 * production default (NEXT_PUBLIC_SITE_URL is unset under test), so canonical,
 * hreflang and og:image are all absolute https://falcon-it.sa URLs.
 */

const ORIGIN = "https://falcon-it.sa";

// Next renders the root URL without its trailing slash (same URL either way).
const noSlash = (u: string | null) => (u ?? "").replace(/\/$/, "");

test("robots.txt and sitemap.xml return 200", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const body = await robots.text();
  expect(body).toContain("Disallow: /admin");
  expect(body).toContain("Disallow: /setup");
  expect(body).toContain("Disallow: /api");
  expect(body).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain(`<loc>${ORIGIN}/sectors/real-estate</loc>`);
  expect(xml).toContain(`<loc>${ORIGIN}/ar/sectors/real-estate</loc>`);
  expect(xml).toContain("hreflang");
  expect(xml).not.toContain("/blog");
});

for (const path of ["/", "/ar", "/demo", "/ar/demo", "/sectors/real-estate", "/ar/sectors/real-estate"]) {
  test(`${path}: one canonical, hreflang en/ar/x-default, absolute og:image`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    expect(noSlash(await canonical.getAttribute("href"))).toBe(`${ORIGIN}${path === "/" ? "" : path}`);

    const hreflang = async (lang: string) => {
      const l = page.locator(`link[rel="alternate"][hreflang="${lang}"]`);
      await expect(l).toHaveCount(1);
      return l.getAttribute("href");
    };
    const en = await hreflang("en");
    const ar = await hreflang("ar");
    const xDefault = await hreflang("x-default");
    expect(noSlash(en).startsWith(ORIGIN)).toBe(true);
    expect(ar?.startsWith(`${ORIGIN}/ar`)).toBe(true);
    expect(xDefault).toBe(en);

    const og = page.locator('meta[property="og:image"]');
    await expect(og).toHaveCount(1);
    expect(await og.getAttribute("content")).toMatch(/^https:\/\/falcon-it\.sa\//);
  });
}

test("organization JSON-LD is rendered once per page", async ({ page }) => {
  await page.goto("/");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const orgs = blocks.map((b) => JSON.parse(b)).filter((d) => d["@type"] === "Organization");
  expect(orgs).toHaveLength(1);
  expect(orgs[0].logo).toBe(`${ORIGIN}/images/v2/falcon-mark.png`);
  expect(JSON.stringify(orgs[0])).not.toMatch(/egypt|cairo/i);
});

test("titles of /, /demo and /sectors/real-estate are all different", async ({ page }) => {
  const titles: string[] = [];
  for (const path of ["/", "/demo", "/sectors/real-estate"]) {
    await page.goto(path);
    titles.push(await page.title());
  }
  expect(titles.every((t) => t.trim() !== "")).toBe(true);
  expect(new Set(titles).size).toBe(3);
});
