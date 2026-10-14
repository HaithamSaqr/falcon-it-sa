import crypto from "node:crypto";
import { expect, test } from "@playwright/test";
import { testDb } from "./test-db";
import { hashPassword } from "../../src/lib/password";

/**
 * The admin uploads a company profile PDF in Settings; the thank-you page
 * then offers it for download, and removing it hides the button again.
 * Changes a site-wide file, so it runs in the serial project at the end.
 * The admin user exists for this run only, with a random password.
 */

const USER = "e2e-profile-admin";
const PASSWORD = crypto.randomBytes(12).toString("hex");
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n", "latin1");

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

test("admin uploads the company profile and the thank-you page offers it for download", async ({ page }) => {
  test.setTimeout(120_000);

  // Public endpoints stay closed to anonymous writes.
  expect((await page.request.post("/api/admin/company-profile")).status()).toBe(401);

  await page.goto("/admin/login");
  await page.getByLabel("Username").fill(USER);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin");

  try {
    await page.goto("/admin/settings");
    const card = page.locator("[data-company-profile-card]");
    await expect(card).toBeVisible();

    // A non-PDF is refused.
    await card.locator('input[type="file"]').setInputFiles({ name: "profile.pdf", mimeType: "application/pdf", buffer: Buffer.from("not a pdf") });
    await expect(card).toContainText("not a valid PDF");

    await card.locator('input[type="file"]').setInputFiles({ name: "Falcon profile.pdf", mimeType: "application/pdf", buffer: PDF });
    await expect(card).toContainText("Company profile uploaded");
    await expect(card.getByRole("button", { name: "Remove" })).toBeVisible();

    // The download serves the PDF as an attachment.
    const res = await page.request.get("/api/company-profile");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("application/pdf");
    expect(res.headers()["content-disposition"]).toContain("attachment");
    expect((await res.body()).subarray(0, 5).toString("latin1")).toBe("%PDF-");

    for (const path of ["/thank-you?type=demo", "/ar/thank-you?type=contact"]) {
      await page.goto(path);
      const button = page.locator("[data-profile-download]");
      await expect(button, path).toBeVisible();
      await expect(button, path).toHaveAttribute("href", "/api/company-profile");
    }
  } finally {
    await page.request.delete("/api/admin/company-profile");
  }

  await page.goto("/thank-you?type=demo");
  await expect(page.locator("[data-profile-download]")).toHaveCount(0);
  expect((await page.request.get("/api/company-profile")).status()).toBe(404);
});
