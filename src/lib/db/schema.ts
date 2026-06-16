/**
 * Fully relational schema — no JSON document store.
 * Every config group is a real table with typed columns. Single-row config
 * tables (site_settings, hero_content, integrations) use id = 1.
 * The only remaining JSON is leads.data (heterogeneous form submissions).
 */

import type { Pool } from "pg";

const DDL = `
-- Leads (one row per submission; data is intentionally jsonb — variable shape)
CREATE TABLE IF NOT EXISTS leads (
  id         uuid PRIMARY KEY,
  type       text NOT NULL,
  status     text NOT NULL DEFAULT 'new',
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  source     text,
  locale     text,
  ip         text,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_type_idx       ON leads (type);
CREATE INDEX IF NOT EXISTS leads_status_idx     ON leads (status);

-- Admin users (login)
CREATE TABLE IF NOT EXISTS admin_users (
  id            serial PRIMARY KEY,
  username      text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'admin',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Office branches
CREATE TABLE IF NOT EXISTS branches (
  id         text PRIMARY KEY,
  name_en    text NOT NULL DEFAULT '',
  name_ar    text NOT NULL DEFAULT '',
  address_en text NOT NULL DEFAULT '',
  address_ar text NOT NULL DEFAULT '',
  phone      text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- WhatsApp number routing — Layer 1: per domain/subdomain.
CREATE TABLE IF NOT EXISTS whatsapp_domain_numbers (
  id         text PRIMARY KEY,
  domain     text NOT NULL DEFAULT '',
  number     text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0
);

-- WhatsApp number routing — Layer 2: per visitor country (ISO-2 from IP).
CREATE TABLE IF NOT EXISTS whatsapp_country_numbers (
  id         text PRIMARY KEY,
  country    text NOT NULL DEFAULT '',
  number     text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0
);

-- Site settings (single row, id = 1)
CREATE TABLE IF NOT EXISTS site_settings (
  id                     int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name_en        text NOT NULL DEFAULT '',
  company_name_ar        text NOT NULL DEFAULT '',
  company_email          text NOT NULL DEFAULT '',
  phone_ksa              text NOT NULL DEFAULT '',
  phone_egypt            text NOT NULL DEFAULT '',
  whatsapp               text NOT NULL DEFAULT '',
  gulf_only              boolean NOT NULL DEFAULT false,
  notif_email_on_new_lead boolean NOT NULL DEFAULT true,
  notif_sales_email      text NOT NULL DEFAULT '',
  social_linkedin        text NOT NULL DEFAULT '',
  social_twitter         text NOT NULL DEFAULT '',
  social_facebook        text NOT NULL DEFAULT '',
  social_instagram       text NOT NULL DEFAULT '',
  social_youtube         text NOT NULL DEFAULT '',
  social_tiktok          text NOT NULL DEFAULT '',
  login_url              text NOT NULL DEFAULT 'https://falcon-valley.com',
  jwt_secret             text NOT NULL DEFAULT '',
  rate_limit_max         int  NOT NULL DEFAULT 10,
  rate_limit_window_ms   int  NOT NULL DEFAULT 60000
);

-- SEO settings (single row, id = 1)
CREATE TABLE IF NOT EXISTS seo_settings (
  id                  int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  meta_title_en       text NOT NULL DEFAULT '',
  meta_title_ar       text NOT NULL DEFAULT '',
  meta_description_en text NOT NULL DEFAULT '',
  meta_description_ar text NOT NULL DEFAULT '',
  meta_keywords_en    text NOT NULL DEFAULT '',
  meta_keywords_ar    text NOT NULL DEFAULT '',
  og_image            text NOT NULL DEFAULT ''
);

-- Footer links (one row each, editable label + url)
CREATE TABLE IF NOT EXISTS footer_links (
  id         text PRIMARY KEY,
  section    text NOT NULL DEFAULT 'about',
  label_en   text NOT NULL DEFAULT '',
  label_ar   text NOT NULL DEFAULT '',
  url        text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0
);

-- Sectors (industries) — dynamic, admin-managed
CREATE TABLE IF NOT EXISTS sectors (
  id             text PRIMARY KEY,
  icon           text NOT NULL DEFAULT '',
  gradient       text NOT NULL DEFAULT '',
  name_en        text NOT NULL DEFAULT '',
  name_ar        text NOT NULL DEFAULT '',
  title_en       text NOT NULL DEFAULT '',
  title_ar       text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  systems        text[] NOT NULL DEFAULT '{}',
  video_url      text NOT NULL DEFAULT '',
  featured       boolean NOT NULL DEFAULT false,
  enabled        boolean NOT NULL DEFAULT true,
  sort_order     int NOT NULL DEFAULT 0
);

-- Landing-page video routing per sector — Layer 1: by domain/subdomain.
CREATE TABLE IF NOT EXISTS sector_video_domains (
  id         text PRIMARY KEY,
  sector_id  text NOT NULL,
  domain     text NOT NULL DEFAULT '',
  video_url  text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS sector_video_domains_sid ON sector_video_domains (sector_id);

-- Landing-page video routing per sector — Layer 2: by visitor country.
CREATE TABLE IF NOT EXISTS sector_video_countries (
  id         text PRIMARY KEY,
  sector_id  text NOT NULL,
  country    text NOT NULL DEFAULT '',
  video_url  text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS sector_video_countries_sid ON sector_video_countries (sector_id);

-- Per-sector CTA override (overrides the global Landing CTA / WhatsApp Routing).
-- kind = 'whatsapp' (value = number) or 'url' (value = link). Layer 1: by domain.
CREATE TABLE IF NOT EXISTS sector_cta_domains (
  id         text PRIMARY KEY,
  sector_id  text NOT NULL,
  domain     text NOT NULL DEFAULT '',
  kind       text NOT NULL DEFAULT 'whatsapp',
  value      text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS sector_cta_domains_sid ON sector_cta_domains (sector_id);

-- Per-sector CTA override — Layer 2: by visitor country (overrides domain).
CREATE TABLE IF NOT EXISTS sector_cta_countries (
  id         text PRIMARY KEY,
  sector_id  text NOT NULL,
  country    text NOT NULL DEFAULT '',
  kind       text NOT NULL DEFAULT 'whatsapp',
  value      text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS sector_cta_countries_sid ON sector_cta_countries (sector_id);

-- Base pricing (single row, id = 1) — values in USD
CREATE TABLE IF NOT EXISTS pricing_base (
  id                    int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  price_per_user        numeric NOT NULL DEFAULT 50,
  hosting_price         numeric NOT NULL DEFAULT 200,
  operating_costs       numeric NOT NULL DEFAULT 100,
  training_cost_per_day numeric NOT NULL DEFAULT 80,
  training_days         int     NOT NULL DEFAULT 3,
  discount_percent      numeric NOT NULL DEFAULT 10,
  usd_to_egp              numeric NOT NULL DEFAULT 50,
  usd_to_sar              numeric NOT NULL DEFAULT 3.75,
  volume_discounts        jsonb   NOT NULL DEFAULT '[]',
  system_training_days    jsonb   NOT NULL DEFAULT '{}',
  free_support_months     int     NOT NULL DEFAULT 0,
  lifetime_license        boolean NOT NULL DEFAULT false
);

-- Per-sector / per-system pricing overrides
CREATE TABLE IF NOT EXISTS sector_pricing (
  id              serial PRIMARY KEY,
  sector_id       text NOT NULL,
  system          text NOT NULL,
  price_per_user  numeric,
  operating_costs numeric,
  training_days   int,
  hosting_price   numeric,
  discount_percent numeric,
  volume_discounts jsonb,
  includes_cloud_hosting boolean NOT NULL DEFAULT false,
  lifetime_license boolean,
  UNIQUE (sector_id, system)
);

-- Clients (logos + tags). The tags column holds client_tags ids.
CREATE TABLE IF NOT EXISTS clients (
  id         text PRIMARY KEY,
  name_en    text NOT NULL DEFAULT '',
  name_ar    text NOT NULL DEFAULT '',
  logo       text NOT NULL DEFAULT '',
  tags       text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0
);

-- Client tag definitions (bilingual)
CREATE TABLE IF NOT EXISTS client_tags (
  id         text PRIMARY KEY,
  name_en    text NOT NULL DEFAULT '',
  name_ar    text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0
);

-- Products (hero + meta, admin-managed)
CREATE TABLE IF NOT EXISTS products (
  slug            text PRIMARY KEY,
  name_en         text NOT NULL DEFAULT '',
  name_ar         text NOT NULL DEFAULT '',
  eyebrow_en      text NOT NULL DEFAULT '',
  eyebrow_ar      text NOT NULL DEFAULT '',
  title_en        text NOT NULL DEFAULT '',
  title_ar        text NOT NULL DEFAULT '',
  description_en  text NOT NULL DEFAULT '',
  description_ar  text NOT NULL DEFAULT '',
  hero_image      text NOT NULL DEFAULT '',
  card_image      text NOT NULL DEFAULT '',
  embed_html_en   text NOT NULL DEFAULT '',
  embed_html_ar   text NOT NULL DEFAULT '',
  cta1_label_en   text NOT NULL DEFAULT '',
  cta1_label_ar   text NOT NULL DEFAULT '',
  cta1_url        text NOT NULL DEFAULT '/demo',
  cta2_label_en   text NOT NULL DEFAULT '',
  cta2_label_ar   text NOT NULL DEFAULT '',
  cta2_url        text NOT NULL DEFAULT '/contact',
  is_custom       boolean NOT NULL DEFAULT false,
  enabled         boolean NOT NULL DEFAULT true,
  sort_order      int NOT NULL DEFAULT 0
);

-- Product brochures (rich HTML content per product slug)
CREATE TABLE IF NOT EXISTS product_brochures (
  slug        text PRIMARY KEY,
  title_en    text NOT NULL DEFAULT '',
  title_ar    text NOT NULL DEFAULT '',
  content_en  text NOT NULL DEFAULT '',
  content_ar  text NOT NULL DEFAULT '',
  enabled     boolean NOT NULL DEFAULT false,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Hero content (single row, id = 1)
CREATE TABLE IF NOT EXISTS hero_content (
  id           int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  title_en     text NOT NULL DEFAULT '',
  title_ar     text NOT NULL DEFAULT '',
  subtitle_en  text NOT NULL DEFAULT '',
  subtitle_ar  text NOT NULL DEFAULT '',
  cta1_en      text NOT NULL DEFAULT '',
  cta1_ar      text NOT NULL DEFAULT '',
  cta2_en      text NOT NULL DEFAULT '',
  cta2_ar      text NOT NULL DEFAULT '',
  eyebrow_en   text NOT NULL DEFAULT '',
  eyebrow_ar   text NOT NULL DEFAULT '',
  cta1_url     text NOT NULL DEFAULT '',
  cta2_url     text NOT NULL DEFAULT '',
  hero_image   text NOT NULL DEFAULT '',
  trust1_en    text NOT NULL DEFAULT '',
  trust1_ar    text NOT NULL DEFAULT '',
  trust2_en    text NOT NULL DEFAULT '',
  trust2_ar    text NOT NULL DEFAULT ''
);

-- Testimonials (one row each)
CREATE TABLE IF NOT EXISTS testimonials (
  id         text PRIMARY KEY,
  name       text NOT NULL DEFAULT '',
  role       text NOT NULL DEFAULT '',
  company    text NOT NULL DEFAULT '',
  quote_en   text NOT NULL DEFAULT '',
  quote_ar   text NOT NULL DEFAULT '',
  image      text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0
);

-- FAQs (one row each)
CREATE TABLE IF NOT EXISTS faqs (
  id          text PRIMARY KEY,
  question_en text NOT NULL DEFAULT '',
  question_ar text NOT NULL DEFAULT '',
  answer_en   text NOT NULL DEFAULT '',
  answer_ar   text NOT NULL DEFAULT '',
  sort_order  int  NOT NULL DEFAULT 0
);

-- Stats (one row each)
CREATE TABLE IF NOT EXISTS stats (
  id         serial PRIMARY KEY,
  value      bigint NOT NULL DEFAULT 0,
  suffix     text NOT NULL DEFAULT '',
  label_en   text NOT NULL DEFAULT '',
  label_ar   text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0
);

-- Home page cards (Why-ERP-Fails + Why-Choose-Falcon). section discriminates the group.
CREATE TABLE IF NOT EXISTS home_cards (
  id         text PRIMARY KEY,
  section    text NOT NULL,
  icon       text NOT NULL DEFAULT '',
  title_en   text NOT NULL DEFAULT '',
  title_ar   text NOT NULL DEFAULT '',
  desc_en    text NOT NULL DEFAULT '',
  desc_ar    text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS home_cards_section_idx ON home_cards (section, sort_order);

-- Home page bilingual text (section headings, CTA banner, newsletter). key/value_en/value_ar.
CREATE TABLE IF NOT EXISTS home_text (
  key       text PRIMARY KEY,
  value_en  text NOT NULL DEFAULT '',
  value_ar  text NOT NULL DEFAULT ''
);

-- Integrations (single row, id = 1)
CREATE TABLE IF NOT EXISTS integrations (
  id                        int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  odoo_enabled              boolean NOT NULL DEFAULT false,
  odoo_url                  text NOT NULL DEFAULT '',
  odoo_db                   text NOT NULL DEFAULT '',
  odoo_username             text NOT NULL DEFAULT '',
  odoo_api_key              text NOT NULL DEFAULT '',
  odoo_last_tested_at       timestamptz,
  odoo_last_test_result     text,
  ai_enabled                boolean NOT NULL DEFAULT false,
  ai_server_url             text NOT NULL DEFAULT '',
  ai_api_key                text NOT NULL DEFAULT '',
  calendar_enabled          boolean NOT NULL DEFAULT false,
  calendar_resource_id      int NOT NULL DEFAULT 1,
  calendar_slot_duration    int NOT NULL DEFAULT 30,
  calendar_available_days   int[] NOT NULL DEFAULT '{0,1,2,3,4}',
  calendar_start_hour       int NOT NULL DEFAULT 9,
  calendar_end_hour         int NOT NULL DEFAULT 17,
  calendar_buffer_minutes   int NOT NULL DEFAULT 10,
  calendar_max_advance_days int NOT NULL DEFAULT 30,
  email_enabled             boolean NOT NULL DEFAULT false,
  email_provider            text NOT NULL DEFAULT 'resend',
  email_api_key             text NOT NULL DEFAULT '',
  email_from_email          text NOT NULL DEFAULT '',
  email_reply_to            text NOT NULL DEFAULT '',
  whatsapp_enabled          boolean NOT NULL DEFAULT false,
  whatsapp_api_token        text NOT NULL DEFAULT '',
  whatsapp_phone_id         text NOT NULL DEFAULT '',
  helpdesk_enabled          boolean NOT NULL DEFAULT false,
  helpdesk_default_team_id  int NOT NULL DEFAULT 0,
  helpdesk_allow_rating     boolean NOT NULL DEFAULT true,
  helpdesk_allow_new_tickets boolean NOT NULL DEFAULT true
);
`;

