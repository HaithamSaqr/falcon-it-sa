/**
 * v2 seed content per page. `seedPageBlocks()` (src/lib/db/migrate.ts) inserts
 * a page's seed only when that page has never been seeded or edited, and
 * `getPageBlocks()` falls back to it when the database is unreachable.
 *
 * One file per page. Pages registered with `[]` get their copy in Task 3b.
 */
import type { SeedBlock } from "./helpers";
import { HOME_SEED } from "./home";
import { SECTOR_REAL_ESTATE_SEED } from "./sector-real-estate";

export type { SeedBlock } from "./helpers";

export const SEED: Record<string, SeedBlock[]> = {
  home: HOME_SEED,
  "sector:real-estate": SECTOR_REAL_ESTATE_SEED,
  "sector:manufacturing": [],
  "sector:trading": [],
  "sector:hospitality": [],
  "sector:retail": [],
  "sector:logistics": [],
  "sector:professional-services": [],
  "erp:falcon": [],
  "erp:odoo": [],
  "product:server-management": [],
  "product:data-management": [],
  "product:applications": [],
  about: [],
  contact: [],
  demo: [],
  faq: [],
  "privacy-policy": [],
  terms: [],
};

/** Page keys in a stable order (admin page list). */
export const SEED_PAGES: readonly string[] = Object.keys(SEED);
