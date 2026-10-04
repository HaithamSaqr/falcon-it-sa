import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

/**
 * QA: full-page screenshots of the home and clients pages, English and
 * Arabic, at 1440 and 390 wide, into qa/screens/home/ (gitignored), and of
 * the about page (logo strip under the hero) into qa/screens/client-logos/.
 * The logo strip is caught mid-drift.
 *
 * Opt-in: QA_HOME_SHOTS=1 E2E_BASE_URL=http://localhost:3300 npx playwright test home-shots --project=desktop
 */
const OUT = path.join(process.cwd(), "qa", "screens", "home");
const LOGOS_OUT = path.join(process.cwd(), "qa", "screens", "client-logos");

test.skip(!process.env.QA_HOME_SHOTS, "Set QA_HOME_SHOTS=1 to take the home QA screenshots");

for (const w of [
  { width: 1440, height: 900, mobile: false },
  { width: 390, height: 844, mobile: true },
] as const) {
  test(`home and clients screenshots at ${w.width}`, async ({ browser }, info) => {
    test.skip(info.project.name !== "desktop", "Runs once, in the desktop project");
    test.setTimeout(5 * 60_000);
    fs.mkdirSync(OUT, { recursive: true });
    fs.mkdirSync(LOGOS_OUT, { recursive: true });
    const context = await browser.newContext({ viewport: { width: w.width, height: w.height }, isMobile: w.mobile, hasTouch: w.mobile });
    const page = await context.newPage();
    for (const locale of ["en", "ar"] as const) {
      for (const route of ["/", "/clients", "/about"]) {
        const url = locale === "ar" ? `/ar${route === "/" ? "" : route}` : route;
        expect((await page.goto(url, { waitUntil: "networkidle" }))?.status(), url).toBe(200);
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(1200);
        const name = route === "/" ? "home" : route.slice(1);
        const dir = route === "/about" ? LOGOS_OUT : OUT;
        await page.screenshot({ path: path.join(dir, `${name}__${locale}__${w.width}.png`), fullPage: true });
        if (route === "/") {
          await page.screenshot({ path: path.join(OUT, `home-fold__${locale}__${w.width}.png`) });
        }
      }
    }
    await context.close();
  });
}
