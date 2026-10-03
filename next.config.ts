import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
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
    ]);
  },
};

export default withNextIntl(nextConfig);
