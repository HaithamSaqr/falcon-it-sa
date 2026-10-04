/**
 * Task 13b: photos and screenshots go through the Next image optimizer with
 * `sizes`, so phones download a small WebP instead of the 1400 px original.
 * Admin uploads under /api/uploads still display.
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const PHOTO = /\/images\/v2\/(photo|shot)-/;

for (const url of ["/", "/ar/sectors/real-estate", "/erp/falcon", "/about"]) {
  test(`${url}: every photo and screenshot is optimized and sized`, async ({ page }) => {
    await page.goto(url);
    const imgs = await page.locator("img").evaluateAll((els) =>
      els.map((el) => {
        const img = el as HTMLImageElement;
        return { src: img.getAttribute("src") ?? "", srcset: img.getAttribute("srcset") ?? "", sizes: img.getAttribute("sizes") ?? "" };
      }),
    );
    const photos = imgs.filter((i) => PHOTO.test(decodeURIComponent(i.src)));
    expect(photos.length, url).toBeGreaterThan(0);
    for (const i of photos) {
      expect(i.src, i.src).toContain("/_next/image?url=");
      expect(i.sizes, i.src).not.toBe("");
      expect(i.srcset, i.src).toMatch(/ \d+w(,|$)/);
    }
  });
}

test("the first photo on a phone is a small file, not the 1400 px original", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sectors/real-estate");
  const hero = page.locator("main img").first();
  await expect(hero).toBeVisible();
  await expect.poll(() => hero.evaluate((el) => (el as HTMLImageElement).currentSrc)).toContain("/_next/image");
  const current = await hero.evaluate((el) => (el as HTMLImageElement).currentSrc);
  const w = Number(new URL(current).searchParams.get("w"));
  expect(w).toBeLessThanOrEqual(828);
  expect(await hero.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test("the optimizer answers with WebP, smaller than the original", async ({ request }) => {
  const original = await request.get("/images/v2/photo-realestate.jpg");
  const res = await request.get("/_next/image?url=%2Fimages%2Fv2%2Fphoto-realestate.jpg&w=640&q=75", {
    headers: { accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
  });
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/webp");
  expect((await res.body()).length).toBeLessThan((await original.body()).length);
});

test.describe("uploads", () => {
  const dir = path.join(process.cwd(), "data", "uploads");
  // One file per worker: with fullyParallel the tests of this block (and of
  // each project) run in different workers, each with its own beforeAll and
  // afterAll, so one worker's afterAll must not delete another worker's file.
  let file = "";
  // 1x1 transparent PNG.
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64",
  );
  test.beforeAll(({}, info) => {
    file = `e2e-images-spec-${info.project.name}-${info.workerIndex}.png`;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, file), png);
  });
  test.afterAll(() => fs.rmSync(path.join(dir, file), { force: true }));

  test("an uploaded image is served directly and through the optimizer", async ({ request }) => {
    expect((await request.get(`/api/uploads/${file}`)).status()).toBe(200);
    const res = await request.get(`/_next/image?url=${encodeURIComponent(`/api/uploads/${file}`)}&w=64&q=75`, {
      headers: { accept: "image/webp,*/*" },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^image\//);
  });

  test("paths outside /images and /api/uploads are not optimized", async ({ request }) => {
    const res = await request.get("/_next/image?url=%2Fapi%2Fsettings%2Fpublic&w=64&q=75");
    expect(res.status()).toBe(400);
  });
});
