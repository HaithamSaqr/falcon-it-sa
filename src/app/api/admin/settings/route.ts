import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
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

  // Mask sensitive security fields
  const masked = JSON.parse(JSON.stringify(settings)) as SiteSettings;
  if (masked.security) {
    masked.security.adminPassword = maskValue(settings.security.adminPassword);
    masked.security.jwtSecret = maskValue(settings.security.jwtSecret);
  }

  return jsonSuccess(masked);
}

// PUT /api/admin/settings
export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null) as SiteSettings | null;
  if (!body) return jsonError("Invalid body", 400);

  // Preserve existing secrets if masked values were sent back
  if (body.security) {
    const existing = await getSettings();
    if (isMasked(body.security.adminPassword)) {
      body.security.adminPassword = existing.security.adminPassword;
    }
    if (isMasked(body.security.jwtSecret)) {
      body.security.jwtSecret = existing.security.jwtSecret;
    }
  }

  await updateSettings(body);
  return jsonSuccess({ saved: true }, "Settings updated successfully");
}
