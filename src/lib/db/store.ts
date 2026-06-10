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
} from "@/types/admin";
import { DEFAULT_SETTINGS, DEFAULT_CONTENT, DEFAULT_INTEGRATIONS } from "./defaults";

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
    },
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
       jwt_secret, rate_limit_max, rate_limit_window_ms
     ) VALUES (1, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
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
       jwt_secret = EXCLUDED.jwt_secret,
       rate_limit_max = EXCLUDED.rate_limit_max,
       rate_limit_window_ms = EXCLUDED.rate_limit_window_ms`,
    [
      s.company.name.en, s.company.name.ar, s.company.email,
      s.company.phone.ksa, s.company.phone.egypt, s.company.whatsapp,
      s.regional.gulfOnly, s.notifications.emailOnNewLead, s.notifications.salesEmail,
      s.social.linkedin, s.social.twitter, s.social.facebook, s.social.instagram, s.social.youtube,
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
      password: r.odoo_password,
      lastTestedAt: r.odoo_last_tested_at ? new Date(r.odoo_last_tested_at).toISOString() : undefined,
      lastTestResult: (r.odoo_last_test_result as "success" | "failed" | null) ?? undefined,
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
       id, odoo_enabled, odoo_url, odoo_db, odoo_username, odoo_password, odoo_last_tested_at, odoo_last_test_result,
       calendar_enabled, calendar_resource_id, calendar_slot_duration, calendar_available_days,
       calendar_start_hour, calendar_end_hour, calendar_buffer_minutes, calendar_max_advance_days,
       email_enabled, email_provider, email_api_key, email_from_email, email_reply_to,
       whatsapp_enabled, whatsapp_api_token, whatsapp_phone_id,
       helpdesk_enabled, helpdesk_default_team_id, helpdesk_allow_rating, helpdesk_allow_new_tickets
     ) VALUES (1, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
     ON CONFLICT (id) DO UPDATE SET
       odoo_enabled = EXCLUDED.odoo_enabled, odoo_url = EXCLUDED.odoo_url, odoo_db = EXCLUDED.odoo_db,
       odoo_username = EXCLUDED.odoo_username, odoo_password = EXCLUDED.odoo_password,
       odoo_last_tested_at = EXCLUDED.odoo_last_tested_at, odoo_last_test_result = EXCLUDED.odoo_last_test_result,
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
      ig.odoo.enabled, ig.odoo.url, ig.odoo.db, ig.odoo.username, ig.odoo.password,
      ig.odoo.lastTestedAt ? new Date(ig.odoo.lastTestedAt) : null, ig.odoo.lastTestResult ?? null,
      ig.calendar.enabled, ig.calendar.resourceId, ig.calendar.slotDuration, ig.calendar.availableDays,
      ig.calendar.startHour, ig.calendar.endHour, ig.calendar.bufferMinutes, ig.calendar.maxAdvanceDays,
      ig.email.enabled, ig.email.provider, ig.email.apiKey, ig.email.fromEmail, ig.email.replyTo,
      ig.whatsapp.enabled, ig.whatsapp.apiToken, ig.whatsapp.phoneId,
      ig.helpdesk.enabled, ig.helpdesk.defaultTeamId, ig.helpdesk.allowRating, ig.helpdesk.allowNewTickets,
    ]
  );
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
