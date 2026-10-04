import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Task 7: the block renderer and its islands, exercised on the dev-only
 * `/dev-blocks` route. Each `[data-page]` group is one BlockRenderer call:
 * every SEED page, the populated `validFixtures` and the edge-case fixtures.
 * `?group=a,b` renders only those groups; the full gallery is large, so the
 * file runs serially and the full-page checks share one load per locale.
 */

test.describe.configure({ mode: "serial" });

const PATHS = ["/dev-blocks", "/ar/dev-blocks"] as const;

const group = (page: Page, key: string): Locator => page.locator(`[data-page="${key}"]`);

const only = (path: string, ...groups: string[]) => `${path}?group=${groups.map(encodeURIComponent).join(",")}`;

async function litStages(scope: Locator): Promise<string[]> {
  return scope
    .locator("[data-stage]")
    .evaluateAll((els) => els.filter((e) => e.getAttribute("data-lit") === "true").map((e) => e.getAttribute("data-stage") ?? ""));
}

for (const path of PATHS) {
  test.describe(`blocks on ${path}`, () => {
    // The full gallery is heavy in dev mode; the desktop project already checks
    // both widths (390 and 1440), so the mobile project skips these loads.
    test.skip(({ isMobile }) => isMobile, "full-gallery checks run once, in the desktop project, at both widths");
    test("every block has a heading or aria-label, no undefined, no empty images, FAQ JSON-LD, anchors", async ({ page }) => {
      test.setTimeout(120_000);
      await page.goto(path, { waitUntil: "domcontentloaded", timeout: 90_000 });

      const blocks = page.locator("[data-block-type]");
      expect(await blocks.count()).toBeGreaterThan(60);
      const missing = await blocks.evaluateAll((els) =>
        els
          .filter((el) => {
            if ((el.getAttribute("aria-label") ?? "").trim() !== "") return false;
            const heading = el.querySelector("h1, h2, h3");
            return !heading || (heading.textContent ?? "").trim() === "";
          })
          .map((el) => `${el.closest("[data-page]")?.getAttribute("data-page")}:${el.getAttribute("data-block-type")}`),
      );
      expect(missing).toEqual([]);

      const text = await page.locator("main").innerText();
      expect(text).not.toContain("undefined");
      expect(text).not.toContain("[object Object]");
      const badAttrs = await page.locator("main *").evaluateAll((els) =>
        els.flatMap((el) =>
          Array.from(el.attributes)
            .filter((a) => a.value.includes("undefined") || a.value.includes("[object"))
            .map((a) => `${el.tagName}.${a.name}=${a.value}`),
        ),
      );
      expect(badAttrs).toEqual([]);

      // Empty image fields (e.g. a product hero image "") render no <img>.
      expect(await page.locator('main img:not([src]), main img[src=""]').count()).toBe(0);

      // rich_text renders **bold** as <strong>, never the raw markers.
      expect(await group(page, "terms").locator("strong").count()).toBeGreaterThan(0);
      expect(await group(page, "terms").innerText()).not.toContain("**");

      const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(ld.some((s) => s.includes('"FAQPage"'))).toBe(true);
      await expect(group(page, "home").locator("#how")).toHaveCount(1);
      await expect(group(page, "sector:real-estate").locator("#cycle")).toHaveCount(1);
    });

    test("no horizontal scroll at 390 and 1440, even with a 140-character title and 12-item lists", async ({ page }) => {
      test.setTimeout(150_000);
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        // Layout does not wait for the gallery's images (their boxes are sized by CSS).
        await page.goto(path, { waitUntil: "domcontentloaded", timeout: 90_000 });
        await expect(group(page, "edge-long").locator("[data-block-type]").first()).toBeAttached();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `width ${width}`).toBeLessThanOrEqual(0);
      }
    });
  });
}

test("Arabic left blank shows the English text", async ({ page }) => {
  await page.goto(only("/ar/dev-blocks", "edge-blank-ar"));
  const edge = group(page, "edge-blank-ar");
  await expect(edge.getByText("English only heading").first()).toBeVisible();
  await expect(edge.getByText("English only paragraph").first()).toBeVisible();
  await expect(edge.getByText("Unknown icon keeps its slot")).toBeVisible();
});

