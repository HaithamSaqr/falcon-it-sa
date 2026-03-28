/**
 * POST /api/leads/calculator
 * TCO Calculator results → captures lead with calculator data.
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

const calculatorSchema = z.object({
  email: z.string().email("Invalid email"),
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  // Calculator inputs
  numberOfUsers: z.number().min(1).max(500),
  industry: z.string().min(1),
  deployment: z.enum(["onpremise", "cloud", "hybrid"]),
  country: z.string().min(1),
  // Calculator outputs
  falconTco: z.number(),
  sapTco: z.number(),
  savings: z.number(),
  monthlyPerUser: z.number(),
});

type CalculatorData = z.infer<typeof calculatorSchema>;

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  const { data: body, error: parseError } = await parseBody<CalculatorData>(request);
  if (parseError || !body) return jsonError(parseError || "Missing body");

  const result = calculatorSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Validation failed";
    return jsonError(firstError, 422);
  }

  const data = result.data;
  const locale = getLocale(request);
  const utm = getUtmParams(request);

  logLeadFallback("TCO Calculator", {
    ...data,
    locale,
    timestamp: new Date().toISOString(),
  });

  try {
    await addLead({
      type: "calculator",
      status: "new",
      data: { ...data, locale, ...utm },
      source: request.headers.get("referer") || "/pricing",
      locale,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    });
  } catch (err) {
    console.error("[API /leads/calculator] Data store error (non-fatal):", err);
  }

  try {
    await createLead({
      name: `TCO Calculator: ${data.company || data.email}`,
      contactName: data.fullName,
      email: data.email,
      phone: data.phone || "",
      companyName: data.company,
      country: data.country,
      industry: data.industry,
      source: "TCO Calculator",
      pageUrl: request.headers.get("referer") || "/pricing",
      language: locale,
      tcoCalculator: true,
      calculatorUsers: data.numberOfUsers,
      calculatorSaving: data.savings,
      message: `TCO Calculator Results:\n- Users: ${data.numberOfUsers}\n- Deployment: ${data.deployment}\n- Falcon TCO: $${data.falconTco}\n- SAP TCO: $${data.sapTco}\n- Savings: $${data.savings}\n- Monthly/user: $${data.monthlyPerUser}`,
      ...utm,
    });
  } catch (err) {
    console.error("[API /leads/calculator] Odoo error (non-fatal):", err);
  }

  return jsonSuccess(
    { leadId: "captured" },
    locale === "ar"
      ? "تم حفظ نتائجك! سنرسل لك تحليلاً مفصلاً."
      : "Results saved! We'll send you a detailed analysis."
  );
}
