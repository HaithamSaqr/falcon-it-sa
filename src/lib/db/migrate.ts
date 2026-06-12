/**
 * One-time-per-process readiness: create all tables, migrate any legacy
 * `singletons` JSON into the new relational tables, seed defaults where empty,
 * then drop the legacy JSON store. Idempotent (safe to run repeatedly).
 */

import type { Pool } from "pg";
import { ensureSchema } from "./schema";
import {
  writeSettings,
  writeContent,
  writeIntegrations,
  writeBranches,
  readBranches,
  writeSeo,
  writeFooterLinks,
  writeSectors,
  writePricingBase,
  writeProducts,
  seedBrochures,
  backfillClientTags,
  seedHome,
  seedContentExtras,
  backfillProductCardImages,
  countAdmins,
  createAdmin,
} from "./store";
import {
  DEFAULT_SETTINGS,
  DEFAULT_CONTENT,
  DEFAULT_INTEGRATIONS,
  DEFAULT_SEO,
  DEFAULT_FOOTER_LINKS,
  DEFAULT_SECTORS,
  DEFAULT_PRICING_BASE,
  DEFAULT_PRODUCTS,
  DEFAULT_BROCHURES,
} from "./defaults";
import type { SiteSettings, SiteContent, IntegrationSettings } from "@/types/admin";

async function tableExists(pool: Pool, name: string): Promise<boolean> {
  const r = await pool.query(`SELECT to_regclass($1) AS t`, [`public.${name}`]);
  return r.rows[0]?.t != null;
}

async function rowCount(pool: Pool, name: string): Promise<number> {
  const r = await pool.query(`SELECT count(*)::int AS n FROM ${name}`);
  return r.rows[0]?.n ?? 0;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mergeSettings(s: any): SiteSettings {
  return {
    company: {
      ...DEFAULT_SETTINGS.company,
      ...s?.company,
      name: { ...DEFAULT_SETTINGS.company.name, ...s?.company?.name },
      phone: { ...DEFAULT_SETTINGS.company.phone, ...s?.company?.phone },
      branches: Array.isArray(s?.company?.branches) && s.company.branches.length
        ? s.company.branches
        : DEFAULT_SETTINGS.company.branches,
    },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...s?.notifications },
    social: { ...DEFAULT_SETTINGS.social, ...s?.social },
    loginUrl: s?.loginUrl ?? DEFAULT_SETTINGS.loginUrl,
    whatsappRouting: s?.whatsappRouting ?? DEFAULT_SETTINGS.whatsappRouting,
    landingCta: s?.landingCta ?? DEFAULT_SETTINGS.landingCta,
    regional: { ...DEFAULT_SETTINGS.regional, ...s?.regional },
    security: { ...DEFAULT_SETTINGS.security, ...s?.security },
  };
}

function mergeContent(c: any): SiteContent {
  return {
    hero: {
      en: { ...DEFAULT_CONTENT.hero.en, ...c?.hero?.en },
      ar: { ...DEFAULT_CONTENT.hero.ar, ...c?.hero?.ar },
    },
    testimonials: Array.isArray(c?.testimonials) ? c.testimonials : DEFAULT_CONTENT.testimonials,
    faqs: Array.isArray(c?.faqs) ? c.faqs : DEFAULT_CONTENT.faqs,
    stats: Array.isArray(c?.stats) && c.stats.length ? c.stats : DEFAULT_CONTENT.stats,
  };
}

function mergeIntegrations(ig: any): IntegrationSettings {
  const odoo = { ...DEFAULT_INTEGRATIONS.odoo, ...ig?.odoo };
  // Carry a legacy password over to the new apiKey field if needed.
  if (!odoo.apiKey && ig?.odoo?.password) odoo.apiKey = ig.odoo.password;
  return {
    odoo,
    ai: { ...DEFAULT_INTEGRATIONS.ai, ...ig?.ai },
    calendar: { ...DEFAULT_INTEGRATIONS.calendar, ...ig?.calendar },
    email: { ...DEFAULT_INTEGRATIONS.email, ...ig?.email },
    whatsapp: { ...DEFAULT_INTEGRATIONS.whatsapp, ...ig?.whatsapp },
    helpdesk: { ...DEFAULT_INTEGRATIONS.helpdesk, ...ig?.helpdesk },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function ensureReady(pool: Pool): Promise<void> {
  await ensureSchema(pool);

  // Pull any legacy JSON documents.
  const legacy: { settings?: any; content?: any; integrations?: any } = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (await tableExists(pool, "singletons")) {
    const res = await pool.query(`SELECT key, value FROM singletons`);
    for (const row of res.rows) legacy[row.key as "settings" | "content" | "integrations"] = row.value;
  }

  // ── Settings (single row) ──
  if ((await rowCount(pool, "site_settings")) === 0) {
    await writeSettings(pool, mergeSettings(legacy.settings ?? DEFAULT_SETTINGS));
  }

  // ── Admin user (migrate from legacy security if present) ──
  if ((await countAdmins(pool)) === 0) {
    const sec = legacy.settings?.security;
    if (sec?.adminUsername && sec?.adminPasswordHash) {
      await createAdmin(pool, sec.adminUsername, sec.adminPasswordHash);
    }
  }

  // ── Branches ──
  if ((await readBranches(pool)).length === 0) {
    const legacyBranches = legacy.settings?.company?.branches;
    const branches =
      Array.isArray(legacyBranches) && legacyBranches.length
        ? legacyBranches
        : DEFAULT_SETTINGS.company.branches;
    await writeBranches(pool, branches);
  }

  // ── Content (hero row is the init flag) ──
  if ((await rowCount(pool, "hero_content")) === 0) {
    await writeContent(pool, mergeContent(legacy.content ?? DEFAULT_CONTENT));
  }

  // ── Integrations (single row) ──
  if ((await rowCount(pool, "integrations")) === 0) {
    await writeIntegrations(pool, mergeIntegrations(legacy.integrations ?? DEFAULT_INTEGRATIONS));
  }

  // ── SEO (single row) ──
  if ((await rowCount(pool, "seo_settings")) === 0) {
    await writeSeo(pool, DEFAULT_SEO);
  }

  // ── Footer links ──
  if ((await rowCount(pool, "footer_links")) === 0) {
    await writeFooterLinks(pool, DEFAULT_FOOTER_LINKS);
  }

  // ── Sectors ──
  if ((await rowCount(pool, "sectors")) === 0) {
    await writeSectors(pool, DEFAULT_SECTORS);
  }

  // ── Base pricing ──
  if ((await rowCount(pool, "pricing_base")) === 0) {
    await writePricingBase(pool, DEFAULT_PRICING_BASE);
  }

  // ── Products ──
  if ((await rowCount(pool, "products")) === 0) {
    await writeProducts(pool, DEFAULT_PRODUCTS);
  }

  // ── Default brochures for new products (only if not already present) ──
  await seedBrochures(pool, DEFAULT_BROCHURES);

  // ── Home page content (cards + text + backfill new hero columns) ──
  await seedHome(pool);

  // ── Testimonials + FAQs (seed defaults only if those tables are empty) ──
  await seedContentExtras(pool);

  // ── Product "Trio" card images (backfill the 3 seeded products if blank) ──
  await backfillProductCardImages(pool);

  // ── Client tags: create definitions for any tags already used by clients ──
  await backfillClientTags(pool);

  // ── Retire the legacy JSON store ──
  await pool.query(`DROP TABLE IF EXISTS singletons`);
}
