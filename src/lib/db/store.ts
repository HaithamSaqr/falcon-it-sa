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
  HomeContent,
  HomeCard,
  BilingualText,
} from "@/types/admin";
import {
  DEFAULT_SETTINGS,
  DEFAULT_CONTENT,
  DEFAULT_INTEGRATIONS,
  DEFAULT_SEO,
  DEFAULT_PRICING_BASE,
  DEFAULT_HOME,
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
type WaDomain = { id: string; domain: string; number: string };
type WaCountry = { id: string; country: string; number: string };

export async function readWhatsappRouting(
  pool: Pool
): Promise<{ domains: WaDomain[]; countries: WaCountry[] }> {
  const d = await pool.query(
    `SELECT id, domain, number FROM whatsapp_domain_numbers ORDER BY sort_order, id`
  );
  const c = await pool.query(
    `SELECT id, country, number FROM whatsapp_country_numbers ORDER BY sort_order, id`
  );
  return {
    domains: d.rows.map((r) => ({ id: r.id, domain: r.domain, number: r.number })),
    countries: c.rows.map((r) => ({ id: r.id, country: r.country, number: r.number })),
  };
}

export async function writeWhatsappRouting(
  pool: Pool,
  routing: { domains: WaDomain[]; countries: WaCountry[] }
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM whatsapp_domain_numbers");
    const domains = (routing?.domains ?? []).filter((x) => x.domain?.trim() && x.number?.trim());
    for (let i = 0; i < domains.length; i++) {
      await client.query(
        `INSERT INTO whatsapp_domain_numbers (id, domain, number, sort_order) VALUES ($1,$2,$3,$4)`,
        [domains[i].id || newId("wad"), domains[i].domain.trim(), domains[i].number.trim(), i]
      );
    }
    await client.query("DELETE FROM whatsapp_country_numbers");
    const countries = (routing?.countries ?? []).filter((x) => x.country?.trim() && x.number?.trim());
    for (let i = 0; i < countries.length; i++) {
      await client.query(
        `INSERT INTO whatsapp_country_numbers (id, country, number, sort_order) VALUES ($1,$2,$3,$4)`,
        [countries[i].id || newId("wac"), countries[i].country.trim().toUpperCase(), countries[i].number.trim(), i]
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

export async function readSettings(pool: Pool): Promise<SiteSettings> {
  const res = await pool.query(`SELECT * FROM site_settings WHERE id = 1`);
  const r = res.rows[0];
  const branches = await readBranches(pool);
  const whatsappRouting = await readWhatsappRouting(pool);
  const admin = await pool.query(`SELECT username FROM admin_users ORDER BY id LIMIT 1`);
  const adminUsername = admin.rows[0]?.username ?? "";

  if (!r) {
    return {
      ...DEFAULT_SETTINGS,
      company: { ...DEFAULT_SETTINGS.company, branches },
      whatsappRouting,
      security: { ...DEFAULT_SETTINGS.security, adminUsername },
    };
  }

  const landingCta: SiteSettings["landingCta"] = {
    mode: r.landing_cta_mode === "url" ? "url" : "whatsapp",
    url: r.landing_cta_url || "",
    label: { en: r.landing_cta_label_en || "", ar: r.landing_cta_label_ar || "" },
    note: { en: r.landing_cta_note_en || "", ar: r.landing_cta_note_ar || "" },
  };

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
    clientsSpeed: r.clients_speed == null ? 3 : Number(r.clients_speed),
    whatsappRouting,
    landingCta,
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
       social_tiktok, login_url, jwt_secret, rate_limit_max, rate_limit_window_ms,
       landing_cta_mode, landing_cta_url,
       landing_cta_label_en, landing_cta_label_ar, landing_cta_note_en, landing_cta_note_ar,
       clients_speed
     ) VALUES (1, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
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
       rate_limit_window_ms = EXCLUDED.rate_limit_window_ms,
       landing_cta_mode = EXCLUDED.landing_cta_mode,
       landing_cta_url = EXCLUDED.landing_cta_url,
       landing_cta_label_en = EXCLUDED.landing_cta_label_en,
       landing_cta_label_ar = EXCLUDED.landing_cta_label_ar,
       landing_cta_note_en = EXCLUDED.landing_cta_note_en,
       landing_cta_note_ar = EXCLUDED.landing_cta_note_ar,
       clients_speed = EXCLUDED.clients_speed`,
    [
      s.company.name.en, s.company.name.ar, s.company.email,
      s.company.phone.ksa, s.company.phone.egypt, s.company.whatsapp,
      s.regional.gulfOnly, s.notifications.emailOnNewLead, s.notifications.salesEmail,
      s.social.linkedin, s.social.twitter, s.social.facebook, s.social.instagram, s.social.youtube,
      s.social.tiktok ?? "", s.loginUrl ?? "https://falcon-valley.com",
      s.security.jwtSecret, s.security.rateLimitMax, s.security.rateLimitWindowMs,
      s.landingCta?.mode === "url" ? "url" : "whatsapp", s.landingCta?.url ?? "",
      s.landingCta?.label?.en ?? "", s.landingCta?.label?.ar ?? "",
      s.landingCta?.note?.en ?? "", s.landingCta?.note?.ar ?? "",
      typeof s.clientsSpeed === "number" && s.clientsSpeed > 0 ? s.clientsSpeed : 3,
    ]
  );
  await writeBranches(pool, s.company.branches ?? []);
  await writeWhatsappRouting(pool, s.whatsappRouting ?? { domains: [], countries: [] });
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

    // NOTE: stats are owned by the Home Page editor (writeHome), not here.

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// ── Home Page ───────────────────────────────────────────────────────
function cardRow(r: Record<string, unknown>): HomeCard {
  return {
    id: r.id as string,
    icon: (r.icon as string) || "",
    title: { en: (r.title_en as string) || "", ar: (r.title_ar as string) || "" },
    desc: { en: (r.desc_en as string) || "", ar: (r.desc_ar as string) || "" },
  };
}

export async function readHome(pool: Pool): Promise<HomeContent> {
  // Hero (extended hero_content row)
  const heroRes = await pool.query(`SELECT * FROM hero_content WHERE id = 1`);
  const h = heroRes.rows[0];
  const hero: HomeContent["hero"] = h
    ? {
        eyebrow: { en: h.eyebrow_en || "", ar: h.eyebrow_ar || "" },
        title: { en: h.title_en || "", ar: h.title_ar || "" },
        subtitle: { en: h.subtitle_en || "", ar: h.subtitle_ar || "" },
        cta1: { label: { en: h.cta1_en || "", ar: h.cta1_ar || "" }, url: h.cta1_url || "" },
        cta2: { label: { en: h.cta2_en || "", ar: h.cta2_ar || "" }, url: h.cta2_url || "" },
        trust1: { en: h.trust1_en || "", ar: h.trust1_ar || "" },
        trust2: { en: h.trust2_en || "", ar: h.trust2_ar || "" },
        image: h.hero_image || "",
      }
    : DEFAULT_HOME.hero;

  // Cards
  const cardsRes = await pool.query(`SELECT * FROM home_cards ORDER BY section, sort_order, id`);
  const wefCards = cardsRes.rows.filter((r) => r.section === "why_erp_fails").map(cardRow);
  const wcCards = cardsRes.rows.filter((r) => r.section === "why_choose").map(cardRow);

  // Text map
  const txtRes = await pool.query(`SELECT * FROM home_text`);
  const T: Record<string, BilingualText> = {};
  for (const r of txtRes.rows) T[r.key] = { en: r.value_en || "", ar: r.value_ar || "" };
  const g = (k: string, fb: BilingualText): BilingualText => T[k] ?? fb;
  const url = (k: string, fb: string): string => T[k]?.en ?? fb;
  const d = DEFAULT_HOME;

  // Stats items live in the dedicated `stats` table.
  const statsRes = await pool.query(`SELECT * FROM stats ORDER BY sort_order, id`);
  const statItems = statsRes.rows.map((r) => ({
    value: Number(r.value),
    suffix: r.suffix || "",
    label: { en: r.label_en || "", ar: r.label_ar || "" },
  }));

  return {
    hero,
    whyErpFails: {
      label: g("wef.label", d.whyErpFails.label),
      heading: g("wef.heading", d.whyErpFails.heading),
      subheading: g("wef.subheading", d.whyErpFails.subheading),
      cards: wefCards.length ? wefCards : d.whyErpFails.cards,
    },
    whyChoose: {
      heading: g("wc.heading", d.whyChoose.heading),
      subheading: g("wc.subheading", d.whyChoose.subheading),
      cards: wcCards.length ? wcCards : d.whyChoose.cards,
    },
    cta: {
      headline: g("cta.headline", d.cta.headline),
      subtitle: g("cta.subtitle", d.cta.subtitle),
      cta1: { label: g("cta.cta1Label", d.cta.cta1.label), url: url("cta.cta1Url", d.cta.cta1.url) },
      cta2: { label: g("cta.cta2Label", d.cta.cta2.label), url: url("cta.cta2Url", d.cta.cta2.url) },
    },
    stats: {
      heading: g("stats.heading", d.stats.heading),
      items: statItems.length ? statItems : d.stats.items,
    },
    newsletter: {
      heading: g("nl.heading", d.newsletter.heading),
      subtitle: g("nl.subtitle", d.newsletter.subtitle),
    },
  };
}

export async function writeHome(pool: Pool, c: HomeContent): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO hero_content (id, title_en, title_ar, subtitle_en, subtitle_ar,
         cta1_en, cta1_ar, cta2_en, cta2_ar, eyebrow_en, eyebrow_ar,
         cta1_url, cta2_url, hero_image, trust1_en, trust1_ar, trust2_en, trust2_ar)
       VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (id) DO UPDATE SET
         title_en=EXCLUDED.title_en, title_ar=EXCLUDED.title_ar,
         subtitle_en=EXCLUDED.subtitle_en, subtitle_ar=EXCLUDED.subtitle_ar,
         cta1_en=EXCLUDED.cta1_en, cta1_ar=EXCLUDED.cta1_ar,
         cta2_en=EXCLUDED.cta2_en, cta2_ar=EXCLUDED.cta2_ar,
         eyebrow_en=EXCLUDED.eyebrow_en, eyebrow_ar=EXCLUDED.eyebrow_ar,
         cta1_url=EXCLUDED.cta1_url, cta2_url=EXCLUDED.cta2_url,
         hero_image=EXCLUDED.hero_image,
         trust1_en=EXCLUDED.trust1_en, trust1_ar=EXCLUDED.trust1_ar,
         trust2_en=EXCLUDED.trust2_en, trust2_ar=EXCLUDED.trust2_ar`,
      [
        c.hero.title.en, c.hero.title.ar, c.hero.subtitle.en, c.hero.subtitle.ar,
        c.hero.cta1.label.en, c.hero.cta1.label.ar, c.hero.cta2.label.en, c.hero.cta2.label.ar,
        c.hero.eyebrow.en, c.hero.eyebrow.ar, c.hero.cta1.url, c.hero.cta2.url, c.hero.image,
        c.hero.trust1.en, c.hero.trust1.ar, c.hero.trust2.en, c.hero.trust2.ar,
      ]
    );

    await client.query("DELETE FROM home_cards");
    const insertCards = async (section: string, cards: HomeCard[]) => {
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        await client.query(
          `INSERT INTO home_cards (id, section, icon, title_en, title_ar, desc_en, desc_ar, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [card.id || newId("card"), section, card.icon ?? "", card.title?.en ?? "", card.title?.ar ?? "",
           card.desc?.en ?? "", card.desc?.ar ?? "", i]
        );
      }
    };
    await insertCards("why_erp_fails", c.whyErpFails.cards);
    await insertCards("why_choose", c.whyChoose.cards);

    const setText = async (key: string, v: BilingualText) =>
      client.query(
        `INSERT INTO home_text (key, value_en, value_ar) VALUES ($1,$2,$3)
         ON CONFLICT (key) DO UPDATE SET value_en=EXCLUDED.value_en, value_ar=EXCLUDED.value_ar`,
        [key, v.en ?? "", v.ar ?? ""]
      );
    const setUrl = async (key: string, u: string) =>
      client.query(
        `INSERT INTO home_text (key, value_en, value_ar) VALUES ($1,$2,'')
         ON CONFLICT (key) DO UPDATE SET value_en=EXCLUDED.value_en`,
        [key, u ?? ""]
      );

    await setText("wef.label", c.whyErpFails.label);
    await setText("wef.heading", c.whyErpFails.heading);
    await setText("wef.subheading", c.whyErpFails.subheading);
    await setText("wc.heading", c.whyChoose.heading);
    await setText("wc.subheading", c.whyChoose.subheading);
    await setText("cta.headline", c.cta.headline);
    await setText("cta.subtitle", c.cta.subtitle);
    await setText("cta.cta1Label", c.cta.cta1.label);
    await setUrl("cta.cta1Url", c.cta.cta1.url);
    await setText("cta.cta2Label", c.cta.cta2.label);
    await setUrl("cta.cta2Url", c.cta.cta2.url);
    await setText("stats.heading", c.stats.heading);
    await setText("nl.heading", c.newsletter.heading);
    await setText("nl.subtitle", c.newsletter.subtitle);

    // Stats items (dedicated table).
    await client.query("DELETE FROM stats");
    for (let i = 0; i < c.stats.items.length; i++) {
      const st = c.stats.items[i];
      await client.query(
        `INSERT INTO stats (value, suffix, label_en, label_ar, sort_order) VALUES ($1,$2,$3,$4,$5)`,
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

/**
 * Idempotent seed for the home-page content. Safe to run on every boot:
 * seeds cards/text only when missing and backfills the new hero columns
 * (eyebrow / cta urls / image / trust) only when blank — never clobbers
 * existing admin-edited values.
 */
export async function seedHome(pool: Pool): Promise<void> {
  const d = DEFAULT_HOME;

  // 1) Cards — seed only if the table is empty.
  const cardsCount = await pool.query(`SELECT count(*)::int AS n FROM home_cards`);
  if (cardsCount.rows[0].n === 0) {
    const all = [
      ...d.whyErpFails.cards.map((c) => ({ c, section: "why_erp_fails" })),
      ...d.whyChoose.cards.map((c) => ({ c, section: "why_choose" })),
    ];
    for (let i = 0; i < all.length; i++) {
      const { c, section } = all[i];
      await pool.query(
        `INSERT INTO home_cards (id, section, icon, title_en, title_ar, desc_en, desc_ar, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [c.id || newId("card"), section, c.icon, c.title.en, c.title.ar, c.desc.en, c.desc.ar,
         section === "why_choose" ? i - d.whyErpFails.cards.length : i]
      );
    }
  }

  // 2) Text — insert missing keys only (keeps any admin edits).
  const texts: [string, string, string][] = [
    ["wef.label", d.whyErpFails.label.en, d.whyErpFails.label.ar],
    ["wef.heading", d.whyErpFails.heading.en, d.whyErpFails.heading.ar],
    ["wef.subheading", d.whyErpFails.subheading.en, d.whyErpFails.subheading.ar],
    ["wc.heading", d.whyChoose.heading.en, d.whyChoose.heading.ar],
    ["wc.subheading", d.whyChoose.subheading.en, d.whyChoose.subheading.ar],
    ["cta.headline", d.cta.headline.en, d.cta.headline.ar],
    ["cta.subtitle", d.cta.subtitle.en, d.cta.subtitle.ar],
    ["cta.cta1Label", d.cta.cta1.label.en, d.cta.cta1.label.ar],
    ["cta.cta1Url", d.cta.cta1.url, ""],
    ["cta.cta2Label", d.cta.cta2.label.en, d.cta.cta2.label.ar],
    ["cta.cta2Url", d.cta.cta2.url, ""],
    ["stats.heading", d.stats.heading.en, d.stats.heading.ar],
    ["nl.heading", d.newsletter.heading.en, d.newsletter.heading.ar],
    ["nl.subtitle", d.newsletter.subtitle.en, d.newsletter.subtitle.ar],
  ];
  for (const [key, en, ar] of texts) {
    await pool.query(
      `INSERT INTO home_text (key, value_en, value_ar) VALUES ($1,$2,$3) ON CONFLICT (key) DO NOTHING`,
      [key, en, ar]
    );
  }

  // 3) Backfill the new hero columns only where blank.
  const h = d.hero;
  await pool.query(
    `UPDATE hero_content SET
       eyebrow_en = CASE WHEN eyebrow_en = '' THEN $1 ELSE eyebrow_en END,
       eyebrow_ar = CASE WHEN eyebrow_ar = '' THEN $2 ELSE eyebrow_ar END,
       cta1_url   = CASE WHEN cta1_url   = '' THEN $3 ELSE cta1_url   END,
       cta2_url   = CASE WHEN cta2_url   = '' THEN $4 ELSE cta2_url   END,
       hero_image = CASE WHEN hero_image = '' THEN $5 ELSE hero_image END,
       trust1_en  = CASE WHEN trust1_en  = '' THEN $6 ELSE trust1_en  END,
       trust1_ar  = CASE WHEN trust1_ar  = '' THEN $7 ELSE trust1_ar  END,
       trust2_en  = CASE WHEN trust2_en  = '' THEN $8 ELSE trust2_en  END,
       trust2_ar  = CASE WHEN trust2_ar  = '' THEN $9 ELSE trust2_ar  END
     WHERE id = 1`,
    [h.eyebrow.en, h.eyebrow.ar, h.cta1.url, h.cta2.url, h.image,
     h.trust1.en, h.trust1.ar, h.trust2.en, h.trust2.ar]
  );

  // Also backfill the hero text itself if the row was somehow empty.
  await pool.query(
    `UPDATE hero_content SET
       title_en    = CASE WHEN title_en = '' THEN $1 ELSE title_en END,
       title_ar    = CASE WHEN title_ar = '' THEN $2 ELSE title_ar END,
       subtitle_en = CASE WHEN subtitle_en = '' THEN $3 ELSE subtitle_en END,
       subtitle_ar = CASE WHEN subtitle_ar = '' THEN $4 ELSE subtitle_ar END,
       cta1_en     = CASE WHEN cta1_en = '' THEN $5 ELSE cta1_en END,
       cta1_ar     = CASE WHEN cta1_ar = '' THEN $6 ELSE cta1_ar END,
       cta2_en     = CASE WHEN cta2_en = '' THEN $7 ELSE cta2_en END,
       cta2_ar     = CASE WHEN cta2_ar = '' THEN $8 ELSE cta2_ar END
     WHERE id = 1`,
    [h.title.en, h.title.ar, h.subtitle.en, h.subtitle.ar,
     h.cta1.label.en, h.cta1.label.ar, h.cta2.label.en, h.cta2.label.ar]
  );
}

/**
 * Idempotent seed for testimonials + FAQs. Seeds the default set only when the
 * respective table is empty, so existing admin-entered content is never touched.
 */
export async function seedContentExtras(pool: Pool): Promise<void> {
  const tCount = await pool.query(`SELECT count(*)::int AS n FROM testimonials`);
  if (tCount.rows[0].n === 0) {
    for (let i = 0; i < DEFAULT_CONTENT.testimonials.length; i++) {
      const t = DEFAULT_CONTENT.testimonials[i];
      await pool.query(
        `INSERT INTO testimonials (id, name, role, company, quote_en, quote_ar, image, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [t.id || newId("ts"), t.name, t.role, t.company, t.quote.en, t.quote.ar, t.image ?? "", i]
      );
    }
  }

  const fCount = await pool.query(`SELECT count(*)::int AS n FROM faqs`);
  if (fCount.rows[0].n === 0) {
    for (let i = 0; i < DEFAULT_CONTENT.faqs.length; i++) {
      const f = DEFAULT_CONTENT.faqs[i];
      await pool.query(
        `INSERT INTO faqs (id, question_en, question_ar, answer_en, answer_ar, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [f.id || newId("faq"), f.question.en, f.question.ar, f.answer.en, f.answer.ar, i]
      );
    }
  }
}

/**
 * Backfill the new product card_image (home "Product Trio" image) for the
 * three seeded products only when it is still blank — never overwrites an
 * admin-uploaded image.
 */
export async function backfillProductCardImages(pool: Pool): Promise<void> {
  const defaults: [string, string][] = [
    ["falcon-erp-desktop", "/images/products/falcon-erp-logo.png"],
    ["falcon-cloud", "/images/screens/web-modules-dark.png"],
    ["odoo-services", "/images/logos/odoo-logo.png"],
  ];
  for (const [slug, img] of defaults) {
    await pool.query(
      `UPDATE products SET card_image = $2 WHERE slug = $1 AND (card_image IS NULL OR card_image = '')`,
      [slug, img]
    );
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
    google: {
      enabled: r.google_enabled ?? false,
      verification: r.google_verification ?? "",
      gtmId: r.google_gtm_id ?? "",
      ga4Id: r.google_ga4_id ?? "",
      adsId: r.google_ads_id ?? "",
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
       helpdesk_enabled, helpdesk_default_team_id, helpdesk_allow_rating, helpdesk_allow_new_tickets,
       google_enabled, google_verification, google_gtm_id, google_ga4_id, google_ads_id
     ) VALUES (1, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35)
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
       helpdesk_allow_rating = EXCLUDED.helpdesk_allow_rating, helpdesk_allow_new_tickets = EXCLUDED.helpdesk_allow_new_tickets,
       google_enabled = EXCLUDED.google_enabled, google_verification = EXCLUDED.google_verification,
       google_gtm_id = EXCLUDED.google_gtm_id, google_ga4_id = EXCLUDED.google_ga4_id, google_ads_id = EXCLUDED.google_ads_id`,
    [
      ig.odoo.enabled, ig.odoo.url, ig.odoo.db, ig.odoo.username, ig.odoo.apiKey,
      ig.odoo.lastTestedAt ? new Date(ig.odoo.lastTestedAt) : null, ig.odoo.lastTestResult ?? null,
      ig.ai.enabled, ig.ai.serverUrl, ig.ai.apiKey,
      ig.calendar.enabled, ig.calendar.resourceId, ig.calendar.slotDuration, ig.calendar.availableDays,
      ig.calendar.startHour, ig.calendar.endHour, ig.calendar.bufferMinutes, ig.calendar.maxAdvanceDays,
      ig.email.enabled, ig.email.provider, ig.email.apiKey, ig.email.fromEmail, ig.email.replyTo,
      ig.whatsapp.enabled, ig.whatsapp.apiToken, ig.whatsapp.phoneId,
      ig.helpdesk.enabled, ig.helpdesk.defaultTeamId, ig.helpdesk.allowRating, ig.helpdesk.allowNewTickets,
      ig.google?.enabled ?? false, ig.google?.verification ?? "", ig.google?.gtmId ?? "",
      ig.google?.ga4Id ?? "", ig.google?.adsId ?? "",
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
    videoDomains: [],
    videoCountries: [],
    ctaDomains: [],
    ctaCountries: [],
    featured: r.featured,
    enabled: r.enabled,
    sortOrder: r.sort_order,
  };
}

/** Load per-sector routing rules (video + CTA), grouped by sector_id. */
async function readSectorRoutingRules(
  pool: Pool,
  sectorId?: string
): Promise<{
  videoDomains: Map<string, Sector["videoDomains"]>;
  videoCountries: Map<string, Sector["videoCountries"]>;
  ctaDomains: Map<string, Sector["ctaDomains"]>;
  ctaCountries: Map<string, Sector["ctaCountries"]>;
}> {
  const where = sectorId ? "WHERE sector_id = $1" : "";
  const args = sectorId ? [sectorId] : [];
  const [vd, vc, cd, cc] = await Promise.all([
    pool.query(`SELECT * FROM sector_video_domains ${where} ORDER BY sort_order, id`, args),
    pool.query(`SELECT * FROM sector_video_countries ${where} ORDER BY sort_order, id`, args),
    pool.query(`SELECT * FROM sector_cta_domains ${where} ORDER BY sort_order, id`, args),
    pool.query(`SELECT * FROM sector_cta_countries ${where} ORDER BY sort_order, id`, args),
  ]);
  const videoDomains = new Map<string, Sector["videoDomains"]>();
  const videoCountries = new Map<string, Sector["videoCountries"]>();
  const ctaDomains = new Map<string, Sector["ctaDomains"]>();
  const ctaCountries = new Map<string, Sector["ctaCountries"]>();
  const push = <T>(map: Map<string, T[]>, key: string, item: T) => {
    const arr = map.get(key) ?? [];
    arr.push(item);
    map.set(key, arr);
  };
  for (const r of vd.rows) push(videoDomains, r.sector_id, { id: r.id, domain: r.domain, videoUrl: r.video_url });
  for (const r of vc.rows) push(videoCountries, r.sector_id, { id: r.id, country: r.country, videoUrl: r.video_url });
  for (const r of cd.rows) push(ctaDomains, r.sector_id, { id: r.id, domain: r.domain, kind: r.kind === "url" ? "url" : "whatsapp", value: r.value });
  for (const r of cc.rows) push(ctaCountries, r.sector_id, { id: r.id, country: r.country, kind: r.kind === "url" ? "url" : "whatsapp", value: r.value });
  return { videoDomains, videoCountries, ctaDomains, ctaCountries };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function readSectors(pool: Pool, onlyEnabled = false): Promise<Sector[]> {
  const res = await pool.query(
    `SELECT * FROM sectors ${onlyEnabled ? "WHERE enabled = true" : ""} ORDER BY sort_order, id`
  );
  const sectors = res.rows.map(rowToSector);
  const rules = await readSectorRoutingRules(pool);
  for (const s of sectors) {
    s.videoDomains = rules.videoDomains.get(s.id) ?? [];
    s.videoCountries = rules.videoCountries.get(s.id) ?? [];
    s.ctaDomains = rules.ctaDomains.get(s.id) ?? [];
    s.ctaCountries = rules.ctaCountries.get(s.id) ?? [];
  }
  return sectors;
}

export async function readSector(pool: Pool, id: string): Promise<Sector | null> {
  const res = await pool.query(`SELECT * FROM sectors WHERE id = $1`, [id]);
  if (!res.rows[0]) return null;
  const sector = rowToSector(res.rows[0]);
  const rules = await readSectorRoutingRules(pool, id);
  sector.videoDomains = rules.videoDomains.get(id) ?? [];
  sector.videoCountries = rules.videoCountries.get(id) ?? [];
  sector.ctaDomains = rules.ctaDomains.get(id) ?? [];
  sector.ctaCountries = rules.ctaCountries.get(id) ?? [];
  return sector;
}

export async function writeSectors(pool: Pool, sectors: Sector[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM sectors");
    await client.query("DELETE FROM sector_video_domains");
    await client.query("DELETE FROM sector_video_countries");
    await client.query("DELETE FROM sector_cta_domains");
    await client.query("DELETE FROM sector_cta_countries");
    for (let i = 0; i < sectors.length; i++) {
      const s = sectors[i];
      const sectorId = s.id || newId("sec");
      await client.query(
        `INSERT INTO sectors (id, icon, gradient, name_en, name_ar, title_en, title_ar, description_en, description_ar, systems, video_url, featured, enabled, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          sectorId,
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

      const vDomains = (s.videoDomains ?? []).filter((v) => v.domain?.trim() && v.videoUrl?.trim());
      for (let j = 0; j < vDomains.length; j++) {
        await client.query(
          `INSERT INTO sector_video_domains (id, sector_id, domain, video_url, sort_order) VALUES ($1,$2,$3,$4,$5)`,
          [vDomains[j].id || newId("svd"), sectorId, vDomains[j].domain.trim(), vDomains[j].videoUrl.trim(), j]
        );
      }
      const vCountries = (s.videoCountries ?? []).filter((v) => v.country?.trim() && v.videoUrl?.trim());
      for (let j = 0; j < vCountries.length; j++) {
        await client.query(
          `INSERT INTO sector_video_countries (id, sector_id, country, video_url, sort_order) VALUES ($1,$2,$3,$4,$5)`,
          [vCountries[j].id || newId("svc"), sectorId, vCountries[j].country.trim().toUpperCase(), vCountries[j].videoUrl.trim(), j]
        );
      }

      const ctaD = (s.ctaDomains ?? []).filter((v) => v.domain?.trim() && v.value?.trim());
      for (let j = 0; j < ctaD.length; j++) {
        await client.query(
          `INSERT INTO sector_cta_domains (id, sector_id, domain, kind, value, sort_order) VALUES ($1,$2,$3,$4,$5,$6)`,
          [ctaD[j].id || newId("scd"), sectorId, ctaD[j].domain.trim(), ctaD[j].kind === "url" ? "url" : "whatsapp", ctaD[j].value.trim(), j]
        );
      }
      const ctaC = (s.ctaCountries ?? []).filter((v) => v.country?.trim() && v.value?.trim());
      for (let j = 0; j < ctaC.length; j++) {
        await client.query(
          `INSERT INTO sector_cta_countries (id, sector_id, country, kind, value, sort_order) VALUES ($1,$2,$3,$4,$5,$6)`,
          [ctaC[j].id || newId("scc"), sectorId, ctaC[j].country.trim().toUpperCase(), ctaC[j].kind === "url" ? "url" : "whatsapp", ctaC[j].value.trim(), j]
        );
      }
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
    trainingDays: Number(r.training_days),
    discountPercent: Number(r.discount_percent),
    usdToEgp: Number(r.usd_to_egp),
    usdToSar: Number(r.usd_to_sar ?? 3.75),
    systemTrainingDays: (r.system_training_days && typeof r.system_training_days === "object") ? r.system_training_days : {},
    volumeDiscounts: Array.isArray(r.volume_discounts) ? r.volume_discounts : [],
    freeSupportMonths: Number(r.free_support_months ?? 0),
  };
}

export async function writePricingBase(pool: Pool, p: PricingBase): Promise<void> {
  await pool.query(
    `INSERT INTO pricing_base (id, price_per_user, hosting_price, operating_costs, training_cost_per_day, training_days, discount_percent, usd_to_egp, usd_to_sar, system_training_days, volume_discounts, free_support_months)
     VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (id) DO UPDATE SET
       price_per_user = EXCLUDED.price_per_user, hosting_price = EXCLUDED.hosting_price,
       operating_costs = EXCLUDED.operating_costs, training_cost_per_day = EXCLUDED.training_cost_per_day,
       training_days = EXCLUDED.training_days, discount_percent = EXCLUDED.discount_percent,
       usd_to_egp = EXCLUDED.usd_to_egp, usd_to_sar = EXCLUDED.usd_to_sar,
       system_training_days = EXCLUDED.system_training_days,
       volume_discounts = EXCLUDED.volume_discounts,
       free_support_months = EXCLUDED.free_support_months`,
    [p.pricePerUser, p.hostingPrice, p.operatingCosts, p.trainingCostPerDay, p.trainingDays, p.discountPercent, p.usdToEgp, p.usdToSar, JSON.stringify(p.systemTrainingDays ?? {}), JSON.stringify(p.volumeDiscounts ?? []), Math.max(0, Math.round(p.freeSupportMonths ?? 0))]
  );
}

// ── Per-sector pricing overrides ────────────────────────────────────
export async function readSectorPricing(pool: Pool): Promise<SectorPricingOverride[]> {
  // Ensure columns added by migration exist even on databases created before the migration ran.
  await pool.query(`ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS hosting_price numeric`);
  await pool.query(`ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS discount_percent numeric`);
  await pool.query(`ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS volume_discounts jsonb`);
  await pool.query(`ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS includes_cloud_hosting boolean NOT NULL DEFAULT false`);
  await pool.query(`ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS free_support_months int`);
  const res = await pool.query(`SELECT * FROM sector_pricing ORDER BY sector_id, system`);
  return res.rows.map((r) => ({
    sectorId: r.sector_id,
    system: r.system as SectorSystem,
    pricePerUser: r.price_per_user == null ? null : Number(r.price_per_user),
    operatingCosts: r.operating_costs == null ? null : Number(r.operating_costs),
    trainingDays: r.training_days == null ? null : Number(r.training_days),
    hostingPrice: r.hosting_price == null ? null : Number(r.hosting_price),
    discountPercent: r.discount_percent == null ? null : Number(r.discount_percent),
    volumeDiscounts: Array.isArray(r.volume_discounts) ? r.volume_discounts : null,
    includesCloudHosting: Boolean(r.includes_cloud_hosting),
    freeSupportMonths: r.free_support_months == null ? null : Number(r.free_support_months),
  }));
}

export async function writeSectorPricing(pool: Pool, overrides: SectorPricingOverride[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Ensure all columns that may have been added by migration exist before inserting.
    await client.query(`ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS hosting_price numeric`);
    await client.query(`ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS discount_percent numeric`);
    await client.query(`ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS volume_discounts jsonb`);
    await client.query(`ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS includes_cloud_hosting boolean NOT NULL DEFAULT false`);
    await client.query(`ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS free_support_months int`);
    await client.query("DELETE FROM sector_pricing");
    for (const o of overrides) {
      await client.query(
        `INSERT INTO sector_pricing (sector_id, system, price_per_user, operating_costs, training_days, hosting_price, discount_percent, volume_discounts, includes_cloud_hosting, free_support_months)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (sector_id, system) DO NOTHING`,
        [o.sectorId, o.system, o.pricePerUser, o.operatingCosts, o.trainingDays,
         o.hostingPrice, o.discountPercent, o.volumeDiscounts != null ? JSON.stringify(o.volumeDiscounts) : null,
         Boolean(o.includesCloudHosting),
         o.freeSupportMonths == null ? null : Math.max(0, Math.round(o.freeSupportMonths))]
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
    cardImage: r.card_image ?? "",
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
           description_en, description_ar, hero_image, card_image, cta1_label_en, cta1_label_ar, cta1_url,
           cta2_label_en, cta2_label_ar, cta2_url, is_custom, enabled, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        [
          p.slug, p.name?.en ?? "", p.name?.ar ?? "", p.eyebrow?.en ?? "", p.eyebrow?.ar ?? "",
          p.title?.en ?? "", p.title?.ar ?? "", p.description?.en ?? "", p.description?.ar ?? "",
          p.heroImage ?? "", p.cardImage ?? "", p.cta1?.label?.en ?? "", p.cta1?.label?.ar ?? "", p.cta1?.url ?? "/demo",
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
