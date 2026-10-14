import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { listAssignmentOptions } from "@/lib/odoo/client";
import { getIntegrations } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// POST /api/admin/integrations/odoo-options
// Lists the internal users and CRM teams of the Odoo in the form, so the
// admin can pick who owns website leads instead of typing raw ids.
export async function POST(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body", 400);

  const { url, db, username } = body;
  let apiKey = body.apiKey ?? body.password;
  if (!url || !db || !username || !apiKey) {
    return jsonError("All Odoo fields are required", 400);
  }

  // A masked key means "the one already saved".
  if (String(apiKey).startsWith("••••")) {
    apiKey = (await getIntegrations()).odoo.apiKey;
  }

  return jsonSuccess(await listAssignmentOptions(url, db, username, apiKey));
}