test("role pills switch the lit stages, the promise and the booking link", async ({ page }) => {
  await page.goto(only("/dev-blocks", "sector:real-estate"));
  const re = group(page, "sector:real-estate");
  const dev = re.getByRole("radio", { name: "Developer" });
  const con = re.getByRole("radio", { name: "Contractor" });

  await expect(dev).toHaveAttribute("aria-checked", "true");
  await expect(con).toHaveAttribute("aria-checked", "false");
  expect(await litStages(re)).toEqual(["1", "2", "3", "4", "5", "6"]);
  await expect(re.locator("h1")).toHaveText("Know every unit's profit before you sell it.");
  const booking = re.locator('[data-block-type="booking"] a').first();
  await expect(booking).toHaveAttribute("href", /\/demo\?sector=real-estate&role=dev$/);

  await con.click();
  await expect(con).toHaveAttribute("aria-checked", "true");
  await expect(dev).toHaveAttribute("aria-checked", "false");
  await expect.poll(() => litStages(re)).toEqual(["2", "3", "6"]);
  await expect(re.locator("h1")).toHaveText("Claims on time. Margin you can see from site.");
  await expect(booking).toHaveAttribute("href", /\/demo\?sector=real-estate&role=con$/);
});

test("Arabic role pills light the contractor stages", async ({ page }) => {
  await page.goto(only("/ar/dev-blocks", "sector:real-estate"));
  const re = group(page, "sector:real-estate");
  await re.getByRole("radio", { name: "مقاول", exact: true }).click();
  await expect(re.getByRole("radio", { name: "مقاول", exact: true })).toHaveAttribute("aria-checked", "true");
  await expect.poll(() => litStages(re)).toEqual(["2", "3", "6"]);
  await expect(re.locator("h1")).toHaveText("مستخلصك في موعده، وهامشك أمامك.");
  await expect(re.locator('[data-block-type="booking"] a').first()).toHaveAttribute(
    "href",
    /^\/ar\/demo\?sector=real-estate&role=con$/,
  );
});

test("a role missing from summary or pains renders nothing for it, without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(only("/dev-blocks", "fixtures"));
  const fx = group(page, "fixtures");
  await fx.getByRole("radio", { name: "Broker" }).click();
  await expect(fx.getByRole("radio", { name: "Broker" })).toHaveAttribute("aria-checked", "true");
  // role_pains fixture has no "bro" entry: its section disappears.
  await expect(fx.locator('[data-block-type="role_pains"]')).toHaveCount(0);
  await fx.getByRole("radio", { name: "Contractor" }).click();
  // lifecycle summary fixture has no "con" entry; pains has one.
  await expect(fx.locator('[data-block-type="role_pains"]')).toHaveCount(1);
  await expect(fx.locator("[data-role-summary]")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("hero sector pills: none selected, select swaps subtitle not H1, reselect clears", async ({ page }) => {
  await page.goto(only("/dev-blocks", "home"));
  const hero = group(page, "home").locator('[data-block-type="hero"]');
  const pills = hero.getByRole("radio");
  await expect(pills).toHaveCount(4);
  for (const pill of await pills.all()) await expect(pill).toHaveAttribute("aria-checked", "false");

  const h1 = await hero.locator("h1").innerText();
  await hero.getByRole("radio", { name: "Manufacturing" }).click();
  await expect(hero.getByRole("radio", { name: "Manufacturing" })).toHaveAttribute("aria-checked", "true");
  await expect(hero.getByText("For factories: materials, production orders")).toBeVisible();
  await expect(hero.locator("[data-hero-tile] img")).toHaveAttribute("src", /photo-manufacturing/);
  expect(await hero.locator("h1").innerText()).toBe(h1);

  await hero.getByRole("radio", { name: "Manufacturing" }).click();
  for (const pill of await pills.all()) await expect(pill).toHaveAttribute("aria-checked", "false");
  await expect(hero.getByText("Accounting, inventory, sales, projects and e-invoicing")).toBeVisible();
});

test("primary CTAs point at the demo url", async ({ page }) => {
  await page.goto(only("/dev-blocks", "home"));
  const home = group(page, "home");
  await expect(home.locator('[data-block-type="hero"]').getByRole("link", { name: "Book a demo" })).toHaveAttribute("href", "/demo");
  await expect(home.locator('[data-block-type="booking"]').getByRole("link", { name: "Book a demo" })).toHaveAttribute("href", "/demo");
});

for (const path of PATHS) {
  test(`${path}: no console error or page error anywhere in the gallery`, async ({ page, isMobile }) => {
    test.skip(isMobile, "full-gallery check runs once, in the desktop project");
    // Nothing is allowlisted: missing images, hydration mismatches, key warnings
    // and React errors all count.
    test.setTimeout(150_000);
    const problems: string[] = [];
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") problems.push(`console: ${m.text().slice(0, 300)} @ ${m.location().url}`);
    });
    page.on("response", (r) => {
      if (r.status() >= 400) problems.push(`http ${r.status()}: ${r.url()}`);
    });
    await page.goto(path, { timeout: 120_000 });
    // Scroll the whole gallery so every lazy image is requested.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 25));
      }
    });
    await page.waitForLoadState("networkidle", { timeout: 60_000 });
    expect(problems).toEqual([]);
  });
}

