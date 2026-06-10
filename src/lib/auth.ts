/**
 * Admin Authentication — HMAC-SHA256 JWT with HttpOnly cookies.
 * Credentials live in the `admin_users` table; the JWT signing secret lives in
 * `site_settings.jwt_secret`.
 */

import crypto from "crypto";
import { cookies } from "next/headers";
import { findAdmin, adminCount, getJwtSecret } from "@/lib/data-store";
import { verifyPasswordHash } from "@/lib/password";

const COOKIE_NAME = "falcon_admin_session";
const TOKEN_EXPIRY_SECONDS = 24 * 60 * 60; // 24 hours

// Remember the last good JWT secret so a transient read miss can't drop sessions.
let cachedJwtSecret: string | null = null;

async function resolveJwtSecret(): Promise<string> {
  const dbSecret = await getJwtSecret();
  if (dbSecret) cachedJwtSecret = dbSecret;
  return dbSecret || cachedJwtSecret || process.env.ADMIN_JWT_SECRET || "dev-fallback-secret-change-me";
}

// ── Credential verification ─────────────────────────────────────────
export async function verifyLogin(username: string, password: string): Promise<boolean> {
  const admin = await findAdmin(username);
  if (!admin) return false;
  return verifyPasswordHash(password, admin.passwordHash);
}

// ── JWT helpers (minimal HMAC-SHA256) ───────────────────────────────
function base64url(str: string): string {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
}

export async function createToken(username: string): Promise<string> {
  const jwtSecret = await resolveJwtSecret();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ role: "admin", sub: username, iat: now, exp: now + TOKEN_EXPIRY_SECONDS })
  );
  const signature = crypto
    .createHmac("sha256", jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${header}.${payload}.${signature}`;
}

export async function verifyToken(
  token: string
): Promise<{ valid: boolean; expired: boolean; username?: string }> {
  try {
    const jwtSecret = await resolveJwtSecret();
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return { valid: false, expired: false };

    const expected = crypto
      .createHmac("sha256", jwtSecret)
      .update(`${header}.${payload}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (signature !== expected) return { valid: false, expired: false };

    const data = JSON.parse(base64urlDecode(payload));
    const now = Math.floor(Date.now() / 1000);
    if (data.exp && data.exp < now) return { valid: false, expired: true };

    return { valid: true, expired: false, username: data.sub };
  } catch {
    return { valid: false, expired: false };
  }
}

// ── Cookie helpers ──────────────────────────────────────────────────
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_EXPIRY_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<{ authenticated: boolean; username?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return { authenticated: false };

    const { valid, username } = await verifyToken(token);
    return { authenticated: valid, username };
  } catch {
    return { authenticated: false };
  }
}

// ── Setup check ─────────────────────────────────────────────────────
export async function isSetupComplete(): Promise<boolean> {
  return (await adminCount()) > 0;
}

// ── API route auth guard ────────────────────────────────────────────
export async function requireAuth(): Promise<{ authenticated: boolean; username?: string }> {
  return getSession();
}

export { COOKIE_NAME };
