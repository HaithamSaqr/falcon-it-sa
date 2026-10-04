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
import { logoWallDefaults } from "@/lib/blocks/schemas/logo_wall";
import { CLIENT_LOGOS, CLIENT_NAME_FIXES, clientLogoPath, newClientId } from "./client-logos";
import { HOME_SCREENS } from "@/lib/blocks/seed/home";
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
  DEFAULT_COMPANY_IDS,
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

/**
 * Sector pages use `title_en`/`title_ar` as the page <title>. Production still
 * holds the old default titles (the pre-v2 sector names), so move those to the
 * v2 names. A title is replaced only when it exactly equals an old default
 * title or name for that sector (per language); admin-written text is kept.
 */
async function fixSectorTitles(c: PoolClient): Promise<void> {
  for (const s of V2_SECTORS) {
    const old = DEFAULT_SECTORS.find((d) => d.id === s.slug);
    if (!old) continue;
    const oldEn = [...new Set([old.title.en, old.name.en])].filter(Boolean);
    const oldAr = [...new Set([old.title.ar, old.name.ar])].filter(Boolean);
    await c.query(
      `UPDATE sectors SET
         title_en = CASE WHEN title_en = ANY($2::text[]) THEN $4 ELSE title_en END,
         title_ar = CASE WHEN title_ar = ANY($3::text[]) THEN $5 ELSE title_ar END
       WHERE id = $1`,
      [s.slug, oldEn, oldAr, s.name.en, s.name.ar],
    );
  }
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

/**
 * Fill the unified national number and VAT number shown in the footer.
 * Only blanks are filled, so a value an admin already entered is kept.
 */
async function fixCompanyIds(c: PoolClient): Promise<void> {
  await c.query(
    `UPDATE site_settings SET
       cr_number  = CASE WHEN trim(cr_number)  = '' THEN $1 ELSE cr_number  END,
       vat_number = CASE WHEN trim(vat_number) = '' THEN $2 ELSE vat_number END
     WHERE id = 1`,
    [DEFAULT_COMPANY_IDS.crNumber, DEFAULT_COMPANY_IDS.vatNumber]
  );
}

/** Old default footer labels that move to sentence case (matched exactly, so admin edits are kept). */
const FOOTER_LABEL_FIXES: [id: string, from: string, to: string][] = [
  ["about", "About Us", "About us"],
  ["help", "Help Center", "Help center"],
  ["privacy", "Privacy Policy", "Privacy policy"],
  ["terms", "Terms of Service", "Terms of service"],
];

/**
 * The footer links to the website privacy policy (/privacy-policy); the app
 * policy stays at /privacy for the store listing. Untouched default labels
 * move to sentence case.
 */
async function fixFooterLinks(c: PoolClient): Promise<void> {
  for (const [id, from, to] of FOOTER_LABEL_FIXES) {
    await c.query(`UPDATE footer_links SET label_en = $3 WHERE id = $1 AND label_en = $2`, [id, from, to]);
  }
  await c.query(`UPDATE footer_links SET url = '/privacy-policy' WHERE id = 'privacy' AND url = '/privacy'`);
}

/**
 * The shipped brochure copy used em dashes (copy rule: none). Each pair swaps
 * one old default phrase for the new wording; anything an admin wrote around
 * it is kept, and an edited phrase simply no longer matches.
 */
export const BROCHURE_COPY_FIXES: readonly [from: string, to: string][] = [
  ["runs on — from a single server", "runs on, from a single server"],
  ["containerized platform — so your systems", "containerized platform, so your systems"],
  ["أعمالك — من خادم واحد", "أعمالك، من خادم واحد"],
  ["حاويات متكاملة — لتبقى", "حاويات متكاملة، لتبقى"],
  ["with confidence — from messy", "with confidence, from messy"],
  ["SAP and others) — accurately mapped", "SAP and others), accurately mapped"],
  ["بثقة — من الأنظمة", "بثقة، من الأنظمة"],
  ["وغيرها) — مع مطابقة", "وغيرها)، مع مطابقة"],
  ["your business needs — mobile, web and Odoo", "your business needs: mobile, web and Odoo"],
  ["Mobile apps — Android", "Mobile apps: Android"],
  ["exact processes — internal tools", "exact processes: internal tools"],
  ["تحتاجها أعمالك — جوال", "تحتاجها أعمالك: جوال"],
  ["تطبيقات الجوال — أندرويد", "تطبيقات الجوال: أندرويد"],
  ["بالضبط — أدوات", "بالضبط: أدوات"],
];

async function fixBrochureCopy(c: PoolClient): Promise<void> {
  for (const [from, to] of BROCHURE_COPY_FIXES) {
    await c.query(
      `UPDATE product_brochures
       SET content_en = replace(content_en, $1, $2), content_ar = replace(content_ar, $1, $2), updated_at = now()
       WHERE strpos(content_en, $1) > 0 OR strpos(content_ar, $1) > 0`,
      [from, to],
    );
  }
}

/** Logo strip `limit` values the seeds ever shipped (8 everywhere, 7 on real estate, 12 the block default). */
export const OLD_LOGO_WALL_LIMITS: readonly number[] = [7, 8, 12];

/** Logo strip headings the seeds ever shipped; several clients are outside Saudi Arabia. */
export const OLD_LOGO_WALL_HEADINGS = {
  en: [
    "Companies across Saudi Arabia run on ERPs our team implemented",
    "Companies across Saudi Arabia and Egypt run on ERPs our team implemented",
  ],
  ar: ["شركات في السعودية تعمل على أنظمة ERP طبّقها فريقنا", "شركات في السعودية ومصر تعمل على أنظمة ERP طبّقها فريقنا"],
} as const;

/**
 * The owner's full client logo set (src/lib/db/client-logos.ts):
 * - a production row still holding its original upload gets the cleaned logo,
 *   and its blank names are filled (an admin-changed logo means the row is left alone);
 * - known placeholder names are corrected only while they are exactly that pair;
 * - clients production does not have are added after the existing rows (only
 *   when the table has rows: an empty table already shows the bundled set);
 * - the logo strips on home, about and the sector pages show every logo
 *   (limit 60) where the limit is still a seeded value, and any logo_wall
 *   heading that is still the old "across Saudi Arabia" text gets the new one.
 * Nothing is deleted.
 */
async function fixClientLogos(c: PoolClient): Promise<void> {
  for (const l of CLIENT_LOGOS) {
    if (!l.prod) continue;
    await c.query(
      `UPDATE clients SET
         logo = $3,
         name_en = CASE WHEN trim(name_en) = '' THEN $4 ELSE name_en END,
         name_ar = CASE WHEN trim(name_ar) = '' THEN $5 ELSE name_ar END
       WHERE id = $1 AND logo = $2`,
      [l.prod.id, l.prod.upload, clientLogoPath(l.slug), l.name.en, l.name.ar],
    );
  }
  for (const f of CLIENT_NAME_FIXES) {
    await c.query(`UPDATE clients SET name_en = $4, name_ar = $5 WHERE id = $1 AND name_en = $2 AND name_ar = $3`, [
      f.id,
      f.from.en,
      f.from.ar,
      f.to.en,
      f.to.ar,
    ]);
  }

  const stats = await c.query(`SELECT count(*)::int AS n, coalesce(max(sort_order), -1)::int AS last FROM clients`);
  if (stats.rows[0].n > 0) {
    let sort = stats.rows[0].last + 1;
    for (const l of CLIENT_LOGOS) {
      if (l.prod) continue;
      const logo = clientLogoPath(l.slug);
      const r = await c.query(
        `INSERT INTO clients (id, name_en, name_ar, logo, tags, sort_order)
         SELECT $1, $2, $3, $4, '{}', $5
         WHERE NOT EXISTS (SELECT 1 FROM clients WHERE id = $1 OR logo = $4)`,
        [newClientId(l.slug), l.name.en, l.name.ar, logo, sort],
      );
      if (r.rowCount) sort++;
    }
  }

  const pages = await c.query(`SELECT DISTINCT page FROM page_blocks WHERE type = 'logo_wall' ORDER BY page`);
  for (const { page } of pages.rows) await lockPage(c, page);
  await c.query(
    `UPDATE page_blocks SET content = jsonb_set(content, '{limit}', '60'::jsonb), updated_at = now()
     WHERE type = 'logo_wall' AND (page IN ('home', 'about') OR page LIKE 'sector:%')
       AND jsonb_typeof(content->'limit') = 'number' AND (content->>'limit')::numeric = ANY($1::numeric[])`,
    [OLD_LOGO_WALL_LIMITS],
  );
  const heading = logoWallDefaults().heading;
  for (const lang of ["en", "ar"] as const) {
    await c.query(
      `UPDATE page_blocks SET content = jsonb_set(content, ARRAY['heading', $3::text], to_jsonb($2::text)), updated_at = now()
       WHERE type = 'logo_wall' AND content->'heading'->>$3 = ANY($1::text[])`,
      [OLD_LOGO_WALL_HEADINGS[lang], heading[lang], lang],
    );
  }
}

export const CLIENT_LOGOS_FIX_KEY = "v2-client-logos-2026-10";

/**
 * The home hero and departments images move from the scene photos to real
 * Falcon ERP screens. A block is changed only while its image is still the
 * old seeded photo; its alt text follows only where it is still exactly the
 * old seeded alt (per language), so admin-chosen images and words are kept.
 */
async function fixHomeScreens(c: PoolClient): Promise<void> {
  await lockPage(c, "home");
  const targets = [
    { type: "hero", image: ["card", "image"], alt: ["card", "alt"], screen: HOME_SCREENS.dashboard },
    { type: "departments", image: ["image"], alt: ["imageAlt"], screen: HOME_SCREENS.trialBalance },
  ];
  for (const t of targets) {
    for (const lang of ["en", "ar"] as const) {
      await c.query(
        `UPDATE page_blocks SET content = jsonb_set(content, $3::text[], to_jsonb($5::text)), updated_at = now()
         WHERE page = 'home' AND type = $1 AND content #>> $2::text[] = $6 AND content #>> $3::text[] = $4`,
        [t.type, t.image, [...t.alt, lang], t.screen.old.alt[lang], t.screen.alt[lang], t.screen.old.image],
      );
    }
    await c.query(
      `UPDATE page_blocks SET content = jsonb_set(content, $2::text[], to_jsonb($3::text)), updated_at = now()
       WHERE page = 'home' AND type = $1 AND content #>> $2::text[] = $4`,
      [t.type, t.image, t.screen.image, t.screen.old.image],
    );
  }
}

export const HOME_SCREENS_FIX_KEY = "v2-home-screens-2026-10";

const DATA_FIXES: [key: string, fix: (c: PoolClient) => Promise<void>][] = [
  ["v2-sector-slugs", fixSectorSlugs],
  ["v2-sector-titles", fixSectorTitles],
  ["v2-disable-applications-brochure", fixApplicationsBrochure],
  ["v2-disable-demo-testimonials", fixDemoTestimonials],
  ["v2-company-ids", fixCompanyIds],
  ["v2-footer-links", fixFooterLinks],
  ["v2-brochure-copy", fixBrochureCopy],
  [CLIENT_LOGOS_FIX_KEY, fixClientLogos],
  [HOME_SCREENS_FIX_KEY, fixHomeScreens],
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