test("text shown in the other language carries its own lang and dir", async ({ page }) => {
  await page.goto(only("/ar/dev-blocks", "edge-blank-ar"));
  const edge = group(page, "edge-blank-ar");
  await expect(edge.locator('[lang="en"][dir="ltr"]', { hasText: "English only heading" })).toHaveCount(1);
  await expect(edge.locator('[lang="en"][dir="ltr"]', { hasText: "English only paragraph" })).toHaveCount(1);
  // Visiting /ar stores the locale cookie; clear it so /dev-blocks stays English.
  await page.context().clearCookies();
  await page.goto(only("/dev-blocks", "edge-blank-ar"));
  await expect(group(page, "edge-blank-ar").locator('[lang="ar"][dir="rtl"]', { hasText: "عنوان بالعربية فقط" })).toHaveCount(1);
});

test("unlit stages keep readable text: no card-wide opacity, ink titles, muted descriptions", async ({ page }) => {
  await page.goto(only("/dev-blocks", "sector:real-estate"));
  const re = group(page, "sector:real-estate");
  await re.getByRole("radio", { name: "Contractor" }).click();
  await expect.poll(() => litStages(re)).toEqual(["2", "3", "6"]);
  const stage1 = re.locator('[data-stage="1"]');
  const styles = await stage1.evaluate((el) => ({
    opacity: getComputedStyle(el).opacity,
    title: getComputedStyle(el.querySelector("h3")!).color,
    text: getComputedStyle(el.querySelector("p")!).color,
    textOpacity: getComputedStyle(el.querySelector("p")!).opacity,
  }));
  expect(styles).toEqual({ opacity: "1", title: "rgb(11, 26, 51)", text: "rgb(91, 104, 128)", textOpacity: "1" });
});

test("FAQ items without an answer: no FAQPage JSON-LD for them, no accordion trigger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(only("/dev-blocks", "edge-blank-ar"));
  const edge = group(page, "edge-blank-ar");
  await expect(edge.locator('[data-block-type="faq_ref"]')).toHaveCount(1);
  await expect(edge.locator('script[type="application/ld+json"]')).toHaveCount(0);
  await expect(edge.getByText("A question nobody answered yet").filter({ visible: true })).toHaveCount(1);
  await expect(edge.locator("button", { hasText: "A question nobody answered yet" })).toHaveCount(0);
});

test("a role without content never hides the role switcher, and the sector hero always has an H1", async ({ page }) => {
  await page.goto(only("/dev-blocks", "edge-roles", "edge-hero-roles"));
  const pains = group(page, "edge-roles");
  await pains.getByRole("radio", { name: "Second role" }).click();
  await expect(pains.getByRole("radio", { name: "Second role" })).toHaveAttribute("aria-checked", "true");
  await expect(pains.locator('[data-block-type="role_pains"]')).toHaveCount(1);
  await expect(pains.locator('[data-block-type="role_pains"] h1, [data-block-type="role_pains"] h2').first()).toHaveText("Sound familiar?");

  const hero = group(page, "edge-hero-roles");
  await expect(hero.locator("h1")).toHaveText("Only the first role has a promise.");
  await hero.getByRole("radio", { name: "Second role" }).click();
  await expect(hero.getByRole("radio", { name: "Second role" })).toHaveAttribute("aria-checked", "true");
  await expect(hero.locator("h1")).toHaveText("Only the first role has a promise.");
});

test("hero pills with no visible label still name their radiogroup", async ({ page }) => {
  await page.goto(only("/ar/dev-blocks", "edge-blank-ar"));
  await expect(group(page, "edge-blank-ar").getByRole("radiogroup", { name: "القطاعات" })).toHaveCount(1);
  await page.context().clearCookies();
  await page.goto(only("/dev-blocks", "edge-blank-ar"));
  await expect(group(page, "edge-blank-ar").getByRole("radiogroup", { name: "Sectors" })).toHaveCount(1);
});

test("dev-blocks is not indexable", async ({ page }) => {
  await page.goto(only("/dev-blocks", "terms"));
  await expect(page.locator('[data-page="terms"]')).toBeAttached();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
