/**
 * v2 seed content per page. `seedPageBlocks()` (src/lib/db/migrate.ts) inserts
 * a page's seed only when that page has never been seeded or edited, and
 * `getPageBlocks()` falls back to it when the database is unreachable.
 *
 * One file per page.
 */
import type { Bi } from "../bi";
import type { BlockContentMap } from "../types";
import type { SeedBlock } from "./helpers";
import { HOME_SEED } from "./home";
import { SECTOR_REAL_ESTATE_SEED } from "./sector-real-estate";
import { SECTOR_MANUFACTURING_SEED } from "./sector-manufacturing";
import { SECTOR_TRADING_SEED } from "./sector-trading";
import { SECTOR_HOSPITALITY_SEED } from "./sector-hospitality";
import { SECTOR_RETAIL_SEED } from "./sector-retail";
import { SECTOR_LOGISTICS_SEED } from "./sector-logistics";
import { SECTOR_PROFESSIONAL_SERVICES_SEED } from "./sector-professional-services";
import { ERP_FALCON_SEED } from "./erp-falcon";
import { ERP_ODOO_SEED } from "./erp-odoo";
import { PRODUCT_SERVER_MANAGEMENT_SEED } from "./product-server-management";
import { PRODUCT_DATA_MANAGEMENT_SEED } from "./product-data-management";
import { PRODUCT_APPLICATIONS_SEED } from "./product-applications";
import { ABOUT_SEED } from "./about";
import { CONTACT_SEED } from "./contact";
import { DEMO_SEED } from "./demo";
import { FAQ_SEED } from "./faq";
import { PRIVACY_POLICY_SEED } from "./privacy-policy";
import { TERMS_SEED } from "./terms";

export type { SeedBlock } from "./helpers";

export const SEED: Record<string, SeedBlock[]> = {
  home: HOME_SEED,
  "sector:real-estate": SECTOR_REAL_ESTATE_SEED,
  "sector:manufacturing": SECTOR_MANUFACTURING_SEED,
  "sector:trading": SECTOR_TRADING_SEED,
  "sector:hospitality": SECTOR_HOSPITALITY_SEED,
  "sector:retail": SECTOR_RETAIL_SEED,
  "sector:logistics": SECTOR_LOGISTICS_SEED,
  "sector:professional-services": SECTOR_PROFESSIONAL_SERVICES_SEED,
  "erp:falcon": ERP_FALCON_SEED,
  "erp:odoo": ERP_ODOO_SEED,
  "product:server-management": PRODUCT_SERVER_MANAGEMENT_SEED,
  "product:data-management": PRODUCT_DATA_MANAGEMENT_SEED,
  "product:applications": PRODUCT_APPLICATIONS_SEED,
  about: ABOUT_SEED,
  contact: CONTACT_SEED,
  demo: DEMO_SEED,
  faq: FAQ_SEED,
  "privacy-policy": PRIVACY_POLICY_SEED,
  terms: TERMS_SEED,
};

/** Page keys in a stable order (admin page list). */
export const SEED_PAGES: readonly string[] = Object.keys(SEED);

/** Title and subtitle of a page's seeded hero, for fallback page metadata. */
export function seedHero(page: string): { title: Bi; subtitle: Bi } | null {
  const hero = SEED[page]?.find((x) => x.type === "hero");
  if (!hero) return null;
  const { title, subtitle } = hero.content as BlockContentMap["hero"];
  return { title, subtitle };
}
