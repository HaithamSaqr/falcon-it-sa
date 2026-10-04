/**
 * Ruling R3: old routes that stay reachable but have no page of their own.
 * next.config.ts answers them with a permanent (308) redirect in both
 * locales, and footer links that still point at them are rewritten to the
 * destination so visitors never take the extra hop.
 *
 * No path aliases here: next.config.ts imports this file directly.
 */
export const KEPT_ROUTES: Readonly<Record<string, string>> = {
  "/careers": "/about",
  "/help": "/contact",
  "/partners": "/contact",
  "/webinars": "/demo",
};

/**
 * The final destination of an internal link to a kept route (`/careers`,
 * `/ar/careers`, `/en/help?x#y`), keeping its locale prefix, query and hash.
 * Any other URL comes back unchanged.
 */
export function resolveKeptRoute(url: string): string {
  const m = /^(\/(?:ar|en))?(\/[a-z]+)\/?([?#].*)?$/.exec((url ?? "").trim());
  if (!m) return url;
  const target = Object.hasOwn(KEPT_ROUTES, m[2]) ? KEPT_ROUTES[m[2]] : undefined;
  if (!target) return url;
  return `${m[1] ?? ""}${target}${m[3] ?? ""}`;
}
