/**
 * Row ↔ type mappers. Pure functions that take a pg Pool and read/write the
 * relational tables, returning/accepting the existing SiteSettings / SiteContent
 * / IntegrationSettings shapes so the admin UI and API contracts stay unchanged.
 *
 * These take a Pool argument (rather than importing the global pool) so the
 * migration step can call them on the raw pool without recursing through
 * getPool()/ensureReady().
 */

import type { Pool } from "pg";
import type {
  Branch,
  SiteSettings,
  SiteContent,
  IntegrationSettings,
  SeoSettings,
  FooterLink,
  Sector,
  SectorSystem,
  PricingBase,
  SectorPricingOverride,
  Client,
  ClientTag,
  Product,
  ProductBrochure,
} from "@/types/admin";
import {
  DEFAULT_SETTINGS,
  DEFAULT_CONTENT,
  DEFAULT_INTEGRATIONS,
  DEFAULT_SEO,
  DEFAULT_PRICING_BASE,
} from "./defaults";

function newId(prefix: string): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${prefix}_${Math.floor(Math.random() * 1e9).toString(36)}`;
  }
}

// ── Branches ────────────────────────────────────────────────────────
export async function readBranches(pool: Pool): Promise<Branch[]> {
  const res = await pool.query(
    `SELECT id, name_en, name_ar, address_en, address_ar, phone
     FROM branches ORDER BY sort_order, created_at`
  );
  return res.rows.map((r) => ({
    id: r.id,
    name: { en: r.name_en, ar: r.name_ar },
    address: { en: r.address_en, ar: r.address_ar },
    phone: r.phone,
  }));
}

export async function writeBranches(pool: Pool, branches: Branch[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM branches");
    for (let i = 0; i < branches.length; i++) {
      const b = branches[i];
      await client.query(
        `INSERT INTO branches (id, name_en, name_ar, address_en, address_ar, phone, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          b.id || newId("br"),
          b.name?.en ?? "",
          b.name?.ar ?? "",
          b.address?.en ?? "",
          b.address?.ar ?? "",
          b.phone ?? "",
          i,
        ]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// ── Settings ────────────────────────────────────────────────────────
export async function readSettings(pool: Pool): Promise<SiteSettings> {
  const res = await pool.query(`SELECT * FROM site_settings WHERE id = 1`);
  const r = res.rows[0];
  const branches = await readBranches(pool);
  const admin = await pool.query(`SELECT username FROM admin_users ORDER BY id LIMIT 1`);
  const adminUsername = admin.rows[0]?.username ?? "";

  if (!r) {
    return {
      ...DEFAULT_SETTINGS,
      company: { ...DEFAULT_SETTINGS.company, branches },
      security: { ...DEFAULT_SETTINGS.security, adminUsername },
    };
  }

  return {
    company: {
      name: { en: r.company_name_en, ar: r.company_name_ar },
      email: r.company_email,
      phone: { ksa: r.phone_ksa, egypt: r.phone_egypt },
      whatsapp: r.whatsapp,
      branches,
    },
    notifications: {
      emailOnNewLead: r.notif_email_on_new_lead,
      salesEmail: r.notif_sales_email,
    },
    social: {
      linkedin: r.social_linkedin,
      twitter: r.social_twitter,
      facebook: r.social_facebook,
      instagram: r.social_instagram,
      youtube: r.social_youtube,
      tiktok: r.social_tiktok ?? "",
    },
    loginUrl: r.login_url || "https://falcon-valley.com",
    regional: { gulfOnly: r.gulf_only },
    security: {
      adminUsername,
      adminPassword: "",
      jwtSecret: r.jwt_secret,
      rateLimitMax: r.rate_limit_max,
      rateLimitWindowMs: r.rate_limit_window_ms,
    },
  };
}

