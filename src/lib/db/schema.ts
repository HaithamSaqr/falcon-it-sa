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

-- Base pricing (single row, id = 1) — values in USD
CREATE TABLE IF NOT EXISTS pricing_base (
  id                    int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  price_per_user        numeric NOT NULL DEFAULT 50,
  hosting_price         numeric NOT NULL DEFAULT 200,
  operating_costs       numeric NOT NULL DEFAULT 100,
  training_cost_per_day numeric NOT NULL DEFAULT 80,
  training_days         int     NOT NULL DEFAULT 3,
  discount_percent      numeric NOT NULL DEFAULT 10,
  usd_to_egp            numeric NOT NULL DEFAULT 50
);

-- Per-sector / per-system pricing overrides
CREATE TABLE IF NOT EXISTS sector_pricing (
  id              serial PRIMARY KEY,
  sector_id       text NOT NULL,
  system          text NOT NULL,
  price_per_user  numeric,
  operating_costs numeric,
  training_days   int,
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
  cta2_ar      text NOT NULL DEFAULT ''
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
`;

export async function ensureSchema(pool: Pool): Promise<void> {
  await pool.query(DDL);
  await pool.query(MIGRATIONS);
}
