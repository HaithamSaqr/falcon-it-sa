/**
 * Admin Authentication — HMAC-SHA256 JWT with HttpOnly cookies.
 * Zero external dependencies (uses Node.js crypto).
 * Reads password & JWT secret from the settings store (admin-configurable).
 */

import crypto from "crypto";
import { cookies } from "next/headers";
import { getSettings } from "@/lib/data-store";

const COOKIE_NAME = "falcon_admin_session";
const TOKEN_EXPIRY_SECONDS = 24 * 60 * 60; // 24 hours

// ── Dynamic config loader ───────────────────────────────────────────
async function getSecurityConfig() {
  const settings = await getSettings();
  return {
    adminPassword: settings.security?.adminPassword || process.env.ADMIN_PASSWORD || "",
    jwtSecret: settings.security?.jwtSecret || process.env.ADMIN_JWT_SECRET || "dev-fallback-secret-change-me",
  };
}

// ── Password verification ───────────────────────────────────────────
export async function verifyPassword(password: string): Promise<boolean> {
  const { adminPassword } = await getSecurityConfig();
  if (!adminPassword) return false;
  // Constant-time comparison to prevent timing attacks
  const a = Buffer.from(password);
  const b = Buffer.from(adminPassword);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ── JWT helpers (minimal HMAC-SHA256) ───────────────────────────────
function base64url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
}

export async function createToken(): Promise<string> {
  const { jwtSecret } = await getSecurityConfig();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ role: "admin", iat: now, exp: now + TOKEN_EXPIRY_SECONDS })
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

export async function verifyToken(token: string): Promise<{ valid: boolean; expired: boolean }> {
  try {
    const { jwtSecret } = await getSecurityConfig();
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return { valid: false, expired: false };

    // Verify signature
    const expected = crypto
      .createHmac("sha256", jwtSecret)
      .update(`${header}.${payload}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (signature !== expected) return { valid: false, expired: false };

    // Check expiry
    const data = JSON.parse(base64urlDecode(payload));
    const now = Math.floor(Date.now() / 1000);
    if (data.exp && data.exp < now) return { valid: false, expired: true };

    return { valid: true, expired: false };
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

export async function getSession(): Promise<{ authenticated: boolean }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return { authenticated: false };

    const { valid } = await verifyToken(token);
    return { authenticated: valid };
  } catch {
    return { authenticated: false };
  }
}

// ── Setup check ─────────────────────────────────────────────────────
export async function isSetupComplete(): Promise<boolean> {
  const { adminPassword } = await getSecurityConfig();
  return Boolean(adminPassword);
}

// ── API route auth guard ────────────────────────────────────────────
export async function requireAuth(): Promise<{ authenticated: boolean }> {
  return getSession();
}

export { COOKIE_NAME };
