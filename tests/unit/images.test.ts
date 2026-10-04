/**
 * Task 13b: the Next image optimizer is on for the site's own photos,
 * screenshots and uploads; anything else (an https URL from the admin, an SVG)
 * is served as it is, so it still displays.
 */
import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";
import { canOptimize } from "@/lib/image-src";

describe("canOptimize", () => {
  it("optimizes local images and uploads", () => {
    expect(canOptimize("/images/v2/photo-realestate.jpg")).toBe(true);
    expect(canOptimize("/images/v2/shot-sales-dashboard.jpg")).toBe(true);
    expect(canOptimize("/api/uploads/1712345678-logo.png")).toBe(true);
    expect(canOptimize("/api/uploads/photo.webp")).toBe(true);
  });

  it("leaves remote URLs, SVGs, query strings and other paths unoptimized", () => {
    expect(canOptimize("https://cdn.example.com/a.jpg")).toBe(false);
    expect(canOptimize("/api/uploads/logo.svg")).toBe(false);
    expect(canOptimize("/images/v2/logo.SVG")).toBe(false);
    expect(canOptimize("/images/v2/a.jpg?v=2")).toBe(false);
    expect(canOptimize("/uploads/a.jpg")).toBe(false);
    expect(canOptimize("")).toBe(false);
  });
});

describe("next.config images", () => {
  it("turns the optimizer on and limits it to /images and /api/uploads", () => {
    const images = nextConfig.images!;
    expect(images.unoptimized).toBeFalsy();
    expect(images.localPatterns).toEqual([
      { pathname: "/images/**", search: "" },
      { pathname: "/api/uploads/**", search: "" },
    ]);
  });
});
