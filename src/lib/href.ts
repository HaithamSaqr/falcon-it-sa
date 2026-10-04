/**
 * Locale routes (`/demo`, `/sectors/x?y=1`) go through the locale-aware Link.
 * API routes and file paths (`/brochure.pdf`, `/images/v2/x.png`) are not pages,
 * so they must not get a locale prefix and stay plain anchors.
 * Client-safe: shared by the v2 Button and the client chrome islands.
 */
export function isLocaleRoute(href: string): boolean {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  const path = href.split(/[?#]/)[0];
  if (path === "/api" || path.startsWith("/api/")) return false;
  const last = path.split("/").pop() ?? "";
  return !/\.[A-Za-z0-9]+$/.test(last);
}

/** Absolute http(s) URLs open in a new tab. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
