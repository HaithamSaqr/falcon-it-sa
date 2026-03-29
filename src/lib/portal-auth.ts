/**
 * Portal Authentication — HMAC-SHA256 JWT for customer portal sessions.
 * Separate from admin auth. Authenticates against Odoo portal users.
 */

import crypto from "crypto";
import { cookies } from "next/headers";
import { getSettings } from "@/lib/data-store";
import type { PortalUser } from "@/types/admin";

const COOKIE_NAME = "falcon_portal_session";
const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

async function getSecret(): Promise<string> {
  const settings = await getSettings();
  return (
    settings.security?.jwtSecret ||
    process.env.ADMIN_JWT_SECRET ||
    "dev-fallback-secret-change-me"
  );
}

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

export async function createPortalToken(user: PortalUser): Promise<string> {
  const secret = await getSecret();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      role: "portal",
      uid: user.uid,
      name: user.name,
      email: user.email,
      partnerId: user.partnerId,
      iat: now,
      exp: now + TOKEN_EXPIRY_SECONDS,
    })
  );
  const signature = crypto
    .createHmac("sha256", secret + "_portal")
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${header}.${payload}.${signature}`;
}

export async function verifyPortalToken(
  token: string
): Promise<{ valid: boolean; user: PortalUser | null }> {
  try {
    const secret = await getSecret();
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return { valid: false, user: null };

    const expected = crypto
      .createHmac("sha256", secret + "_portal")
      .update(`${header}.${payload}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (signature !== expected) return { valid: false, user: null };

    const data = JSON.parse(base64urlDecode(payload));
    const now = Math.floor(Date.now() / 1000);
    if (data.exp && data.exp < now) return { valid: false, user: null };
    if (data.role !== "portal") return { valid: false, user: null };

    return {
      valid: true,
      user: {
        uid: data.uid,
        name: data.name,
        email: data.email,
        partnerId: data.partnerId,
      },
    };
  } catch {
    return { valid: false, user: null };
  }
}

export async function setPortalSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_EXPIRY_SECONDS,
  });
}

export async function clearPortalSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getPortalSession(): Promise<{
  authenticated: boolean;
  user: PortalUser | null;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return { authenticated: false, user: null };

    const { valid, user } = await verifyPortalToken(token);
    return { authenticated: valid, user };
  } catch {
    return { authenticated: false, user: null };
  }
}

export { COOKIE_NAME as PORTAL_COOKIE_NAME };
