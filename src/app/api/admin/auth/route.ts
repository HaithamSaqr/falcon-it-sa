import { NextRequest } from "next/server";
import {
  verifyPassword,
  createToken,
  setSessionCookie,
  clearSessionCookie,
  isSetupComplete,
} from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/data-store";
import { jsonSuccess, jsonError, checkRateLimit, jsonRateLimited } from "@/lib/api-helpers";
import crypto from "crypto";

// GET /api/admin/auth — Check setup status
export async function GET() {
  const setupDone = await isSetupComplete();
  return jsonSuccess({ setupComplete: setupDone });
}

// POST /api/admin/auth — Login or Initial Setup
export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  const body = await request.json().catch(() => null);

  // ── Initial setup: set password for the first time ──
  if (body?.action === "setup") {
    const setupDone = await isSetupComplete();
    if (setupDone) return jsonError("Admin password is already configured", 400);

    const newPassword = body.password as string;
    if (!newPassword || newPassword.length < 6) {
      return jsonError("Password must be at least 6 characters", 400);
    }

    const settings = await getSettings();
    settings.security = {
      ...settings.security,
      adminPassword: newPassword,
      jwtSecret: settings.security?.jwtSecret || crypto.randomUUID() + crypto.randomUUID(),
    };
    await updateSettings(settings);

    // Auto-login after setup
    const token = await createToken();
    await setSessionCookie(token);

    return jsonSuccess({ authenticated: true }, "Admin password set successfully");
  }

  // ── Normal login ──
  if (!body?.password) return jsonError("Password is required", 400);

  const setupDone = await isSetupComplete();
  if (!setupDone) return jsonError("Admin password not configured. Please complete setup first.", 403);

  if (!(await verifyPassword(body.password))) {
    return jsonError("Invalid password", 401);
  }

  const token = await createToken();
  await setSessionCookie(token);

  return jsonSuccess({ authenticated: true }, "Login successful");
}

// DELETE /api/admin/auth — Logout
export async function DELETE() {
  await clearSessionCookie();
  return jsonSuccess({ authenticated: false }, "Logged out");
}
