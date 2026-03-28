import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getIntegrations, updateIntegrations } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

function maskSecret(value: string): string {
  if (!value || value.length < 8) return value ? "••••" : "";
  return "••••••••" + value.slice(-4);
}

// GET /api/admin/integrations
export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const settings = await getIntegrations();

  // Mask sensitive fields
  const masked = {
    ...settings,
    odoo: {
      ...settings.odoo,
      password: maskSecret(settings.odoo.password),
    },
    email: {
      ...settings.email,
      apiKey: maskSecret(settings.email.apiKey),
    },
    whatsapp: {
      ...settings.whatsapp,
      apiToken: maskSecret(settings.whatsapp.apiToken),
    },
  };

  return jsonSuccess(masked);
}

// PUT /api/admin/integrations
export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body", 400);

  // Preserve existing secrets if masked values are sent back
  const current = await getIntegrations();

  if (body.odoo?.password?.startsWith("••••")) {
    body.odoo.password = current.odoo.password;
  }
  if (body.email?.apiKey?.startsWith("••••")) {
    body.email.apiKey = current.email.apiKey;
  }
  if (body.whatsapp?.apiToken?.startsWith("••••")) {
    body.whatsapp.apiToken = current.whatsapp.apiToken;
  }

  await updateIntegrations(body);
  return jsonSuccess({ saved: true }, "Integration settings updated");
}
