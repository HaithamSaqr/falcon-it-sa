import { defineConfig, devices } from "@playwright/test";

// Load the throwaway local test settings (PG* etc.) so the dev server we spawn
// below connects to the docker test database. Real env vars still win.
try {
  process.loadEnvFile(".env.test");
} catch {
  // .env.test missing: fall back to whatever is already in the environment.
}

/** Specs that change site-wide settings or shared page content; they run in their own project, last. */
const SITE_WIDE = /(blog-enabled|admin-pages|empty-listings)\.spec\.ts$/;
/** Switches the Snap Pixel on (dummy id, requests intercepted), which shows the cookie banner site-wide; runs alone, last. */
const CONSENT = /consent\.spec\.ts$/;

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const port = new URL(baseURL).port || "3100";
/**
 * Next runs one `next dev` per build directory. On any port but the default,
 * the e2e server builds into its own directory (under .next, gitignored), so
 * it can start while another dev server of this checkout is running, e.g.
 * E2E_BASE_URL=http://localhost:3300 npx playwright test. tsconfig.json already
 * lists its type folders, so Next does not rewrite it. NEXT_DIST_DIR overrides.
 */
const distDir = process.env.NEXT_DIST_DIR ?? (port === "3100" ? "" : ".next/e2e");

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  fullyParallel: true,
  // Every worker hits the one dev server below; past ~6 the first compiles of
  // each route queue up and page loads time out. E2E_WORKERS overrides.
  workers: Number(process.env.E2E_WORKERS) || 6,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: [SITE_WIDE, CONSENT],
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      testIgnore: [SITE_WIDE, CONSENT],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      // Flips site_settings.blog_enabled and edits the home blocks, so it runs
      // after the others.
      name: "blog-enabled",
      testMatch: SITE_WIDE,
      dependencies: ["desktop", "mobile"],
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "consent",
      testMatch: CONSENT,
      dependencies: ["blog-enabled"],
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    // prepare-test-env marks the app as installed against the test DB
    // (writes data/db-config.json from PG*), then the dev server starts.
    command: `node scripts/prepare-test-env.mjs && npx next dev -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { NEXT_TELEMETRY_DISABLED: "1", ...(distDir ? { NEXT_DIST_DIR: distDir } : {}) },
  },
});