/** Writes scalar settings + branches. Admin credentials live in admin_users. */
export async function writeSettings(pool: Pool, s: SiteSettings): Promise<void> {
  await pool.query(
    `INSERT INTO site_settings (
       id, company_name_en, company_name_ar, company_email, phone_ksa, phone_egypt,
       whatsapp, gulf_only, notif_email_on_new_lead, notif_sales_email,
       social_linkedin, social_twitter, social_facebook, social_instagram, social_youtube,
       social_tiktok, login_url, jwt_secret, rate_limit_max, rate_limit_window_ms
     ) VALUES (1, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     ON CONFLICT (id) DO UPDATE SET
       company_name_en = EXCLUDED.company_name_en,
       company_name_ar = EXCLUDED.company_name_ar,
       company_email = EXCLUDED.company_email,
       phone_ksa = EXCLUDED.phone_ksa,
       phone_egypt = EXCLUDED.phone_egypt,
       whatsapp = EXCLUDED.whatsapp,
       gulf_only = EXCLUDED.gulf_only,
       notif_email_on_new_lead = EXCLUDED.notif_email_on_new_lead,
       notif_sales_email = EXCLUDED.notif_sales_email,
       social_linkedin = EXCLUDED.social_linkedin,
       social_twitter = EXCLUDED.social_twitter,
       social_facebook = EXCLUDED.social_facebook,
       social_instagram = EXCLUDED.social_instagram,
       social_youtube = EXCLUDED.social_youtube,
       social_tiktok = EXCLUDED.social_tiktok,
       login_url = EXCLUDED.login_url,
       jwt_secret = EXCLUDED.jwt_secret,
       rate_limit_max = EXCLUDED.rate_limit_max,
       rate_limit_window_ms = EXCLUDED.rate_limit_window_ms`,
    [
      s.company.name.en, s.company.name.ar, s.company.email,
      s.company.phone.ksa, s.company.phone.egypt, s.company.whatsapp,
      s.regional.gulfOnly, s.notifications.emailOnNewLead, s.notifications.salesEmail,
      s.social.linkedin, s.social.twitter, s.social.facebook, s.social.instagram, s.social.youtube,
      s.social.tiktok ?? "", s.loginUrl ?? "https://falcon-valley.com",
      s.security.jwtSecret, s.security.rateLimitMax, s.security.rateLimitWindowMs,
    ]
  );
  await writeBranches(pool, s.company.branches ?? []);
}

// ── Content ─────────────────────────────────────────────────────────
export async function readContent(pool: Pool): Promise<SiteContent> {
  const heroRes = await pool.query(`SELECT * FROM hero_content WHERE id = 1`);
  const h = heroRes.rows[0];
  const hero = h
    ? {
        en: { title: h.title_en, subtitle: h.subtitle_en, cta1Text: h.cta1_en, cta2Text: h.cta2_en },
        ar: { title: h.title_ar, subtitle: h.subtitle_ar, cta1Text: h.cta1_ar, cta2Text: h.cta2_ar },
      }
    : DEFAULT_CONTENT.hero;

  const tRes = await pool.query(`SELECT * FROM testimonials ORDER BY sort_order, id`);
  const testimonials = tRes.rows.map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    company: r.company,
    quote: { en: r.quote_en, ar: r.quote_ar },
    image: r.image || undefined,
  }));

  const fRes = await pool.query(`SELECT * FROM faqs ORDER BY sort_order, id`);
  const faqs = fRes.rows.map((r) => ({
    id: r.id,
    question: { en: r.question_en, ar: r.question_ar },
    answer: { en: r.answer_en, ar: r.answer_ar },
  }));

  const sRes = await pool.query(`SELECT * FROM stats ORDER BY sort_order, id`);
  const stats = sRes.rows.map((r) => ({
    value: Number(r.value),
    suffix: r.suffix,
    label: { en: r.label_en, ar: r.label_ar },
  }));

  return { hero, testimonials, faqs, stats };
}

