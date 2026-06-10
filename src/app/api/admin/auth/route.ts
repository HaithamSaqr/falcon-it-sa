import { NextRequest } from "next/server";
import {
  verifyLogin,
  createToken,
  setSessionCookie,
  clearSessionCookie,
  isSetupComplete,
} from "@/lib/auth";
import { jsonSuccess, jsonError, checkRateLimit, jsonRateLimited } from "@/lib/api-helpers";

// GET /api/admin/auth — Check setup status
export async function GET() {
  const setupDone = await isSetupComplete();
  return jsonSuccess({ setupComplete: setupDone });
}

// POST /api/admin/auth — Login (username + password)
export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  const body = await request.json().catch(() => null);

  const setupDone = await isSetupComplete();
  if (!setupDone) {
    return jsonError("Setup not complete. Please finish the setup wizard first.", 403);
  }

  const username = (body?.username as string | undefined)?.trim();
  const password = body?.password as string | undefined;
  if (!username || !password) {
    return jsonError("Username and password are required", 400);
  }

  if (!(await verifyLogin(username, password))) {
    return jsonError("Invalid username or password", 401);
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
