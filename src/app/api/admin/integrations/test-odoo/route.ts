import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { testOdooConnection } from "@/lib/odoo/client";
import { getIntegrations, updateIntegrations } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// POST /api/admin/integrations/test-odoo
export async function POST(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body", 400);

  const { url, db, username } = body;
  const apiKey = body.apiKey ?? body.password;

  if (!url || !db || !username || !apiKey) {
    return jsonError("All Odoo fields are required", 400);
  }

  // If the API key is masked, use the stored one.
  let actualKey = apiKey;
  if (String(apiKey).startsWith("••••")) {
    const current = await getIntegrations();
    actualKey = current.odoo.apiKey;
  }

  const result = await testOdooConnection(url, db, username, actualKey);

  // Update last test result
  const integrations = await getIntegrations();
  integrations.odoo.lastTestedAt = new Date().toISOString();
  integrations.odoo.lastTestResult = result.success ? "success" : "failed";
  await updateIntegrations(integrations);

  return jsonSuccess(result);
}
