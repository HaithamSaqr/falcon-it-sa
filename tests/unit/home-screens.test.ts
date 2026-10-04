import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { HOME_SCREENS, HOME_SEED } from "@/lib/blocks/seed/home";
import { canOptimize, isScreenshot, screenshotSize } from "@/lib/image-src";
import { SCREEN_SIZES } from "@/lib/screen-sizes";

const content = (type: string) => HOME_SEED.find((b) => b.type === type)!.content as Record<string, unknown>;

describe("home page product screens", () => {
  it("seeds the dashboard in the hero and the trial balance beside the departments", () => {
    const hero = content("hero") as { card: { image: string; alt: unknown } };
    expect(hero.card.image).toBe("/images/v2/screen-dashboard.png");
    expect(hero.card.alt).toEqual(HOME_SCREENS.dashboard.alt);
    const dep = content("departments");
    expect(dep.image).toBe("/images/v2/screen-trial-balance.png");
    expect(dep.imageAlt).toEqual(HOME_SCREENS.trialBalance.alt);
  });

  it("describes the screens truthfully in both languages", () => {
    for (const s of [HOME_SCREENS.dashboard, HOME_SCREENS.trialBalance]) {
      expect(s.alt.en).toMatch(/^Falcon ERP desktop/);
      expect(s.alt.ar).toContain("فالكون ERP");
      expect(`${s.alt.en} ${s.alt.ar}`).not.toMatch(/laptop|monitor|Riyadh|لابتوب|الرياض/i);
    }
  });

  it("ships each screen whole (the full app window) at 1280 wide, with its size recorded, through the optimizer", async () => {
    for (const src of [HOME_SCREENS.dashboard.image, HOME_SCREENS.trialBalance.image]) {
      expect(isScreenshot(src)).toBe(true);
      expect(canOptimize(src)).toBe(true);
      const file = path.join(process.cwd(), "public", src);
      expect(fs.existsSync(file), src).toBe(true);
      const meta = await sharp(file).metadata();
      expect([meta.width, meta.height], src).toEqual([...SCREEN_SIZES[src]]);
      expect(screenshotSize(src)).toEqual(SCREEN_SIZES[src]);
      // The whole 2560x1354 window (title bar to content bottom), scaled by half.
      expect(meta.width).toBe(1280);
      expect(Math.abs(meta.height! / meta.width! - 1354 / 2560)).toBeLessThan(0.01);
    }
  });

  /** Pixels in an output rectangle that differ from a plain fill colour. */
  async function offPixels(src: string, rect: { left: number; top: number; width: number; height: number }, fill: number) {
    const { data, info } = await sharp(path.join(process.cwd(), "public", src)).extract(rect).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let off = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (Math.abs(data[i] - fill) > 3 || Math.abs(data[i + 1] - fill) > 3 || Math.abs(data[i + 2] - fill) > 3) off++;
    }
    return off;
  }

  it("paints over the dashboard's notifications list (employee names), leaving it blank", async () => {
    // Source x 19-465, y 323-1286, scaled by 1280/2560.
    expect(await offPixels(HOME_SCREENS.dashboard.image, { left: 12, top: 165, width: 218, height: 475 }, 255)).toBe(0);
  });

  it("shows no currency field on the trial balance (the Egyptian pound selector is painted over)", async () => {
    // Source x 1963-2111, y 270-302, scaled by 1280/2559.
    expect(await offPixels(HOME_SCREENS.trialBalance.image, { left: 984, top: 137, width: 70, height: 12 }, 240)).toBe(0);
  });

  it("leaves out the status bar with the phone numbers", async () => {
    for (const src of [HOME_SCREENS.dashboard.image, HOME_SCREENS.trialBalance.image]) {
      const meta = await sharp(path.join(process.cwd(), "public", src)).metadata();
      // The status bar starts at source y 1355; the screens end at 1354 (677 px at half scale).
      expect(meta.height! * 2).toBeLessThanOrEqual(1355);
    }
  });

  it("only treats the bundled screens as screenshots", () => {
    expect(isScreenshot("/images/v2/photo-hero-office.jpg")).toBe(false);
    expect(isScreenshot("/api/uploads/screen-1.png")).toBe(false);
    expect(isScreenshot("/images/v2/screen-a/b.png")).toBe(false);
  });
});
