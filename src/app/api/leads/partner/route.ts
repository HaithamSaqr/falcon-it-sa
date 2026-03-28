/**
 * POST /api/leads/partner
 * Partner program interest → creates lead in Odoo with partner source.
 */

import { NextRequest } from "next/server";
import { z } from "zod/v4";
import { createLead } from "@/lib/odoo/client";
import { addLead } from "@/lib/data-store";
import {
  checkRateLimit,
  jsonSuccess,
  jsonError,
  jsonRateLimited,
  parseBody,
  getLocale,
  getUtmParams,
  logLeadFallback,
} from "@/lib/api-helpers";

const partnerSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(8, "Phone is required"),
  company: z.string().min(2, "Company is required"),
  country: z.string().min(1, "Country is required"),
  partnerType: z.enum(["reseller", "implementer", "referral", "accountant"]).optional(),
  experience: z.string().optional(),
  message: z.string().optional(),
});

type PartnerData = z.infer<typeof partnerSchema>;

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  const { data: body, error: parseError } = await parseBody<PartnerData>(request);
  if (parseError || !body) return jsonError(parseError || "Missing body");

  const result = partnerSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Validation failed";
    return jsonError(firstError, 422);
  }

  const data = result.data;
  const locale = getLocale(request);
  const utm = getUtmParams(request);

  logLeadFallback("Partner Interest", {
    ...data,
    locale,
    timestamp: new Date().toISOString(),
  });

  try {
    await addLead({
      type: "partner",
      status: "new",
      data: { ...data, locale, ...utm },
      source: request.headers.get("referer") || "/partners",
      locale,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    });
  } catch (err) {
    console.error("[API /leads/partner] Data store error (non-fatal):", err);
  }

  try {
    await createLead({
      name: `Partner Interest: ${data.company}`,
      contactName: data.fullName,
      email: data.email,
      phone: data.phone,
      companyName: data.company,
      country: data.country,
      source: "Partner Program",
      pageUrl: request.headers.get("referer") || "/partners",
      language: locale,
      message: [
        data.partnerType ? `Partner Type: ${data.partnerType}` : "",
        data.experience ? `Experience: ${data.experience}` : "",
        data.message || "",
      ]
        .filter(Boolean)
        .join("\n"),
      ...utm,
    });
  } catch (err) {
    console.error("[API /leads/partner] Odoo error (non-fatal):", err);
  }

  return jsonSuccess(
    { leadId: "captured" },
    locale === "ar"
      ? "تم استلام طلبك! سنتواصل معك قريباً بخصوص برنامج الشراكة."
      : "Application received! We'll contact you about the partner program shortly."
  );
}
