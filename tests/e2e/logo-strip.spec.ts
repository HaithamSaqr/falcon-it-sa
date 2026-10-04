/**
 * Client logo strip: every client logo in a slow CSS marquee (two copies for a
 * seamless loop), drifting toward the reading end in each language, paused on
 * hover and focus, and still and wrapped under reduced motion. The clients page
 * is the full wall.
 *
 * The e2e database has an empty `clients` table, so the bundled set shows.
 */
import { expect, test, type Page } from "@playwright/test";
import { V2_CLIENT_LOGOS } from "../../src/lib/blocks/seed/clients";

const STRIP = '[data-block-type="logo_wall"]';
const COUNT = V2_CLIENT_LOGOS.length;

async function strip(page: Page, url: string) {
  await page.goto(url);
  const s = page.locator(STRIP).first();
  await s.scrollIntoViewIfNeeded();
  return s;
}

const trackX = (page: Page) =>
  page.locator(`${STRIP} .v2-marquee-track`).first().evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);

for (const url of ["/", "/sectors/trading"]) {
  test(`${url}: the strip carries every client logo, twice, the copy hidden from assistive tech`, async ({ page }) => {
    const s = await strip(page, url);
    const lists = s.locator("[data-marquee] ul");
    await expect(lists).toHaveCount(2);
    await expect(lists.nth(0).locator("img")).toHaveCount(COUNT);
    await expect(lists.nth(1).locator("img")).toHaveCount(COUNT);
    await expect(lists.nth(1)).toHaveAttribute("aria-hidden", "true");
    const alts = await lists.nth(0).locator("img").evaluateAll((els) => els.map((e) => e.getAttribute("alt")));
    expect(alts).toEqual(V2_CLIENT_LOGOS.map((l) => l.name.en));
    // Full colour, full strength.
    const style = await lists.nth(0).locator("img").first().evaluate((el) => {
      const cs = getComputedStyle(el);
      return { filter: cs.filter, opacity: cs.opacity };
    });
    expect(style).toEqual({ filter: "none", opacity: "1" });
  });
}

test("the strip drifts left in English and right in Arabic, and pauses on hover", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Pointer hover is a desktop check");
  await strip(page, "/");
  await expect(page.locator(`${STRIP} .v2-marquee-track`)).toHaveCSS("animation-name", "v2-marquee");
  const a = await trackX(page);
  await page.waitForTimeout(700);
  expect(await trackX(page)).toBeLessThan(a);

  await page.locator(`${STRIP} [data-marquee]`).hover();
  await expect(page.locator(`${STRIP} .v2-marquee-track`)).toHaveCSS("animation-play-state", "paused");
  const p = await trackX(page);
  await page.waitForTimeout(500);
  expect(await trackX(page)).toBe(p);

  await strip(page, "/ar");
  await page.mouse.move(0, 0);
  await expect(page.locator(`${STRIP} .v2-marquee-track`)).toHaveCSS("animation-name", "v2-marquee-rtl");
  const b = await trackX(page);
  await page.waitForTimeout(700);
  expect(await trackX(page)).toBeGreaterThan(b);
});

test("keyboard focus pauses the strip", async ({ page }) => {
  await strip(page, "/");
  const marquee = page.locator(`${STRIP} [data-marquee]`);
  await marquee.focus();
  await expect(page.locator(`${STRIP} .v2-marquee-track`)).toHaveCSS("animation-play-state", "paused");
});

test("every strip logo loads up front, so none pops in as it drifts into sight", async ({ page }) => {
  await strip(page, "/");
  const marquee = page.locator(`${STRIP} [data-marquee]`);
  const unloadedInSight = () =>
    marquee.evaluate((root) => {
      const box = root.getBoundingClientRect();
      return [...root.querySelectorAll("img")].filter((el) => {
        const r = el.getBoundingClientRect();
        const inSight = r.right > box.left && r.left < box.right;
        const img = el as HTMLImageElement;
        return inSight && !(img.complete && img.naturalWidth > 0);
      }).length;
    });
  const loaded = () =>
    marquee.evaluate((root) => [...root.querySelectorAll("img")].filter((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0).length);
  await expect.poll(loaded, { timeout: 20_000 }).toBe(COUNT * 2);
  expect(await unloadedInSight()).toBe(0);
  // Still true a few seconds of drift later.
  await page.waitForTimeout(3000);
  expect(await unloadedInSight()).toBe(0);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  for (const url of ["/", "/ar"]) {
    test(`${url}: the strip stands still and wraps every logo into view`, async ({ page }) => {
      const s = await strip(page, url);
      const track = s.locator(".v2-marquee-track");
      await expect(track).toHaveCSS("animation-name", "none");
      await expect(s.locator("[data-marquee-copy]")).toBeHidden();
      const first = s.locator("[data-marquee] ul").first();
      // Wrapped: several rows, nothing clipped sideways.
      const box = (await first.boundingBox())!;
      expect(box.height).toBeGreaterThan(100);
      const vw = page.viewportSize()!.width;
      for (const img of await first.locator("img").all()) {
        const b = (await img.boundingBox())!;
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width).toBeLessThanOrEqual(vw);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    });
  }
});

for (const prefix of ["", "/ar"]) {
  test(`${prefix}/clients shows every client logo in the wall`, async ({ page }) => {
    await page.goto(`${prefix}/clients`);
    const imgs = page.locator(`${STRIP} img`);
    await expect(imgs).toHaveCount(COUNT);
    for (const img of await imgs.all()) await expect(img).toBeVisible();
    const alts = await imgs.evaluateAll((els) => els.map((e) => e.getAttribute("alt")));
    expect(alts).toEqual(V2_CLIENT_LOGOS.map((l) => (prefix ? l.name.ar : l.name.en)));
  });
}

for (const prefix of ["", "/ar"]) {
  test(`${prefix}/about shows the logo strip right under the hero`, async ({ page }) => {
    await page.goto(`${prefix}/about`);
    const types = await page.locator("main [data-block-type]").evaluateAll((els) => els.map((e) => e.getAttribute("data-block-type")));
    expect(types.slice(0, 2)).toEqual(["hero", "logo_wall"]);
    // The after-hero strip: page tone, no top padding, the marquee.
    const strip = page.locator(STRIP).first();
    await expect(strip).toHaveCSS("padding-top", /^(0px|8px)$/);
    await expect(strip.locator("[data-marquee]")).toHaveCount(1);
  });
}
