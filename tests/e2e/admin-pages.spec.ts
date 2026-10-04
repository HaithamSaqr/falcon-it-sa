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

test("the editor warns before leaving with unsaved changes and keeps SEO edits across tabs", async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto("/admin/login");
  await page.getByLabel("Username").fill(USER);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin");

  // The legacy "Home Page" screen no longer reaches the v2 home: hidden from the sidebar, route kept.
  const sidebar = page.locator("aside nav");
  await expect(sidebar.getByRole("link", { name: "Pages" })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Home Page" })).toHaveCount(0);
  expect((await page.request.get("/admin/home")).status()).toBe(200);

  const original = (await (await page.request.get("/api/admin/pages/home")).json()).data;
  await page.goto("/admin/pages/home");
  const hero = page.locator('[data-editor-block="hero"]').first();
  await hero.getByRole("button", { name: /^Edit block/ }).click();
  await hero.getByLabel("Title (English)", { exact: true }).fill(`Unsaved draft ${Date.now()}`);
  await expect(page.getByText("Unsaved changes").first()).toBeVisible();

  // In-app link with unsaved block edits: the admin is asked, and "Cancel" stays.
  const messages: string[] = [];
  page.once("dialog", (d) => {
    messages.push(d.message());
    void d.dismiss();
  });
  await sidebar.getByRole("link", { name: "Leads" }).click();
  await expect.poll(() => messages.length).toBe(1);
  expect(messages[0]).toMatch(/unsaved changes/i);
  await expect(page).toHaveURL(/\/admin\/pages\/home$/);

  // SEO tab: an edit survives switching tabs and is flagged as unsaved.
  await page.getByRole("tab", { name: /Search and sharing/ }).click();
  const seoTitle = page.getByLabel("SEO title (English)", { exact: true });
  await seoTitle.fill("Draft SEO title");
  await page.getByRole("tab", { name: /Page content/ }).click();
  await expect(page.getByRole("tab", { name: /Search and sharing/ })).toContainText("Unsaved");
  await page.getByRole("tab", { name: /Search and sharing/ }).click();
  await expect(seoTitle).toHaveValue("Draft SEO title");

  // Accepting the prompt leaves without saving.
  page.once("dialog", (d) => void d.accept());
  await sidebar.getByRole("link", { name: "Pages" }).click();
  await page.waitForURL(/\/admin\/pages$/);
  const after = (await (await page.request.get("/api/admin/pages/home")).json()).data;
  expect(after).toEqual(original);
  const seo = (await (await page.request.get("/api/admin/page-seo?page=home")).json()).data;
  expect(seo.title.en).not.toBe("Draft SEO title");
});

test("leads list and brochure tabs still load (admin screens touched by the lint fixes)", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/admin/login");
  await page.getByLabel("Username").fill(USER);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin");

  // Leads: the list request goes out with the filters and the loading row goes away.
  const listed = page.waitForResponse((r) => r.url().includes("/api/admin/leads?") && r.status() === 200);
  await page.goto("/admin/leads");
  await listed;
  await expect(page.getByText(/^Loading/)).toHaveCount(0);

  // Brochures: switching products loads that product's brochure.
  await page.goto("/admin/brochures");
  const loaded = page.waitForResponse((r) => r.url().endsWith("/api/admin/brochures/data-management"));
  await page.getByRole("button", { name: "Data Management" }).click();
  await loaded;
  await expect(page.locator('input[value="Data Analysis & Migration"]')).toBeVisible();
});
