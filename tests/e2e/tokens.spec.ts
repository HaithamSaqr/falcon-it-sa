import { expect, test } from "@playwright/test";

// next/font generates a hashed family name such as `__Schibsted_Grotesk_a1b2c3`
// (dev) or `Schibsted Grotesk` style variants; match on the family stem only.
const SCHIBSTED = /^["']?(__)?Schibsted[ _]Grotesk/i;
const ALEXANDRIA = /^["']?(__)?Alexandria/i;

async function bodyFont(page: import("@playwright/test").Page) {
  return page.evaluate(() => getComputedStyle(document.body).fontFamily);
}

test.describe("v2 fonts", () => {
  test("English body uses Schibsted Grotesk", async ({ page }) => {
    await page.goto("/");
    expect(await bodyFont(page)).toMatch(SCHIBSTED);
  });

  test("Arabic body uses Alexandria", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    expect(await bodyFont(page)).toMatch(ALEXANDRIA);
  });
});

test.describe("v2 tokens", () => {
  test("colour tokens resolve to the v2 palette", async ({ page }) => {
    await page.goto("/");
    const tokens = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      // The CSS pipeline may shorten #ffffff to #fff; compare in long form.
      const read = (n: string) =>
        s
          .getPropertyValue(n)
          .trim()
          .toLowerCase()
          .replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/, "#$1$1$2$2$3$3");
      return {
        page: read("--color-page"),
        surface: read("--color-surface"),
        ink: read("--color-ink"),
        body: read("--color-body"),
        muted: read("--color-muted"),
        brand: read("--color-brand"),
        brandDeep: read("--color-brand-deep"),
        sky: read("--color-sky"),
        odooTint: read("--color-odoo-tint"),
      };
    });
    expect(tokens).toEqual({
      page: "#f5f7fa",
      surface: "#ffffff",
      ink: "#0b1a33",
      body: "#3a4860",
      muted: "#5b6880",
      brand: "#1466c2",
      brandDeep: "#0d4f9e",
      sky: "#e4f0fb",
      odooTint: "#f6f1f5",
    });
  });
});

test.describe("hero entrance motion", () => {
  test("animates by default", async ({ page }) => {
    await page.goto("/");
    const name = await page
      .locator("h1")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe("rise");
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("hero heading has no animation", async ({ page }) => {
      await page.goto("/");
      const name = await page
        .locator("h1")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName);
      expect(name).toBe("none");
    });
  });
});
