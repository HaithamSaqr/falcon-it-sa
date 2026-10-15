import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { isProxyUrl, readPricingStatus, refreshOdooEgyptPrice, savePricingConfig } from "@/lib/odoo-pricing";

/** The proxy URL carries a password: show only its host and port. */
function maskProxy(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    return `••••@${u.hostname}:${u.port}`;
  } catch {
    return "••••";
  }
}

// GET /api/admin/integrations/odoo-pricing: settings and the last check
export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const s = await readPricingStatus();
  return jsonSuccess({ ...s, proxyUrl: maskProxy(s.proxyUrl) });
}

// PUT /api/admin/integrations/odoo-pricing: { enabled, proxyUrl } (a masked proxyUrl keeps the saved one)
export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const body = await request.json().catch(() => null);
  if (!body || typeof body.enabled !== "boolean") return jsonError("Invalid body", 400);

  let proxyUrl = typeof body.proxyUrl === "string" ? body.proxyUrl.trim() : "";
  if (proxyUrl.startsWith("••••")) proxyUrl = (await readPricingStatus()).proxyUrl;
  if (proxyUrl && !isProxyUrl(proxyUrl)) {
    return jsonError("Proxy URL must look like http://user:password@host:port", 400);
  }
  if (body.enabled && !proxyUrl) return jsonError("Add the Egypt proxy URL before enabling", 400);

  await savePricingConfig(body.enabled, proxyUrl);
  return jsonSuccess({ saved: true }, "Saved");
}

// POST /api/admin/integrations/odoo-pricing: fetch Odoo's Egypt price now
export async function POST() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const result = await refreshOdooEgyptPrice(true);
  const s = await readPricingStatus();
  return jsonSuccess({ result, status: { ...s, proxyUrl: maskProxy(s.proxyUrl) } });
}
