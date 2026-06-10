import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getSettings,
  updateSettings,
  adminCount,
  setAdminPassword,
  firstAdminUsername,
} from "@/lib/data-store";
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
  const hasAdmin = (await adminCount()) > 0;

  // Mask sensitive fields.
  const masked = JSON.parse(JSON.stringify(settings)) as SiteSettings;
  if (masked.security) {
    masked.security.adminPassword = hasAdmin ? MASK : "";
    masked.security.jwtSecret = maskValue(settings.security.jwtSecret);
    delete masked.security.adminPasswordHash;
  }

  return jsonSuccess(masked);
}

// PUT /api/admin/settings
export async function PUT(request: NextRequest) {
  const { authenticated, username } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const body = (await request.json().catch(() => null)) as SiteSettings | null;
  if (!body) return jsonError("Invalid body", 400);

  const existing = await getSettings();

  if (body.security) {
    // Admin password change → admin_users table (not settings).
    const typed = body.security.adminPassword;
    if (typed && !isMasked(typed) && typed.trim().length > 0) {
      const target = username || (await firstAdminUsername());
      if (target) await setAdminPassword(target, hashPassword(typed));
    }

    // JWT secret: keep existing if masked / empty.
    let jwtSecret = existing.security.jwtSecret;
    if (body.security.jwtSecret && !isMasked(body.security.jwtSecret)) {
      jwtSecret = body.security.jwtSecret;
    }

    body.security = {
      ...existing.security,
      ...body.security,
      adminPassword: "",
      jwtSecret,
    };
  } else {
    body.security = existing.security;
  }

  await updateSettings(body);
  return jsonSuccess({ saved: true }, "Settings updated successfully");
}
