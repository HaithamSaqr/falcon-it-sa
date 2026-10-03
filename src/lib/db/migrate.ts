/**
 * One-time-per-process readiness: create all tables, migrate any legacy
 * `singletons` JSON into the new relational tables, seed defaults where empty,
 * then drop the legacy JSON store. Idempotent (safe to run repeatedly).
 */

import type { Pool, PoolClient } from "pg";
import { ensureSchema } from "./schema";
import { withTransaction } from "./tx";
import { SEED } from "@/lib/blocks/seed";
import type { SeedBlock } from "@/lib/blocks/seed";
import { V2_SECTORS, V2_SECTOR_SLUGS } from "@/lib/blocks/seed/sectors";
import { insertBlocks, lockPage, markPageSeeded, pageSeededKey } from "@/lib/blocks/db";
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
    clientsSpeed: typeof s?.clientsSpeed === "number" ? s.clientsSpeed : DEFAULT_SETTINGS.clientsSpeed,
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
    google: { ...DEFAULT_INTEGRATIONS.google, ...ig?.google },
    snapchat: { ...DEFAULT_INTEGRATIONS.snapchat, ...ig?.snapchat },
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

  // ── v2: one-off data fixes, then page content seeds ──
  await runDataFixes(pool);
  await seedPageBlocks(pool);
}

// ═══════════════════════════════════════════════════════════════════
// v2 one-off data fixes
// ═══════════════════════════════════════════════════════════════════

/**
 * Run `fix` once per database. The `data_fixes` row and the fix commit in the
 * same transaction, under an advisory lock, so concurrent boots cannot apply a
 * fix twice and a failed fix leaves nothing behind (it is retried next boot).
 */
async function runOnce(pool: Pool, key: string, fix: (c: PoolClient) => Promise<void>): Promise<void> {
  await withTransaction(pool, async (client) => {
    await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [key]);
    const done = await client.query(`SELECT 1 FROM data_fixes WHERE key = $1`, [key]);
    if (done.rowCount === 0) {
      await fix(client);
      await client.query(`INSERT INTO data_fixes (key) VALUES ($1)`, [key]);
    }
  });
}

/**
 * Keep the seven v2 sectors on their existing slugs (insert any that are
 * missing), give them their v2 names, photos and promises, and disable every
 * other sector row (RetailBasic, construction, healthcare, ...). Nothing is
 * deleted; old titles and descriptions are left as they are.
 */
async function fixSectorSlugs(c: PoolClient): Promise<void> {
  for (let i = 0; i < V2_SECTORS.length; i++) {
    const s = V2_SECTORS[i];
    await c.query(
      `INSERT INTO sectors (id, name_en, name_ar, title_en, title_ar, systems, enabled, sort_order,
                            photo, short_promise_en, short_promise_ar)
       VALUES ($1, $2, $3, $2, $3, $4, true, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar,
         enabled = true, sort_order = EXCLUDED.sort_order, photo = EXCLUDED.photo,
         short_promise_en = EXCLUDED.short_promise_en, short_promise_ar = EXCLUDED.short_promise_ar`,
      [s.slug, s.name.en, s.name.ar, ["desktop", "cloud", "odoo"], i, s.photo, s.promise.en, s.promise.ar]
    );
  }
  // Exact (case-sensitive) match keeps only the seven canonical rows; any
  // other spelling such as "RetailBasic", "retailbasic" or "Retail" is disabled.
  await c.query(`UPDATE sectors SET enabled = false WHERE NOT (id = ANY($1::text[]))`, [V2_SECTOR_SLUGS]);
}

/** The applications brochure stays hidden until real content exists. */
async function fixApplicationsBrochure(c: PoolClient): Promise<void> {
  await c.query(`UPDATE product_brochures SET enabled = false, updated_at = now() WHERE slug = 'applications'`);
}

/** Hide the placeholder testimonials shipped in DEFAULT_CONTENT (matched by name and company). */
async function fixDemoTestimonials(c: PoolClient): Promise<void> {
  const demo = DEFAULT_CONTENT.testimonials;
  await c.query(
    `UPDATE testimonials t SET enabled = false
     FROM unnest($1::text[], $2::text[]) AS d(name, company)
     WHERE lower(trim(t.name)) = lower(d.name) AND lower(trim(t.company)) = lower(d.company)`,
    [demo.map((t) => t.name.toLowerCase()), demo.map((t) => t.company.toLowerCase())]
  );
}

const DATA_FIXES: [key: string, fix: (c: PoolClient) => Promise<void>][] = [
  ["v2-sector-slugs", fixSectorSlugs],
  ["v2-disable-applications-brochure", fixApplicationsBrochure],
  ["v2-disable-demo-testimonials", fixDemoTestimonials],
];

/** Apply every pending one-off fix. A failing fix is logged and retried next boot; it never blocks the site. */
export async function runDataFixes(pool: Pool): Promise<void> {
  for (const [key, fix] of DATA_FIXES) {
    try {
      await runOnce(pool, key, fix);
    } catch (err) {
      console.error(`[migrate] data fix "${key}" failed (will retry next boot):`, err);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// v2 page content seeds
// ═══════════════════════════════════════════════════════════════════

/**
 * Insert `SEED[page]` for every page that has never been seeded or saved by an
 * admin and has no rows. Admin edits are never overwritten: a page that was
 * seeded once (or saved, even to an empty list) is not refilled.
 */
export async function seedPageBlocks(pool: Pool, seed: Record<string, SeedBlock[]> = SEED): Promise<void> {
  for (const [page, blocks] of Object.entries(seed)) {
    if (blocks.length === 0) continue; // nothing to seed yet; do not mark the page
    try {
      // Connecting happens inside the try too: a seeding failure never rejects ensureReady.
      await withTransaction(pool, async (client) => {
        await lockPage(client, page);
        const marked = await client.query(`SELECT 1 FROM data_fixes WHERE key = $1`, [pageSeededKey(page)]);
        if (marked.rowCount === 0) {
          const existing = await client.query(`SELECT count(*)::int AS n FROM page_blocks WHERE page = $1`, [page]);
          if (existing.rows[0].n === 0) await insertBlocks(client, page, blocks);
          await markPageSeeded(client, page);
        }
      });
    } catch (err) {
      console.error(`[migrate] seeding page "${page}" failed (will retry next boot):`, err);
    }
  }
}
