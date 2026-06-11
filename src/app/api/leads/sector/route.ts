/**
 * POST /api/leads/sector
 * Sector landing form → captures lead, creates an Odoo opportunity, and (if
 * configured) forwards the lead to the AI assistant server.
 */

import { NextRequest } from "next/server";
import { z } from "zod/v4";
import { createLead } from "@/lib/odoo/client";
import { addLead, getIntegrations } from "@/lib/data-store";
import {
  checkRateLimit,
  jsonSuccess,
  jsonError,
  jsonRateLimited,
  parseBody,
  getLocale,
} from "@/lib/api-helpers";

const schema = z.object({
  sectorId: z.string().min(1),
  sectorName: z.string().min(1),
  system: z.string().min(1),
  name: z.string().min(2).optional(),
  company: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  users: z.number().min(1).max(100000),
  currency: z.string().optional(),
  priceRegular: z.number().optional(),
  priceTotal: z.number().optional(),
  trainingDays: z.number().optional(),
});

type Data = z.infer<typeof schema>;

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  const { data: body, error } = await parseBody<Data>(request);
  if (error || !body) return jsonError(error || "Missing body");

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Validation failed", 422);
  }
  const data = parsed.data;
  const locale = getLocale(request);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // 1) Local lead record
  try {
    await addLead({
      type: "calculator",
      status: "new",
      data: { ...data, kind: "sector", locale },
      source: `/sectors/${data.sectorId}`,
      locale,
      ip,
    });
  } catch (err) {
    console.error("[API /leads/sector] data store error (non-fatal):", err);
  }

  // 2) Odoo opportunity
  try {
    await createLead({
      name: `Sector: ${data.sectorName} — ${data.name || data.company}`,
      contactName: data.name || data.company,
      email: data.email,
      phone: data.phone,
      companyName: data.company,
      industry: data.sectorName,
      source: "Sector Landing Page",
      pageUrl: `/sectors/${data.sectorId}`,
      language: locale,
      message:
        `Sector: ${data.sectorName}\nSystem: ${data.system}\nName: ${data.name || "-"}\nUsers: ${data.users}\n` +
        `Training days: ${data.trainingDays ?? "-"}\n` +
        `Estimated: ${data.priceTotal ?? "-"} ${data.currency ?? "USD"} (incl. cloud hosting)`,
    });
  } catch (err) {
    console.error("[API /leads/sector] Odoo error (non-fatal):", err);
  }

  // 3) Forward to AI assistant server (best-effort)
  try {
    const integrations = await getIntegrations();
    if (integrations.ai.enabled && integrations.ai.serverUrl) {
      await fetch(integrations.ai.serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(integrations.ai.apiKey ? { Authorization: `Bearer ${integrations.ai.apiKey}` } : {}),
        },
        body: JSON.stringify({ event: "sector_lead", ...data, locale }),
      }).catch(() => {});
    }
  } catch {
    // ignore
  }

  return jsonSuccess({ leadId: "captured" }, "Request received");
}
