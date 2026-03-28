/**
 * POST /api/leads/trial
 * Free trial signup → creates lead in Odoo with trial flag.
 */

import { NextRequest } from "next/server";
import { z } from "zod/v4";
import { createLead } from "@/lib/odoo/client";
import { sendDemoConfirmation } from "@/lib/email/resend";
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

const trialSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z
    .string()
    .email("Invalid email")
    .refine(
      (email) => !/(gmail|yahoo|hotmail|outlook)\./i.test(email),
      "Please use a business email"
    ),
  phone: z.string().min(8, "Phone is required"),
  company: z.string().min(2, "Company is required"),
  country: z.string().min(1, "Country is required"),
  industry: z.string().optional(),
});

type TrialData = z.infer<typeof trialSchema>;

export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  const { data: body, error: parseError } = await parseBody<TrialData>(request);
  if (parseError || !body) return jsonError(parseError || "Missing body");

  const result = trialSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Validation failed";
    return jsonError(firstError, 422);
  }

  const data = result.data;
  const locale = getLocale(request);
  const utm = getUtmParams(request);

  logLeadFallback("Free Trial Signup", {
    ...data,
    locale,
    timestamp: new Date().toISOString(),
  });

  try {
    await addLead({
      type: "trial",
      status: "new",
      data: { ...data, locale, ...utm },
      source: request.headers.get("referer") || "/free-trial",
      locale,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    });
  } catch (err) {
    console.error("[API /leads/trial] Data store error (non-fatal):", err);
  }

  try {
    await createLead({
      name: `Free Trial: ${data.company}`,
      contactName: data.fullName,
      email: data.email,
      phone: data.phone,
      companyName: data.company,
      country: data.country,
      industry: data.industry,
      source: "Free Trial",
      pageUrl: request.headers.get("referer") || "/free-trial",
      language: locale,
      ...utm,
    });
  } catch (err) {
    console.error("[API /leads/trial] Odoo error (non-fatal):", err);
  }

  try {
    await sendDemoConfirmation({
      to: data.email,
      name: data.fullName,
      language: locale,
    });
  } catch (err) {
    console.error("[API /leads/trial] Email error (non-fatal):", err);
  }

  return jsonSuccess(
    { leadId: "captured" },
    locale === "ar"
      ? "تم تسجيل تجربتك المجانية! تحقق من بريدك الإلكتروني."
      : "Free trial registered! Check your email for next steps."
  );
}
