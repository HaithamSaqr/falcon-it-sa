import crypto from "node:crypto";
import { expect, test } from "@playwright/test";
import { testDb } from "./test-db";
import { hashPassword } from "../../src/lib/password";

/**
 * Task 12: an admin edits the home hero title in the Pages editor and the
 * public page shows it. Changes the shared `home` page, so it runs in the
 * serial project after the desktop and mobile projects, and restores the
 * original blocks afterwards.
 *
 * The admin user is created in the local test database for this run only,
 * with a random password, and removed at the end.
 */

const USER = "e2e-pages-admin";
const PASSWORD = crypto.randomBytes(12).toString("hex");

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  const db = testDb();
  try {
    await db.query(
      `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [USER, hashPassword(PASSWORD)],
    );
  } finally {
    await db.end();
  }
});

test.afterAll(async () => {
  const db = testDb();
  try {
    await db.query(`DELETE FROM admin_users WHERE username = $1`, [USER]);
  } finally {
    await db.end();
  }
});

test("admin edits the home hero title; invalid content is refused and the public page shows the edit", async ({
  page,
}) => {
  test.setTimeout(180_000);

  await page.goto("/admin/login");
  await page.getByLabel("Username").fill(USER);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin");

  const original = (await (await page.request.get("/api/admin/pages/home")).json()).data;
  expect(Array.isArray(original) && original.length > 0).toBe(true);

  try {
    await page.goto("/admin/pages");
    await page.getByRole("link", { name: "Edit Home" }).click();
    await page.waitForURL("**/admin/pages/home");

    const hero = page.locator('[data-editor-block="hero"]').first();
    await hero.getByRole("button", { name: /^Edit block/ }).click();
    const en = hero.getByLabel("Title (English)", { exact: true });
    const ar = hero.getByLabel("Title (Arabic)", { exact: true });

    // Both languages empty: the editor refuses to save and names the field.
    await en.fill("");
    await ar.fill("");
    await page.getByRole("button", { name: "Save page" }).click();
    // (Next's route announcer is also an alert, so pick ours by its text.)
    const alert = page.getByRole("alert").filter({ hasText: "Nothing was saved" });
    await expect(alert).toContainText("Hero");
    await expect(alert).toContainText("Title: Enter text in English or Arabic");
    const unchanged = (await (await page.request.get("/api/admin/pages/home")).json()).data;
    expect(unchanged).toEqual(original);

    // English only: saves, and both locales show the English text.
    const headline = `Edited by the e2e test ${Date.now()}`;
    await en.fill(headline);
    await page.getByRole("button", { name: "Save page" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();

    await page.goto("/");
    await expect(page.locator("h1")).toHaveText(headline);
    await page.goto("/ar");
    await expect(page.locator("h1")).toHaveText(headline);
  } finally {
    const res = await page.request.put("/api/admin/pages/home", { data: { blocks: original } });
    expect(res.status()).toBe(200);
  }
});
