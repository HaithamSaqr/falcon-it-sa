/**
 * Task 13b: the Snap Pixel loads only after the visitor accepts cookies.
 *
 * The local test database keeps Snap off (scripts/prepare-test-env.mjs). This
 * spec alone switches it on with a dummy pixel id and restores the row after.
 * Every request to a Snap host is intercepted and answered locally, so nothing
 * reaches Snap. It runs in its own project, after every other spec, because
 * the banner is site-wide while Snap is on.
 */
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { testDb } from "./test-db";

const SNAP_HOST = /(^|\.)(sc-static\.net|snapchat\.com|tapad\.com)$/;
const DUMMY_PIXEL = "00000000-0000-4000-8000-000000000000";
const YEAR_S = 365 * 24 * 60 * 60;

let saved: { enabled: boolean; pixel: string } | null = null;

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  const db = testDb();
  try {
    const r = await db.query("SELECT snapchat_enabled, snapchat_pixel_id FROM integrations WHERE id = 1");
    saved = { enabled: r.rows[0].snapchat_enabled, pixel: r.rows[0].snapchat_pixel_id };
    await db.query("UPDATE integrations SET snapchat_enabled = true, snapchat_pixel_id = $1 WHERE id = 1", [DUMMY_PIXEL]);
  } finally {
    await db.end();
  }
});

test.afterAll(async () => {
  const db = testDb();
  try {
    await db.query("UPDATE integrations SET snapchat_enabled = $1, snapchat_pixel_id = $2 WHERE id = 1", [
      saved?.enabled ?? false,
      saved?.pixel ?? "",
    ]);
  } finally {
    await db.end();
  }
});

/** Answers every Snap request locally and records it. */
async function interceptSnap(context: BrowserContext): Promise<string[]> {
  const hits: string[] = [];
  await context.route(
    (url) => SNAP_HOST.test(url.hostname),
    async (route) => {
      hits.push(route.request().url());
      const script = route.request().resourceType() === "script";
      await route.fulfill({
        status: 200,
        contentType: script ? "application/javascript" : "text/plain",
        body: script ? "window.__snapStub = (window.__snapStub || 0) + 1;" : "",
      });
    },
  );
  return hits;
}

const banner = (page: Page) => page.getByTestId("cookie-consent");
const snapScriptLoaded = (hits: string[]) => hits.some((u) => u.includes("sc-static.net/scevent.min.js"));

async function consentCookie(context: BrowserContext) {
  return (await context.cookies()).find((c) => c.name === "falcon_consent");
}

