import { SCREEN_SIZES } from "./screen-sizes";

/**
 * Which image sources go through the Next image optimizer (next.config.ts
 * `images.localPatterns`): the site's own files under /images/ and admin
 * uploads under /api/uploads/, without a query string. Anything else (an
 * https URL entered in admin, an SVG) is served as it is, so it still
 * displays. Client-safe (only a generated size table).
 */
export function canOptimize(src: string): boolean {
  if (!src.startsWith("/images/") && !src.startsWith("/api/uploads/")) return false;
  if (src.includes("?") || src.includes("#")) return false;
  return !/\.svg$/i.test(src);
}

/**
 * A real Falcon ERP screenshot (public/images/v2/screen-*.png). Frames show the
 * whole screen at its own aspect ratio (screenshotSize), on a white ground.
 */
export function isScreenshot(src: string): boolean {
  return /^\/images\/v2\/screen-[^/]+$/.test(src);
}

/** [width, height] of a bundled screen, so its frame takes the screen's own aspect ratio. */
export function screenshotSize(src: string): readonly [number, number] {
  return SCREEN_SIZES[src] ?? [1280, 720];
}
