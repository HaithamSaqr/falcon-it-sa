import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { KEPT_ROUTES } from "./src/lib/kept-routes";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Retired sector slugs (the pre-v2 seed). Three have a v2 home; the rest go to
 * the sectors index. Permanent, in both locales. Next answers `permanent: true`
 * with 308 (method-preserving), which search engines treat like 301.
 */
const SECTOR_MOVED: Record<string, string> = {
  RetailBasic: "retail",
  construction: "real-estate",
  "food-beverage": "hospitality",
};
const SECTOR_RETIRED = [
  "healthcare",
  "education",
  "automotive",
  "pharma",
  "agriculture",
  "energy",
  "fashion",
  "jewelry",
  "nonprofit",
];

/**
 * The three pre-v2 ERP product pages now live under /erp. Same rule as above:
 * permanent, both locales.
 */
const PRODUCT_MOVED: Record<string, string> = {
  "falcon-erp-desktop": "falcon",
  "falcon-cloud": "falcon",
  "odoo-services": "odoo",
};

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // The optimizer serves phones a smaller WebP instead of the 1400 px
    // original. Only the site's own images and admin uploads go through it
    // (src/lib/image-src.ts mirrors this list); the standalone Docker image
    // ships sharp for it.
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/api/uploads/**", search: "" },
    ],
  },
  async redirects() {
    return ["", "/ar"].flatMap((prefix) => [
      ...Object.entries(SECTOR_MOVED).map(([from, to]) => ({
        source: `${prefix}/sectors/${from}`,
        destination: `${prefix}/sectors/${to}`,
        permanent: true,
      })),
      ...SECTOR_RETIRED.map((from) => ({
        source: `${prefix}/sectors/${from}`,
        destination: `${prefix}/sectors`,
        permanent: true,
      })),
      ...Object.entries(PRODUCT_MOVED).map(([from, to]) => ({
        source: `${prefix}/products/${from}`,
        destination: `${prefix}/erp/${to}`,
        permanent: true,
      })),
      // Ruling R3: /careers, /help, /partners, /webinars (see src/lib/kept-routes.ts).
      ...Object.entries(KEPT_ROUTES).map(([from, to]) => ({
        source: `${prefix}${from}`,
        destination: `${prefix}${to}`,
        permanent: true,
      })),
    ]);
  },
};

export default withNextIntl(nextConfig);
