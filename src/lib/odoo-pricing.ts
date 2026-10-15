/**
 * Keeps the Egypt Odoo price in sync with odoo.com (owner, 2026-10-15). Odoo
 * prices by the requester's IP and this server is in Germany, so odoo.com is
 * read through the proxy in Egypt set in Integrations > Odoo prices. A visit
 * from Egypt triggers a refresh at most once a day, in the background; the
 * admin can force one. A new price lands in Settings > Egypt (odooFromUsd),
 * which the site converts to EGP at the live rate. Server-only.
 */
import { ProxyAgent, fetch as proxyFetch } from "undici";
import { getPool } from "@/lib/db/pool";
import { parseOdooStandardYearly, usableEgyptUsdPrice } from "@/lib/odoo-pricing-parse";

const PRICING_URL = "https://www.odoo.com/pricing";
const EVERY_MS = 24 * 60 * 60 * 1000;

export interface OdooPricingStatus {
  enabled: boolean;
  proxyUrl: string;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastPriceUsd: string;
  lastError: string;
}

export async function readPricingStatus(): Promise<OdooPricingStatus> {
  const pool = await getPool();
  const r = (
    await pool.query(
      `SELECT odoo_pricing_enabled, odoo_pricing_proxy, odoo_pricing_attempt_at, odoo_pricing_success_at,
              odoo_pricing_last_usd, odoo_pricing_last_error FROM integrations WHERE id = 1`,
    )
  ).rows[0];
  return {
    enabled: r?.odoo_pricing_enabled === true,
    proxyUrl: r?.odoo_pricing_proxy ?? "",
    lastAttemptAt: r?.odoo_pricing_attempt_at ? new Date(r.odoo_pricing_attempt_at).toISOString() : null,
    lastSuccessAt: r?.odoo_pricing_success_at ? new Date(r.odoo_pricing_success_at).toISOString() : null,
    lastPriceUsd: r?.odoo_pricing_last_usd ?? "",
    lastError: r?.odoo_pricing_last_error ?? "",
  };
}

export async function savePricingConfig(enabled: boolean, proxyUrl: string): Promise<void> {
  const pool = await getPool();
  await pool.query(`UPDATE integrations SET odoo_pricing_enabled = $1, odoo_pricing_proxy = $2 WHERE id = 1`, [
    enabled,
    proxyUrl.trim(),
  ]);
}

/** A proxy URL with an http(s) scheme, a host and a port; credentials allowed. */
export function isProxyUrl(v: string): boolean {
  try {
    const u = new URL(v.trim());
    return (u.protocol === "http:" || u.protocol === "https:") && !!u.hostname && !!u.port;
  } catch {
    return false;
  }
}

async function fetchThroughProxy(proxyUrl: string): Promise<string> {
  const dispatcher = new ProxyAgent(proxyUrl);
  try {
    const res = await proxyFetch(PRICING_URL, {
      dispatcher,
      headers: { "User-Agent": "Mozilla/5.0 (falcon-it.sa price check)", "Accept-Language": "en" },
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) throw new Error(`odoo.com answered ${res.status}`);
    return await res.text();
  } finally {
    await dispatcher.close().catch(() => {});
  }
}

export type RefreshResult =
  | { ok: true; priceUsd: string; changed: boolean }
  | { ok: false; skipped?: boolean; error: string };

let running: Promise<RefreshResult> | null = null;

/** Fetch Odoo's Egypt price now (force) or when the last attempt is a day old. Never throws. */
export function refreshOdooEgyptPrice(force = false): Promise<RefreshResult> {
  if (running) return running;
  running = doRefresh(force).finally(() => {
    running = null;
  });
  return running;
}

async function doRefresh(force: boolean): Promise<RefreshResult> {
  try {
    const status = await readPricingStatus();
    if (!status.enabled || !status.proxyUrl) return { ok: false, skipped: true, error: "Not enabled" };
    if (!force && status.lastAttemptAt && Date.now() - Date.parse(status.lastAttemptAt) < EVERY_MS) {
      return { ok: false, skipped: true, error: "Checked in the last 24 hours" };
    }
    const pool = await getPool();
    await pool.query(`UPDATE integrations SET odoo_pricing_attempt_at = now() WHERE id = 1`);

    let error = "";
    let price: string | null = null;
    try {
      const parsed = parseOdooStandardYearly(await fetchThroughProxy(status.proxyUrl));
      price = usableEgyptUsdPrice(parsed);
      if (!parsed) error = "Could not find the Standard price on odoo.com/pricing (page layout changed?)";
      else if (!price) {
        error = `odoo.com saw the proxy as ${parsed.country} and priced in ${parsed.currency}; the proxy must be in Egypt`;
      }
    } catch (e) {
      error = `Fetch through the proxy failed: ${e instanceof Error ? e.message : "error"}`;
    }

    if (!price) {
      await pool.query(`UPDATE integrations SET odoo_pricing_last_error = $1 WHERE id = 1`, [error.slice(0, 300)]);
      return { ok: false, error };
    }

    const before = (await pool.query(`SELECT egypt_entity->>'odooFromUsd' AS usd FROM site_settings WHERE id = 1`)).rows[0]
      ?.usd;
    await pool.query(
      `UPDATE site_settings SET egypt_entity = egypt_entity || jsonb_build_object('odooFromUsd', $1::text) WHERE id = 1`,
      [price],
    );
    await pool.query(
      `UPDATE integrations SET odoo_pricing_success_at = now(), odoo_pricing_last_usd = $1, odoo_pricing_last_error = '' WHERE id = 1`,
      [price],
    );
    return { ok: true, priceUsd: price, changed: before !== price };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "error" };
  }
}
