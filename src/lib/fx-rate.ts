/**
 * USD to EGP exchange rate for the Egypt price line (owner, 2026-10-15: the
 * Odoo price is kept in USD, Odoo's Egypt regional price, and converted to
 * EGP automatically). Server-only. Fetched from open.er-api.com (free, no
 * key, daily updates), cached in memory for 6 hours; on a failed fetch the
 * last good rate is kept, and with none the caller falls back to the manual
 * EGP price.
 */
const SOURCE = "https://open.er-api.com/v6/latest/USD";
const TTL_MS = 6 * 60 * 60 * 1000;
const RETRY_MS = 10 * 60 * 1000;

let cached: { rate: number; at: number } | null = null;
let lastAttempt = 0;

/** A plausible USD→EGP rate, or null. Guards against a broken or hostile response. */
export function parseEgpRate(body: unknown): number | null {
  const rate = (body as { rates?: Record<string, unknown> } | null)?.rates?.EGP;
  return typeof rate === "number" && Number.isFinite(rate) && rate > 5 && rate < 1000 ? rate : null;
}

export async function getUsdEgpRate(now = Date.now(), fetchImpl: typeof fetch = fetch): Promise<number | null> {
  if (cached && now - cached.at < TTL_MS) return cached.rate;
  if (now - lastAttempt < RETRY_MS) return cached?.rate ?? null;
  lastAttempt = now;
  try {
    const res = await fetchImpl(SOURCE, { signal: AbortSignal.timeout(3000), cache: "no-store" });
    const rate = res.ok ? parseEgpRate(await res.json()) : null;
    if (rate) cached = { rate, at: now };
  } catch {
    /* keep the last good rate */
  }
  return cached?.rate ?? null;
}

/** Test hook: forget the cached rate. */
export function resetFxCache(): void {
  cached = null;
  lastAttempt = 0;
}

export { usdToEgpText } from "./fx-rate-text";