test("no Snap request before consent; Accept and Decline are equally prominent", async ({ page, context }) => {
  const hits = await interceptSnap(context);
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  const accept = banner(page).getByRole("button", { name: "Accept" });
  const decline = banner(page).getByRole("button", { name: "Decline" });
  const [a, d] = [await accept.boundingBox(), await decline.boundingBox()];
  expect(a && d).toBeTruthy();
  expect(Math.abs(a!.width - d!.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(a!.height - d!.height)).toBeLessThanOrEqual(1);
  expect(a!.height).toBeGreaterThan(43.5); // 44px target, sub-pixel rounding
  await expect(banner(page).getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy-policy");

  await page.waitForLoadState("networkidle");
  expect(hits).toEqual([]);
  expect(await page.content()).not.toContain("sc-static.net");
  expect(await page.evaluate(() => typeof (window as unknown as { snaptr?: unknown }).snaptr)).toBe("undefined");
  expect(await consentCookie(context)).toBeUndefined();
});

test("Accept loads the Snap script without a reload and remembers it for 12 months", async ({ page, context }) => {
  const hits = await interceptSnap(context);
  await page.goto("/sectors/retail");
  await page.evaluate(() => ((window as unknown as { __samePage: boolean }).__samePage = true));
  await banner(page).getByRole("button", { name: "Accept" }).click();

  await expect.poll(() => snapScriptLoaded(hits)).toBe(true);
  await expect(banner(page)).toBeHidden();
  expect(await page.evaluate(() => (window as unknown as { __samePage?: boolean }).__samePage)).toBe(true);
  expect(await page.evaluate(() => typeof (window as unknown as { snaptr?: unknown }).snaptr)).toBe("function");
  expect(await page.content()).toContain(DUMMY_PIXEL);

  const cookie = await consentCookie(context);
  expect(cookie?.value).toBe("granted");
  expect(cookie?.sameSite).toBe("Lax");
  const ttl = cookie!.expires - Date.now() / 1000;
  expect(ttl).toBeGreaterThan(YEAR_S - 3600);
  expect(ttl).toBeLessThan(YEAR_S + 3600);

  hits.length = 0;
  await page.reload();
  await expect.poll(() => snapScriptLoaded(hits)).toBe(true);
  await expect(banner(page)).toBeHidden();
});

test("Decline loads nothing, and the choice survives a reload", async ({ page, context }) => {
  const hits = await interceptSnap(context);
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Decline" }).click();
  await expect(banner(page)).toBeHidden();
  expect((await consentCookie(context))?.value).toBe("denied");

  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(banner(page)).toBeHidden();
  expect(hits).toEqual([]);
  expect(await page.content()).not.toContain("sc-static.net");
});

test("Cookie settings in the footer reopens the banner, and it works from the keyboard", async ({ page, context }) => {
  const hits = await interceptSnap(context);
  const base = test.info().project.use.baseURL ?? "http://localhost:3100";
  await context.addCookies([{ name: "falcon_consent", value: "denied", url: base }]);
  await page.goto("/sectors/retail");
  await expect(banner(page)).toBeHidden();

  // The compact sector footer and the full footer both carry the link.
  const settings = page.getByRole("button", { name: "Cookie settings" });
  await settings.focus();
  await page.keyboard.press("Enter");
  await expect(banner(page)).toBeVisible();
  // Focus moves into the banner, so a keyboard user lands on the choice.
  await expect
    .poll(() => page.evaluate(() => !!document.activeElement?.closest("[data-testid=cookie-consent]")))
    .toBe(true);
  await banner(page).getByRole("button", { name: "Accept" }).focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => snapScriptLoaded(hits)).toBe(true);
  await expect(banner(page)).toBeHidden();
  // Focus returns to the footer link.
  await expect(settings).toBeFocused();

  await page.goto("/");
  await expect(page.getByRole("button", { name: "Cookie settings" })).toBeVisible();
});

test("on phones the banner sits above the bottom bar and leaves its buttons usable", async ({ page, context }) => {
  await interceptSnap(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const bar = page.getByTestId("mobile-bottom-bar");
  await expect(bar).toBeVisible();
  await expect(banner(page)).toBeVisible();
  const [bn, br] = [await banner(page).boundingBox(), await bar.boundingBox()];
  expect(bn!.y + bn!.height).toBeLessThanOrEqual(br!.y);
  expect(bn!.x).toBeGreaterThanOrEqual(0);
  expect(bn!.x + bn!.width).toBeLessThanOrEqual(390);
  // The bar's CTAs are the top element at their centre (nothing covers them).
  for (const link of await bar.getByRole("link").all()) {
    const box = (await link.boundingBox())!;
    const onTop = await page.evaluate(
      ([x, y]) => !!document.elementFromPoint(x, y)?.closest("[data-testid=mobile-bottom-bar]"),
      [box.x + box.width / 2, box.y + box.height / 2],
    );
    expect(onTop).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("Arabic banner on /ar, with the Arabic privacy link", async ({ page, context }) => {
  const hits = await interceptSnap(context);
  await page.goto("/ar");
  await expect(banner(page)).toBeVisible();
  await expect(banner(page).getByRole("button", { name: "موافق" })).toBeVisible();
  await expect(banner(page).getByRole("button", { name: "رفض" })).toBeVisible();
  await expect(banner(page).getByRole("link", { name: "سياسة الخصوصية" })).toHaveAttribute("href", "/ar/privacy-policy");
  await expect(page.getByRole("button", { name: "إعدادات ملفات تعريف الارتباط" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(hits).toEqual([]);
});
