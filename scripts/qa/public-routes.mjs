/**
 * QA helper: every public route of a running server, without locale prefix.
 * Built from the server's own sitemap.xml (so it follows the enabled sectors,
 * products and the blog flag) plus the public pages the sitemap leaves out on
 * purpose (/privacy, the app policy, and enabled product brochures).
 */

/** Always public, though not in the sitemap. */
const REQUIRED = ["/privacy"];
/** Public only while enabled in the database (brochures); included when they answer 200. */
const OPTIONAL = ["/brochure/server-management", "/brochure/data-management"];

/** `/ar/x` -> `/x`, `/ar` -> `/`. */
function stripLocale(path) {
  if (path === "/ar" || path === "/en") return "/";
  return path.replace(/^\/(ar|en)(?=\/)/, "");
}

/**
 * Unprefixed paths in sitemap order: every sitemap path and /privacy (callers
 * must check that each answers 200), plus the optional brochure pages that
 * currently answer 200.
 */
export async function publicRoutes(baseURL) {
  const xml = await (await fetch(new URL("/sitemap.xml", baseURL))).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => stripLocale(new URL(m[1]).pathname));
  const routes = [...new Set([...paths, ...REQUIRED])];
  for (const path of OPTIONAL) {
    const res = await fetch(new URL(path, baseURL), { redirect: "manual" });
    if (res.status === 200 && !routes.includes(path)) routes.push(path);
  }
  return routes;
}

/** The two locale URLs of an unprefixed path. */
export function localeUrls(path) {
  return { en: path, ar: path === "/" ? "/ar" : `/ar${path}` };
}

/** File-name slug for a path: `/` -> `home`, `/sectors/retail` -> `sectors-retail`. */
export function routeSlug(path) {
  return path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
}
