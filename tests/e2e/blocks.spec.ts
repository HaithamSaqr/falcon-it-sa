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

test("hydrates without mismatches or page errors", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && /hydrat|did not match|Each child in a list/i.test(m.text())) problems.push(m.text().slice(0, 200));
  });
  await page.goto(only("/dev-blocks", "home", "sector:real-estate", "fixtures", "faq", "contact"));
  await page.waitForLoadState("networkidle");
  expect(problems).toEqual([]);
});

test("dev-blocks is not indexable", async ({ page }) => {
  await page.goto(only("/dev-blocks", "terms"));
  await expect(page.locator('[data-page="terms"]')).toBeAttached();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
