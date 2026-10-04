/**
 * Task 13b: a localized 404 in the v2 chrome. notFound() under /ar shows the
 * Arabic page (lang="ar", dir="rtl") with a real 404 status; English
 * otherwise. Unknown paths inside a locale get the same page.
 */
import { expect, test } from "@playwright/test";

const CASES = [
  {
    url: "/ar/sectors/definitely-not-a-sector",
    lang: "ar",
    dir: "rtl",
    heading: "لم نعثر على هذه الصفحة.",
    links: [
      ["الصفحة الرئيسية", "/ar"],
      ["تصفّح القطاعات", "/ar/sectors"],
      ["احجز عرضًا تجريبيًا", "/ar/demo"],
    ],
  },
  {
    url: "/ar/no-such-page-xyz",
    lang: "ar",
    dir: "rtl",
    heading: "لم نعثر على هذه الصفحة.",
    links: [["الصفحة الرئيسية", "/ar"]],
  },
  {
    url: "/sectors/definitely-not-a-sector",
    lang: "en",
    dir: "ltr",
    heading: "This page could not be found.",
    links: [
      ["Go to the home page", "/"],
      ["See the sectors", "/sectors"],
      ["Book a demo", "/demo"],
    ],
  },
  {
    url: "/erp/not-a-system",
    lang: "en",
    dir: "ltr",
    heading: "This page could not be found.",
    links: [["See the sectors", "/sectors"]],
  },
] as const;

for (const c of CASES) {
  test(`${c.url} answers 404 with the ${c.lang} page in the v2 chrome`, async ({ page }) => {
    const res = await page.goto(c.url);
    expect(res?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("lang", c.lang);
    await expect(page.locator("html")).toHaveAttribute("dir", c.dir);
    const main = page.locator("main");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(c.heading);
    for (const [name, href] of c.links) {
      await expect(main.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
    }
    // v2 chrome: the site header and footer are there.
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => window.innerWidth),
    );
  });
}

test("the 404 response is localized in the HTML head and not indexed", async ({ request }) => {
  const ar = await (await request.get("/ar/no-such-page-xyz")).text();
  expect(ar).toContain("<title>الصفحة غير موجودة</title>");
  expect(ar).toMatch(/<meta name="robots" content="noindex"\/>/);
  const en = await (await request.get("/sectors/definitely-not-a-sector")).text();
  expect(en).toContain("<title>Page not found</title>");
});
