/**
 * Schema creation + default seeding.
 * Runs idempotently (CREATE TABLE IF NOT EXISTS / INSERT ... ON CONFLICT DO NOTHING).
 */

import type { Pool } from "pg";
import { DEFAULT_SETTINGS, DEFAULT_CONTENT, DEFAULT_INTEGRATIONS } from "./defaults";

const DDL = `
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

CREATE TABLE IF NOT EXISTS singletons (
  key   text PRIMARY KEY,
  value jsonb NOT NULL
);
`;

/** Create all tables/indexes if missing. */
export async function ensureSchema(pool: Pool): Promise<void> {
  await pool.query(DDL);
}

/** Insert default singleton documents only if absent. Returns the seeded settings. */
export async function seedDefaults(pool: Pool): Promise<void> {
  await pool.query(
    `INSERT INTO singletons (key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO NOTHING`,
    ["content", JSON.stringify(DEFAULT_CONTENT)]
  );
  await pool.query(
    `INSERT INTO singletons (key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO NOTHING`,
    ["integrations", JSON.stringify(DEFAULT_INTEGRATIONS)]
  );
  await pool.query(
    `INSERT INTO singletons (key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO NOTHING`,
    ["settings", JSON.stringify(DEFAULT_SETTINGS)]
  );
}
