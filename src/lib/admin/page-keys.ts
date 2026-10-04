/**
 * Page keys as the admin Pages editor shows them: label, group, public URL and
 * whether the page has editable blocks. Client-safe.
 *
 * Block pages: home, sector:<slug>, erp:<system>, product:<slug>, about,
 * contact, demo, faq, privacy-policy, terms (plus any other stored key).
 * SEO-only pages have their layout in code; only their page SEO is editable.
 */

const PAGE_KEY = /^[a-z0-9][a-z0-9:_-]{0,99}$/;

/** Index and fixed pages whose metadata comes from `page_seo` but whose body is not blocks. */
export const SEO_ONLY_PAGES = ["sectors", "products", "clients", "blog", "privacy"] as const;

const NAMES: Record<string, string> = {
  home: "Home",
  about: "About us",
  contact: "Contact",
  demo: "Book a demo",
  faq: "FAQ",
  "privacy-policy": "Website privacy policy",
  terms: "Terms and conditions",
  sectors: "Sectors index",
  products: "Products index",
  clients: "Clients",
  blog: "Blog",
  privacy: "App privacy policy (Falcon Valley)",
  "erp:falcon": "Falcon ERP",
  "erp:odoo": "Odoo",
};

export type PageGroup = "Main pages" | "Sectors" | "ERP" | "Products" | "Legal" | "Index pages (SEO only)" | "Other";

export const PAGE_GROUPS: PageGroup[] = [
  "Main pages",
  "Sectors",
  "ERP",
  "Products",
  "Legal",
  "Index pages (SEO only)",
  "Other",
];

function humanize(slug: string): string {
  const s = slug.replace(/[-_]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** A route param or query value as a page key (decodes "%3A"); null when it is not a valid key. */
export function decodePageKey(raw: string): string | null {
  let key = raw;
  try {
    key = decodeURIComponent(raw);
  } catch {
    return null;
  }
  return PAGE_KEY.test(key) ? key : null;
}

/** "sector:real-estate" -> ["sector", "real-estate"]; "about" -> ["about", undefined]. */
function splitKey(page: string): [string, string | undefined] {
  const at = page.indexOf(":");
  return at === -1 ? [page, undefined] : [page.slice(0, at), page.slice(at + 1)];
}

export function isSeoOnlyPage(page: string): boolean {
  return (SEO_ONLY_PAGES as readonly string[]).includes(page);
}

export function pageLabel(page: string): string {
  if (Object.hasOwn(NAMES, page)) return NAMES[page];
  const [prefix, rest] = splitKey(page);
  if (rest !== undefined) {
    if (prefix === "sector") return `${humanize(rest)} sector`;
    if (prefix === "product") return humanize(rest);
    if (prefix === "erp") return humanize(rest);
  }
  return humanize(page);
}

export function pageGroup(page: string): PageGroup {
  if (isSeoOnlyPage(page)) return "Index pages (SEO only)";
  if (page.startsWith("sector:")) return "Sectors";
  if (page.startsWith("erp:")) return "ERP";
  if (page.startsWith("product:")) return "Products";
  if (page === "privacy-policy" || page === "terms") return "Legal";
  if (["home", "about", "contact", "demo", "faq"].includes(page)) return "Main pages";
  return "Other";
}

/** Public path of a page in English ("/sectors/real-estate"), or null when it has none. */
export function publicPath(page: string): string | null {
  if (page === "home") return "/";
  const [prefix, rest] = splitKey(page);
  if (rest !== undefined) {
    if (prefix === "sector") return `/sectors/${rest}`;
    if (prefix === "erp") return `/erp/${rest}`;
    if (prefix === "product") return `/products/${rest}`;
    return null;
  }
  return `/${page}`;
}

/** The same path in Arabic. */
export function arabicPath(path: string): string {
  return path === "/" ? "/ar" : `/ar${path}`;
}

/** Admin editor URL of a page (the colon is URL-encoded). */
export function adminPageHref(page: string): string {
  return `/admin/pages/${encodeURIComponent(page)}`;
}