export async function writeContent(pool: Pool, c: SiteContent): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO hero_content (id, title_en, title_ar, subtitle_en, subtitle_ar, cta1_en, cta1_ar, cta2_en, cta2_ar)
       VALUES (1, $1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         title_en = EXCLUDED.title_en, title_ar = EXCLUDED.title_ar,
         subtitle_en = EXCLUDED.subtitle_en, subtitle_ar = EXCLUDED.subtitle_ar,
         cta1_en = EXCLUDED.cta1_en, cta1_ar = EXCLUDED.cta1_ar,
         cta2_en = EXCLUDED.cta2_en, cta2_ar = EXCLUDED.cta2_ar`,
      [
        c.hero.en.title, c.hero.ar.title, c.hero.en.subtitle, c.hero.ar.subtitle,
        c.hero.en.cta1Text, c.hero.ar.cta1Text, c.hero.en.cta2Text, c.hero.ar.cta2Text,
      ]
    );

    await client.query("DELETE FROM testimonials");
    for (let i = 0; i < c.testimonials.length; i++) {
      const t = c.testimonials[i];
      await client.query(
        `INSERT INTO testimonials (id, name, role, company, quote_en, quote_ar, image, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [t.id || newId("ts"), t.name, t.role, t.company, t.quote?.en ?? "", t.quote?.ar ?? "", t.image ?? "", i]
      );
    }

    await client.query("DELETE FROM faqs");
    for (let i = 0; i < c.faqs.length; i++) {
      const f = c.faqs[i];
      await client.query(
        `INSERT INTO faqs (id, question_en, question_ar, answer_en, answer_ar, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [f.id || newId("faq"), f.question?.en ?? "", f.question?.ar ?? "", f.answer?.en ?? "", f.answer?.ar ?? "", i]
      );
    }

    await client.query("DELETE FROM stats");
    for (let i = 0; i < c.stats.length; i++) {
      const st = c.stats[i];
      await client.query(
        `INSERT INTO stats (value, suffix, label_en, label_ar, sort_order)
         VALUES ($1,$2,$3,$4,$5)`,
        [Math.round(st.value) || 0, st.suffix ?? "", st.label?.en ?? "", st.label?.ar ?? "", i]
      );
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// ── Integrations ────────────────────────────────────────────────────
export async function readIntegrations(pool: Pool): Promise<IntegrationSettings> {
  const res = await pool.query(`SELECT * FROM integrations WHERE id = 1`);
  const r = res.rows[0];
  if (!r) return DEFAULT_INTEGRATIONS;
  return {
    odoo: {
      enabled: r.odoo_enabled,
      url: r.odoo_url,
      db: r.odoo_db,
      username: r.odoo_username,
      apiKey: r.odoo_api_key ?? "",
      lastTestedAt: r.odoo_last_tested_at ? new Date(r.odoo_last_tested_at).toISOString() : undefined,
      lastTestResult: (r.odoo_last_test_result as "success" | "failed" | null) ?? undefined,
    },
    ai: {
      enabled: r.ai_enabled ?? false,
      serverUrl: r.ai_server_url ?? "",
      apiKey: r.ai_api_key ?? "",
    },
    calendar: {
      enabled: r.calendar_enabled,
      resourceId: r.calendar_resource_id,
      slotDuration: r.calendar_slot_duration,
      availableDays: r.calendar_available_days ?? [],
      startHour: r.calendar_start_hour,
      endHour: r.calendar_end_hour,
      bufferMinutes: r.calendar_buffer_minutes,
      maxAdvanceDays: r.calendar_max_advance_days,
    },
    email: {
      enabled: r.email_enabled,
      provider: "resend",
      apiKey: r.email_api_key,
      fromEmail: r.email_from_email,
      replyTo: r.email_reply_to,
    },
    whatsapp: {
      enabled: r.whatsapp_enabled,
      apiToken: r.whatsapp_api_token,
      phoneId: r.whatsapp_phone_id,
    },
    helpdesk: {
      enabled: r.helpdesk_enabled,
      defaultTeamId: r.helpdesk_default_team_id,
      allowRating: r.helpdesk_allow_rating,
      allowNewTickets: r.helpdesk_allow_new_tickets,
    },
  };
}

export async function writeIntegrations(pool: Pool, ig: IntegrationSettings): Promise<void> {
  await pool.query(
    `INSERT INTO integrations (
       id, odoo_enabled, odoo_url, odoo_db, odoo_username, odoo_api_key, odoo_last_tested_at, odoo_last_test_result,
       ai_enabled, ai_server_url, ai_api_key,
       calendar_enabled, calendar_resource_id, calendar_slot_duration, calendar_available_days,
       calendar_start_hour, calendar_end_hour, calendar_buffer_minutes, calendar_max_advance_days,
       email_enabled, email_provider, email_api_key, email_from_email, email_reply_to,
       whatsapp_enabled, whatsapp_api_token, whatsapp_phone_id,
       helpdesk_enabled, helpdesk_default_team_id, helpdesk_allow_rating, helpdesk_allow_new_tickets
     ) VALUES (1, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)
     ON CONFLICT (id) DO UPDATE SET
       odoo_enabled = EXCLUDED.odoo_enabled, odoo_url = EXCLUDED.odoo_url, odoo_db = EXCLUDED.odoo_db,
       odoo_username = EXCLUDED.odoo_username, odoo_api_key = EXCLUDED.odoo_api_key,
       odoo_last_tested_at = EXCLUDED.odoo_last_tested_at, odoo_last_test_result = EXCLUDED.odoo_last_test_result,
       ai_enabled = EXCLUDED.ai_enabled, ai_server_url = EXCLUDED.ai_server_url, ai_api_key = EXCLUDED.ai_api_key,
       calendar_enabled = EXCLUDED.calendar_enabled, calendar_resource_id = EXCLUDED.calendar_resource_id,
       calendar_slot_duration = EXCLUDED.calendar_slot_duration, calendar_available_days = EXCLUDED.calendar_available_days,
       calendar_start_hour = EXCLUDED.calendar_start_hour, calendar_end_hour = EXCLUDED.calendar_end_hour,
       calendar_buffer_minutes = EXCLUDED.calendar_buffer_minutes, calendar_max_advance_days = EXCLUDED.calendar_max_advance_days,
       email_enabled = EXCLUDED.email_enabled, email_provider = EXCLUDED.email_provider, email_api_key = EXCLUDED.email_api_key,
       email_from_email = EXCLUDED.email_from_email, email_reply_to = EXCLUDED.email_reply_to,
       whatsapp_enabled = EXCLUDED.whatsapp_enabled, whatsapp_api_token = EXCLUDED.whatsapp_api_token, whatsapp_phone_id = EXCLUDED.whatsapp_phone_id,
       helpdesk_enabled = EXCLUDED.helpdesk_enabled, helpdesk_default_team_id = EXCLUDED.helpdesk_default_team_id,
       helpdesk_allow_rating = EXCLUDED.helpdesk_allow_rating, helpdesk_allow_new_tickets = EXCLUDED.helpdesk_allow_new_tickets`,
    [
      ig.odoo.enabled, ig.odoo.url, ig.odoo.db, ig.odoo.username, ig.odoo.apiKey,
      ig.odoo.lastTestedAt ? new Date(ig.odoo.lastTestedAt) : null, ig.odoo.lastTestResult ?? null,
      ig.ai.enabled, ig.ai.serverUrl, ig.ai.apiKey,
      ig.calendar.enabled, ig.calendar.resourceId, ig.calendar.slotDuration, ig.calendar.availableDays,
      ig.calendar.startHour, ig.calendar.endHour, ig.calendar.bufferMinutes, ig.calendar.maxAdvanceDays,
      ig.email.enabled, ig.email.provider, ig.email.apiKey, ig.email.fromEmail, ig.email.replyTo,
      ig.whatsapp.enabled, ig.whatsapp.apiToken, ig.whatsapp.phoneId,
      ig.helpdesk.enabled, ig.helpdesk.defaultTeamId, ig.helpdesk.allowRating, ig.helpdesk.allowNewTickets,
    ]
  );
}

// ── SEO settings ────────────────────────────────────────────────────
export async function readSeo(pool: Pool): Promise<SeoSettings> {
  const res = await pool.query(`SELECT * FROM seo_settings WHERE id = 1`);
  const r = res.rows[0];
  if (!r) return DEFAULT_SEO;
  return {
    metaTitle: { en: r.meta_title_en, ar: r.meta_title_ar },
    metaDescription: { en: r.meta_description_en, ar: r.meta_description_ar },
    metaKeywords: { en: r.meta_keywords_en, ar: r.meta_keywords_ar },
    ogImage: r.og_image,
  };
}

export async function writeSeo(pool: Pool, seo: SeoSettings): Promise<void> {
  await pool.query(
    `INSERT INTO seo_settings (id, meta_title_en, meta_title_ar, meta_description_en, meta_description_ar, meta_keywords_en, meta_keywords_ar, og_image)
     VALUES (1, $1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (id) DO UPDATE SET
       meta_title_en = EXCLUDED.meta_title_en, meta_title_ar = EXCLUDED.meta_title_ar,
       meta_description_en = EXCLUDED.meta_description_en, meta_description_ar = EXCLUDED.meta_description_ar,
       meta_keywords_en = EXCLUDED.meta_keywords_en, meta_keywords_ar = EXCLUDED.meta_keywords_ar,
       og_image = EXCLUDED.og_image`,
    [
      seo.metaTitle.en, seo.metaTitle.ar, seo.metaDescription.en, seo.metaDescription.ar,
      seo.metaKeywords.en, seo.metaKeywords.ar, seo.ogImage,
    ]
  );
}

// ── Footer links ────────────────────────────────────────────────────
export async function readFooterLinks(pool: Pool): Promise<FooterLink[]> {
  const res = await pool.query(`SELECT * FROM footer_links ORDER BY section, sort_order, id`);
  return res.rows.map((r) => ({
    id: r.id,
    section: r.section,
    label: { en: r.label_en, ar: r.label_ar },
    url: r.url,
  }));
}

export async function writeFooterLinks(pool: Pool, links: FooterLink[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM footer_links");
    for (let i = 0; i < links.length; i++) {
      const l = links[i];
      await client.query(
        `INSERT INTO footer_links (id, section, label_en, label_ar, url, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [l.id || newId("fl"), l.section, l.label?.en ?? "", l.label?.ar ?? "", l.url ?? "", i]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// ── Admin users ─────────────────────────────────────────────────────
export async function countAdmins(pool: Pool): Promise<number> {
  const res = await pool.query(`SELECT count(*)::int AS n FROM admin_users`);
  return res.rows[0]?.n ?? 0;
}

export async function getAdminByUsername(
  pool: Pool,
  username: string
): Promise<{ id: number; username: string; passwordHash: string } | null> {
  const res = await pool.query(
    `SELECT id, username, password_hash FROM admin_users WHERE lower(username) = lower($1) LIMIT 1`,
    [username]
  );
  const r = res.rows[0];
  return r ? { id: r.id, username: r.username, passwordHash: r.password_hash } : null;
}

export async function firstAdminUsername(pool: Pool): Promise<string> {
  const res = await pool.query(`SELECT username FROM admin_users ORDER BY id LIMIT 1`);
  return res.rows[0]?.username ?? "";
}

export async function createAdmin(pool: Pool, username: string, passwordHash: string): Promise<void> {
  await pool.query(
    `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = now()`,
    [username, passwordHash]
  );
}

export async function updateAdminPassword(pool: Pool, username: string, passwordHash: string): Promise<void> {
  await pool.query(
    `UPDATE admin_users SET password_hash = $2, updated_at = now() WHERE lower(username) = lower($1)`,
    [username, passwordHash]
  );
}

// ── Sectors ─────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToSector(r: any): Sector {
  return {
    id: r.id,
    icon: r.icon,
    gradient: r.gradient,
    name: { en: r.name_en, ar: r.name_ar },
    title: { en: r.title_en, ar: r.title_ar },
    description: { en: r.description_en, ar: r.description_ar },
    systems: (r.systems ?? []) as SectorSystem[],
    videoUrl: r.video_url ?? "",
    featured: r.featured,
    enabled: r.enabled,
    sortOrder: r.sort_order,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function readSectors(pool: Pool, onlyEnabled = false): Promise<Sector[]> {
  const res = await pool.query(
    `SELECT * FROM sectors ${onlyEnabled ? "WHERE enabled = true" : ""} ORDER BY sort_order, id`
  );
  return res.rows.map(rowToSector);
}

export async function readSector(pool: Pool, id: string): Promise<Sector | null> {
  const res = await pool.query(`SELECT * FROM sectors WHERE id = $1`, [id]);
  return res.rows[0] ? rowToSector(res.rows[0]) : null;
}

export async function writeSectors(pool: Pool, sectors: Sector[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM sectors");
    for (let i = 0; i < sectors.length; i++) {
      const s = sectors[i];
      await client.query(
        `INSERT INTO sectors (id, icon, gradient, name_en, name_ar, title_en, title_ar, description_en, description_ar, systems, video_url, featured, enabled, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          s.id || newId("sec"),
          s.icon ?? "",
          s.gradient ?? "",
          s.name?.en ?? "",
          s.name?.ar ?? "",
          s.title?.en ?? "",
          s.title?.ar ?? "",
          s.description?.en ?? "",
          s.description?.ar ?? "",
          s.systems ?? [],
          s.videoUrl ?? "",
          Boolean(s.featured),
          s.enabled !== false,
          i,
        ]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// ── Base pricing ────────────────────────────────────────────────────
export async function readPricingBase(pool: Pool): Promise<PricingBase> {
  const res = await pool.query(`SELECT * FROM pricing_base WHERE id = 1`);
  const r = res.rows[0];
  if (!r) return DEFAULT_PRICING_BASE;
  return {
    pricePerUser: Number(r.price_per_user),
    hostingPrice: Number(r.hosting_price),
    operatingCosts: Number(r.operating_costs),
    trainingCostPerDay: Number(r.training_cost_per_day),
    trainingDays: r.training_days,
    discountPercent: Number(r.discount_percent),
    usdToEgp: Number(r.usd_to_egp),
    usdToSar: Number(r.usd_to_sar ?? 3.75),
  };
}

export async function writePricingBase(pool: Pool, p: PricingBase): Promise<void> {
  await pool.query(
    `INSERT INTO pricing_base (id, price_per_user, hosting_price, operating_costs, training_cost_per_day, training_days, discount_percent, usd_to_egp, usd_to_sar)
     VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (id) DO UPDATE SET
       price_per_user = EXCLUDED.price_per_user, hosting_price = EXCLUDED.hosting_price,
       operating_costs = EXCLUDED.operating_costs, training_cost_per_day = EXCLUDED.training_cost_per_day,
       training_days = EXCLUDED.training_days, discount_percent = EXCLUDED.discount_percent,
       usd_to_egp = EXCLUDED.usd_to_egp, usd_to_sar = EXCLUDED.usd_to_sar`,
    [p.pricePerUser, p.hostingPrice, p.operatingCosts, p.trainingCostPerDay, p.trainingDays, p.discountPercent, p.usdToEgp, p.usdToSar]
  );
}

// ── Per-sector pricing overrides ────────────────────────────────────
export async function readSectorPricing(pool: Pool): Promise<SectorPricingOverride[]> {
  const res = await pool.query(`SELECT * FROM sector_pricing ORDER BY sector_id, system`);
  return res.rows.map((r) => ({
    sectorId: r.sector_id,
    system: r.system as SectorSystem,
    pricePerUser: r.price_per_user == null ? null : Number(r.price_per_user),
    operatingCosts: r.operating_costs == null ? null : Number(r.operating_costs),
    trainingDays: r.training_days,
  }));
}

export async function writeSectorPricing(pool: Pool, overrides: SectorPricingOverride[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM sector_pricing");
    for (const o of overrides) {
      await client.query(
        `INSERT INTO sector_pricing (sector_id, system, price_per_user, operating_costs, training_days)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (sector_id, system) DO NOTHING`,
        [o.sectorId, o.system, o.pricePerUser, o.operatingCosts, o.trainingDays]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// ── Clients ─────────────────────────────────────────────────────────
export async function readClients(pool: Pool): Promise<Client[]> {
  const res = await pool.query(`SELECT * FROM clients ORDER BY sort_order, id`);
  return res.rows.map((r) => ({
    id: r.id,
    name: { en: r.name_en, ar: r.name_ar },
    logo: r.logo,
    tags: r.tags ?? [],
    sortOrder: r.sort_order,
  }));
}

export async function writeClients(pool: Pool, clients: Client[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM clients");
    for (let i = 0; i < clients.length; i++) {
      const c = clients[i];
      await client.query(
        `INSERT INTO clients (id, name_en, name_ar, logo, tags, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [c.id || newId("cl"), c.name?.en ?? "", c.name?.ar ?? "", c.logo ?? "", c.tags ?? [], i]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// ── Client tags ─────────────────────────────────────────────────────
export async function readClientTags(pool: Pool): Promise<ClientTag[]> {
  const res = await pool.query(`SELECT * FROM client_tags ORDER BY sort_order, id`);
  return res.rows.map((r) => ({
    id: r.id,
    name: { en: r.name_en, ar: r.name_ar },
    sortOrder: r.sort_order,
  }));
}

export async function writeClientTags(pool: Pool, tags: ClientTag[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM client_tags");
    for (let i = 0; i < tags.length; i++) {
      const t = tags[i];
      await client.query(
        `INSERT INTO client_tags (id, name_en, name_ar, sort_order) VALUES ($1,$2,$3,$4)`,
        [t.id || newId("tag"), t.name?.en ?? "", t.name?.ar ?? "", i]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/** Create tag definitions for any tag ids used by clients but not yet defined. */
export async function backfillClientTags(pool: Pool): Promise<void> {
  await pool.query(
    `INSERT INTO client_tags (id, name_en, name_ar, sort_order)
     SELECT DISTINCT t, t, t, 0
     FROM clients, unnest(tags) AS t
     WHERE t <> '' AND NOT EXISTS (SELECT 1 FROM client_tags ct WHERE ct.id = t)`
  );
}

// ── Products ────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToProduct(r: any): Product {
  return {
    slug: r.slug,
    name: { en: r.name_en, ar: r.name_ar },
    eyebrow: { en: r.eyebrow_en, ar: r.eyebrow_ar },
    title: { en: r.title_en, ar: r.title_ar },
    description: { en: r.description_en, ar: r.description_ar },
    heroImage: r.hero_image,
    cta1: { label: { en: r.cta1_label_en, ar: r.cta1_label_ar }, url: r.cta1_url },
    cta2: { label: { en: r.cta2_label_en, ar: r.cta2_label_ar }, url: r.cta2_url },
    isCustom: r.is_custom,
    enabled: r.enabled,
    sortOrder: r.sort_order,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function readProducts(pool: Pool, onlyEnabled = false): Promise<Product[]> {
  const res = await pool.query(
    `SELECT * FROM products ${onlyEnabled ? "WHERE enabled = true" : ""} ORDER BY sort_order, slug`
  );
  return res.rows.map(rowToProduct);
}

export async function readProduct(pool: Pool, slug: string): Promise<Product | null> {
  const res = await pool.query(`SELECT * FROM products WHERE slug = $1`, [slug]);
  return res.rows[0] ? rowToProduct(res.rows[0]) : null;
}

export async function writeProducts(pool: Pool, products: Product[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM products");
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      await client.query(
        `INSERT INTO products (slug, name_en, name_ar, eyebrow_en, eyebrow_ar, title_en, title_ar,
           description_en, description_ar, hero_image, cta1_label_en, cta1_label_ar, cta1_url,
           cta2_label_en, cta2_label_ar, cta2_url, is_custom, enabled, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          p.slug, p.name?.en ?? "", p.name?.ar ?? "", p.eyebrow?.en ?? "", p.eyebrow?.ar ?? "",
          p.title?.en ?? "", p.title?.ar ?? "", p.description?.en ?? "", p.description?.ar ?? "",
          p.heroImage ?? "", p.cta1?.label?.en ?? "", p.cta1?.label?.ar ?? "", p.cta1?.url ?? "/demo",
          p.cta2?.label?.en ?? "", p.cta2?.label?.ar ?? "", p.cta2?.url ?? "/contact",
          Boolean(p.isCustom), p.enabled !== false, i,
        ]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// ── Product brochures ───────────────────────────────────────────────
export async function readBrochure(pool: Pool, slug: string): Promise<ProductBrochure | null> {
  const res = await pool.query(`SELECT * FROM product_brochures WHERE slug = $1`, [slug]);
  const r = res.rows[0];
  if (!r) return null;
  return {
    slug: r.slug,
    title: { en: r.title_en, ar: r.title_ar },
    content: { en: r.content_en, ar: r.content_ar },
    enabled: r.enabled,
  };
}

/** Insert default brochures only if a brochure for that slug doesn't exist yet. */
export async function seedBrochures(pool: Pool, brochures: ProductBrochure[]): Promise<void> {
  for (const b of brochures) {
    await pool.query(
      `INSERT INTO product_brochures (slug, title_en, title_ar, content_en, content_ar, enabled)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING`,
      [b.slug, b.title?.en ?? "", b.title?.ar ?? "", b.content?.en ?? "", b.content?.ar ?? "", b.enabled]
    );
  }
}

export async function writeBrochure(pool: Pool, b: ProductBrochure): Promise<void> {
  await pool.query(
    `INSERT INTO product_brochures (slug, title_en, title_ar, content_en, content_ar, enabled, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6, now())
     ON CONFLICT (slug) DO UPDATE SET
       title_en = EXCLUDED.title_en, title_ar = EXCLUDED.title_ar,
       content_en = EXCLUDED.content_en, content_ar = EXCLUDED.content_ar,
       enabled = EXCLUDED.enabled, updated_at = now()`,
    [b.slug, b.title?.en ?? "", b.title?.ar ?? "", b.content?.en ?? "", b.content?.ar ?? "", b.enabled]
  );
}
