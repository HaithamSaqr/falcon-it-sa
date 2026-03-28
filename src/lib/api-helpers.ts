/**
 * API Route Helpers
 * Rate limiting, CORS, error handling, and response utilities.
 */

import { NextRequest, NextResponse } from "next/server";

// ── Types ───────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ── Rate Limiter (in-memory, per-IP) ────────────────────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cache rate limit config for 60s to avoid reading settings on every request
let rateLimitCache: { max: number; window: number; cachedAt: number } | null = null;

async function getRateLimitConfig() {
  const now = Date.now();
  if (rateLimitCache && now - rateLimitCache.cachedAt < 60_000) {
    return rateLimitCache;
  }
  // Dynamic import to avoid circular deps at module load
  const { getSettings } = await import("@/lib/data-store");
  const settings = await getSettings();
  rateLimitCache = {
    max: settings.security?.rateLimitMax || Number(process.env.RATE_LIMIT_MAX) || 10,
    window: settings.security?.rateLimitWindowMs || Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    cachedAt: now,
  };
  return rateLimitCache;
}

export async function checkRateLimit(request: NextRequest): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const { max: RATE_LIMIT_MAX, window: RATE_LIMIT_WINDOW } = await getRateLimitConfig();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10_000) {
    for (const [key, val] of rateLimitStore) {
      if (val.resetAt < now) rateLimitStore.delete(key);
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  entry.count += 1;

  if (entry.count > RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

// ── Response helpers ────────────────────────────────────────────────
export function jsonSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, message } satisfies ApiResponse<T>,
    { status }
  );
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json(
    { success: false, error } satisfies ApiResponse,
    { status }
  );
}

export function jsonRateLimited() {
  return NextResponse.json(
    {
      success: false,
      error: "Too many requests. Please try again later.",
    } satisfies ApiResponse,
    { status: 429 }
  );
}

// ── Parse & validate JSON body ──────────────────────────────────────
export async function parseBody<T>(
  request: NextRequest
): Promise<{ data: T | null; error: string | null }> {
  try {
    const body = await request.json();
    return { data: body as T, error: null };
  } catch {
    return { data: null, error: "Invalid JSON body" };
  }
}

// ── Extract locale from request ─────────────────────────────────────
export function getLocale(request: NextRequest): "ar" | "en" {
  const referer = request.headers.get("referer") || "";
  if (referer.includes("/ar/") || referer.includes("/ar")) return "ar";

  const acceptLang = request.headers.get("accept-language") || "";
  if (acceptLang.startsWith("ar")) return "ar";

  return "en";
}

// ── Extract UTM params from request headers ─────────────────────────
export function getUtmParams(request: NextRequest) {
  const referer = request.headers.get("referer") || "";
  try {
    const url = new URL(referer);
    return {
      utmSource: url.searchParams.get("utm_source") || undefined,
      utmMedium: url.searchParams.get("utm_medium") || undefined,
      utmCampaign: url.searchParams.get("utm_campaign") || undefined,
    };
  } catch {
    return {};
  }
}

// ── Log lead for local fallback ─────────────────────────────────────
export function logLeadFallback(type: string, data: Record<string, unknown>) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[LEAD CAPTURED] Type: ${type}`);
  console.log(`[LEAD CAPTURED] Time: ${new Date().toISOString()}`);
  console.log(`[LEAD CAPTURED] Data:`, JSON.stringify(data, null, 2));
  console.log(`${"=".repeat(60)}\n`);
}
