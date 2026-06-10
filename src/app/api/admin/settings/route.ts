import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { hashPassword } from "@/lib/password";
import type { SiteSettings } from "@/types/admin";

const MASK = "••••••••";

function maskValue(val: string): string {
  if (!val || val.length <= 4) return MASK;
  return MASK + val.slice(-4);
}

function isMasked(val: string): boolean {
  return val.startsWith(MASK);
}

// GET /api/admin/settings
export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const settings = await getSettings();

  // Mask sensitive security fields; never expose the password hash.
  const masked = JSON.parse(JSON.stringify(settings)) as SiteSettings;
  if (masked.security) {
    // Show a masked placeholder if a password is configured, else empty.
    masked.security.adminPassword = settings.security.adminPasswordHash ? MASK : "";
    masked.security.jwtSecret = maskValue(settings.security.jwtSecret);
    delete masked.security.adminPasswordHash;
  }

  return jsonSuccess(masked);
}

// PUT /api/admin/settings
export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null) as SiteSettings | null;
  if (!body) return jsonError("Invalid body", 400);

  const existing = await getSettings();

  // Merge security carefully so credentials set during setup are never wiped
  // by the settings form (which doesn't render every field).
  if (body.security) {
    const incoming = body.security;

    // Admin password: only re-hash when a real new plaintext value was typed.
    let adminPasswordHash = existing.security.adminPasswordHash || "";
    const typed = incoming.adminPassword;
    if (typed && !isMasked(typed) && typed.trim().length > 0) {
      adminPasswordHash = hashPassword(typed);
    }

    // JWT secret: keep existing if masked / empty.
    let jwtSecret = existing.security.jwtSecret;
    if (incoming.jwtSecret && !isMasked(incoming.jwtSecret)) {
      jwtSecret = incoming.jwtSecret;
    }

    body.security = {
      ...existing.security,
      ...incoming,
      adminUsername: incoming.adminUsername?.trim() || existing.security.adminUsername,
      adminPassword: "", // never persist plaintext
      adminPasswordHash,
      jwtSecret,
    };
  } else {
    body.security = existing.security;
  }

  await updateSettings(body);
  return jsonSuccess({ saved: true }, "Settings updated successfully");
}
