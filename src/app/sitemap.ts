import type { MetadataRoute } from "next";
import { getProducts, getSectors, getSettings } from "@/lib/data-store";
import { pagesWithBlocks } from "@/lib/blocks/store";
import { V2_SECTORS } from "@/lib/blocks/seed/sectors";
import { ERP_PRODUCT_SLUGS } from "@/lib/public-chrome";
import { absoluteUrl, alternatesFor, localizedPath } from "@/lib/seo";

// Sectors, products and the blog toggle come from the database.
export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "/",
  "/sectors",
  "/erp/falcon",
  "/erp/odoo",
  "/about",
  "/contact",
  "/demo",
  "/faq",
  "/privacy-policy",
  "/terms",
  "/clients",
];

/** Supporting services that ship with the site (used when the product list cannot be read). */
const SUPPORT_PRODUCT_SLUGS = ["server-management", "data-management", "applications"];

async function orFallback<T>(read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch {
    return fallback;
  }
}

/** Never throws: with the database down it serves the static list plus the seed sectors. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, sectors, products] = await Promise.all([
    orFallback(() => getSettings(), null),
    orFallback(async () => (await getSectors(true)).map((s) => s.id), V2_SECTORS.map((s) => s.slug)),
    orFallback(
      async () =>
        (await getProducts(true)).map((p) => p.slug).filter((slug) => !ERP_PRODUCT_SLUGS.has(slug)),
      SUPPORT_PRODUCT_SLUGS,
    ),
  ]);
  // Enabled sectors and services with no blocks 404, so they stay out of the sitemap.
  const listable = await pagesWithBlocks([
    ...sectors.map((slug) => `sector:${slug}`),
    ...products.map((slug) => `product:${slug}`),
  ]);

  const paths = [
    ...STATIC_PATHS,
    ...sectors.filter((slug) => listable.has(`sector:${slug}`)).map((slug) => `/sectors/${slug}`),
    ...products.filter((slug) => listable.has(`product:${slug}`)).map((slug) => `/products/${slug}`),
    ...(settings?.blogEnabled === true ? ["/blog"] : []),
  ];

  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  for (const path of paths) {
    const { languages } = alternatesFor(path);
    for (const locale of ["en", "ar"] as const) {
      const url = absoluteUrl(localizedPath(path, locale));
      if (seen.has(url)) continue;
      seen.add(url);
      entries.push({ url, alternates: { languages } });
    }
  }
  return entries;
}
