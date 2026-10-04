import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { localeUrls, publicRoutes, routeSlug } from "../../scripts/qa/public-routes.mjs";

/**
 * QA (Task 13): full-page screenshots of every public route, English and
 * Arabic, at 1440 and 390 wide, into qa/screens/ (gitignored). The route list
 * comes from the server's sitemap. Then `node scripts/qa/contact-sheet.mjs`
 * builds qa/screens/review.html.
 *
 * Opt-in (heavy): QA_SCREENS=1 E2E_BASE_URL=http://localhost:3200 npx playwright test screens --project=desktop
 */

const OUT = path.join(process.cwd(), "qa", "screens");
const WIDTHS = [
  { width: 1440, height: 900, mobile: false },
  { width: 390, height: 844, mobile: true },
] as const;

test.skip(!process.env.QA_SCREENS, "Set QA_SCREENS=1 to take the QA screenshots");

for (const w of WIDTHS) {
  for (const locale of ["en", "ar"] as const) {
    test(`screens ${locale} ${w.width}`, async ({ browser, baseURL }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "Runs once, in the desktop project");
      test.setTimeout(20 * 60_000);
      fs.mkdirSync(OUT, { recursive: true });

      const routes = await publicRoutes(baseURL!);
      expect(routes.length).toBeGreaterThan(15);
      fs.writeFileSync(path.join(OUT, "routes.json"), JSON.stringify(routes, null, 2));
      const context = await browser.newContext({
        viewport: { width: w.width, height: w.height },
        isMobile: w.mobile,
        hasTouch: w.mobile,
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      try {
        for (const route of routes) {
          const url = localeUrls(route)[locale];
          const res = await page.goto(url, { waitUntil: "networkidle" });
          expect(res?.status(), url).toBe(200);
          // Load lazy images: walk down the page, then back to the top.
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 120));
            }
            window.scrollTo(0, 0);
          });
          await page.waitForLoadState("networkidle");
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(900); // hero entrance (720ms) settles
          await page.screenshot({
            path: path.join(OUT, `${routeSlug(route)}__${locale}__${w.width}.png`),
            fullPage: true,
          });
        }
      } finally {
        await context.close();
      }
    });
  }
}
