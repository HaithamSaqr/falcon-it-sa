/**
 * The home page shows real Falcon ERP desktop screens (dashboard in the hero,
 * trial balance beside the departments) instead of scene photos, through the
 * image optimizer, with truthful alt text; the sector pills still swap the
 * hero card.
 */
import { expect, test } from "@playwright/test";
import { HOME_SCREENS } from "../../src/lib/blocks/seed/home";

for (const L of [
  { prefix: "", lang: "en" as const },
  { prefix: "/ar", lang: "ar" as const },
]) {
  test(`${L.prefix || "/"}: hero and departments show the real ERP screens`, async ({ page }) => {
    await page.goto(L.prefix || "/");
    const hero = page.locator('[data-block-type="hero"] img[src*="screen-dashboard"]');
    await expect(hero).toHaveCount(1);
    await expect(hero).toBeVisible();
    await expect(hero).toHaveAttribute("alt", HOME_SCREENS.dashboard.alt[L.lang]);
    await expect(hero).toHaveAttribute("src", /\/_next\/image\?url=/);
    await expect.poll(() => hero.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
    // Anchored at the top right, where the Arabic UI starts.
    expect(await hero.evaluate((el) => getComputedStyle(el).objectPosition)).toBe("100% 0%");

    const dep = page.locator('[data-block-type="departments"] img[src*="screen-trial-balance"]');
    await dep.scrollIntoViewIfNeeded();
    await expect(dep).toBeVisible();
    await expect(dep).toHaveAttribute("alt", HOME_SCREENS.trialBalance.alt[L.lang]);
    await expect.poll(() => dep.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);

    await expect(page.locator('main img[src*="photo-hero-laptop"], main img[src*="photo-hero-office"]')).toHaveCount(0);
  });
}

test("a sector pill still swaps the hero card while the dashboard stays", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator('[data-block-type="hero"]');
  await hero.getByRole("radio", { name: "Manufacturing" }).click();
  await expect(hero.locator('img[src*="photo-manufacturing"]')).toBeVisible();
  await expect(hero.locator('img[src*="screen-dashboard"]')).toBeVisible();
});