// Idempotent column additions for databases created by an earlier version.
const MIGRATIONS = `
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_tiktok text NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS login_url text NOT NULL DEFAULT 'https://falcon-valley.com';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS odoo_api_key text NOT NULL DEFAULT '';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS ai_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS ai_server_url text NOT NULL DEFAULT '';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS ai_api_key text NOT NULL DEFAULT '';
ALTER TABLE sectors ADD COLUMN IF NOT EXISTS video_url text NOT NULL DEFAULT '';
ALTER TABLE pricing_base ADD COLUMN IF NOT EXISTS usd_to_sar numeric NOT NULL DEFAULT 3.75;
ALTER TABLE pricing_base ADD COLUMN IF NOT EXISTS volume_discounts jsonb NOT NULL DEFAULT '[]';
ALTER TABLE pricing_base ADD COLUMN IF NOT EXISTS system_training_days jsonb NOT NULL DEFAULT '{}';
ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS hosting_price numeric;
ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS discount_percent numeric;
ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS volume_discounts jsonb;
ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS includes_cloud_hosting boolean NOT NULL DEFAULT false;
ALTER TABLE pricing_base ADD COLUMN IF NOT EXISTS free_support_months int NOT NULL DEFAULT 0;
ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS free_support_months int;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS google_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS google_verification text NOT NULL DEFAULT '';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS google_gtm_id text NOT NULL DEFAULT '';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS google_ga4_id text NOT NULL DEFAULT '';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS google_ads_id text NOT NULL DEFAULT '';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS google_ads_quote_label text NOT NULL DEFAULT '';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS google_ads_demo_label text NOT NULL DEFAULT '';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS google_ads_contact_label text NOT NULL DEFAULT '';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS google_ads_whatsapp_label text NOT NULL DEFAULT '';
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS eyebrow_en text NOT NULL DEFAULT '';
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS eyebrow_ar text NOT NULL DEFAULT '';
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS cta1_url text NOT NULL DEFAULT '';
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS cta2_url text NOT NULL DEFAULT '';
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS hero_image text NOT NULL DEFAULT '';
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS trust1_en text NOT NULL DEFAULT '';
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS trust1_ar text NOT NULL DEFAULT '';
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS trust2_en text NOT NULL DEFAULT '';
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS trust2_ar text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS card_image text NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS landing_cta_mode text NOT NULL DEFAULT 'whatsapp';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS landing_cta_url text NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS landing_cta_label_en text NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS landing_cta_label_ar text NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS landing_cta_note_en text NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS landing_cta_note_ar text NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS clients_speed numeric NOT NULL DEFAULT 3;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS snapchat_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS snapchat_pixel_id text NOT NULL DEFAULT 'c0116458-0cf9-41e9-a95b-4f29bd552620';
ALTER TABLE pricing_base ADD COLUMN IF NOT EXISTS lifetime_license boolean NOT NULL DEFAULT false;
ALTER TABLE sector_pricing ADD COLUMN IF NOT EXISTS lifetime_license boolean;
ALTER TABLE products ADD COLUMN IF NOT EXISTS embed_html_en text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS embed_html_ar text NOT NULL DEFAULT '';
`;

export async function ensureSchema(pool: Pool): Promise<void> {
  await pool.query(DDL);
  await pool.query(MIGRATIONS);
}
