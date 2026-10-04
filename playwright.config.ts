import { defineConfig, devices } from "@playwright/test";

// Load the throwaway local test settings (PG* etc.) so the dev server we spawn
// below connects to the docker test database. Real env vars still win.
try {
  process.loadEnvFile(".env.test");
} catch {
  // .env.test missing: fall back to whatever is already in the environment.
}

/** Specs that change site-wide settings or shared page content; they run in their own project, last. */
const SITE_WIDE = /(blog-enabled|admin-pages)\.spec\.ts$/;

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const port = new URL(baseURL).port || "3100";

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
      testIgnore: SITE_WIDE,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      testIgnore: SITE_WIDE,
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
  ],
  webServer: {
    // prepare-test-env marks the app as installed against the test DB
    // (writes data/db-config.json from PG*), then the dev server starts.
    command: `node scripts/prepare-test-env.mjs && npx next dev -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { NEXT_TELEMETRY_DISABLED: "1" },
  },
});
