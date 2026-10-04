import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { HOME_SCREENS, HOME_SEED } from "@/lib/blocks/seed/home";
import { canOptimize, isScreenshot } from "@/lib/image-src";

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

  it("ships each screen at twice its largest display size, through the optimizer", async () => {
    const want: [string, number, number][] = [
      [HOME_SCREENS.dashboard.image, 1120, 968],
      [HOME_SCREENS.trialBalance.image, 1160, 1120],
    ];
    for (const [src, w, h] of want) {
      expect(isScreenshot(src)).toBe(true);
      expect(canOptimize(src)).toBe(true);
      const file = path.join(process.cwd(), "public", src);
      expect(fs.existsSync(file), src).toBe(true);
      const meta = await sharp(file).metadata();
      expect([meta.width, meta.height], src).toEqual([w, h]);
    }
  });

  it("shows no currency field on the trial balance (the Egyptian pound selector is painted over)", async () => {
    // The field sat at source x 1963-2111, y 270-302: output x 542-696, y 67-100 (scale 1160/1119, crop at 1440,205).
    const { data, info } = await sharp(path.join(process.cwd(), "public", HOME_SCREENS.trialBalance.image))
      .extract({ left: 546, top: 70, width: 146, height: 28 })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let off = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (Math.abs(data[i] - 240) > 3 || Math.abs(data[i + 1] - 240) > 3 || Math.abs(data[i + 2] - 240) > 3) off++;
    }
    expect(off).toBe(0);
  });

  it("only treats the bundled screens as screenshots", () => {
    expect(isScreenshot("/images/v2/photo-hero-office.jpg")).toBe(false);
    expect(isScreenshot("/api/uploads/screen-1.png")).toBe(false);
    expect(isScreenshot("/images/v2/screen-a/b.png")).toBe(false);
  });
});
