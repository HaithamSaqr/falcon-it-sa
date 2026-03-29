import { NextRequest } from "next/server";
import { jsonSuccess, jsonError, jsonRateLimited, checkRateLimit, parseBody } from "@/lib/api-helpers";
import { authenticatePortalUser } from "@/lib/odoo/client";
import { getIntegrations } from "@/lib/data-store";
import {
  createPortalToken,
  setPortalSessionCookie,
  clearPortalSessionCookie,
  getPortalSession,
} from "@/lib/portal-auth";

// GET — Check portal session
export async function GET() {
  const session = await getPortalSession();
  if (!session.authenticated || !session.user) {
    return jsonSuccess({ authenticated: false, user: null });
  }
  return jsonSuccess({
    authenticated: true,
    user: {
      uid: session.user.uid,
      name: session.user.name,
      email: session.user.email,
    },
  });
}

// POST — Login
export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  const integrations = await getIntegrations();
  if (!integrations.helpdesk.enabled) {
    return jsonError("Client portal is not enabled", 503);
  }

  const { data, error } = await parseBody<{ email: string; password: string }>(request);
  if (error || !data) return jsonError(error || "Invalid request");

  const { email, password } = data;
  if (!email || !password) {
    return jsonError("Email and password are required");
  }

  const user = await authenticatePortalUser(email, password);
  if (!user) {
    return jsonError("Invalid email or password", 401);
  }

  const token = await createPortalToken({
    uid: user.uid,
    name: user.name,
    email,
    partnerId: user.partnerId,
  });

  await setPortalSessionCookie(token);

  return jsonSuccess({
    authenticated: true,
    user: { uid: user.uid, name: user.name, email },
  });
}

// DELETE — Logout
export async function DELETE() {
  await clearPortalSessionCookie();
  return jsonSuccess({ authenticated: false });
}
