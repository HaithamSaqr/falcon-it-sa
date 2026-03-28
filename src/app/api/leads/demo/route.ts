/**
 * POST /api/leads/demo
 * Primary conversion endpoint — demo booking form.
 * Creates lead in Odoo CRM + sends confirmation email + notifies sales.
 */

import { NextRequest } from "next/server";
import { demoFormSchema } from "@/lib/validations";
import { createLead, createCalendarEvent } from "@/lib/odoo/client";
import { sendDemoConfirmation } from "@/lib/email/resend";
import { addLead, getIntegrations } from "@/lib/data-store";
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
import type { DemoFormData } from "@/lib/validations";

export async function POST(request: NextRequest) {
  // 1. Rate limit
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  // 2. Parse body
  const { data: body, error: parseError } = await parseBody<DemoFormData>(request);
  if (parseError || !body) return jsonError(parseError || "Missing body");

  // 3. Server-side validation
  const result = demoFormSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Validation failed";
    return jsonError(firstError, 422);
  }

  const data = result.data;
  const locale = getLocale(request);
  const utm = getUtmParams(request);

  // 4. Log lead locally (always — as fallback)
  logLeadFallback("Demo Request", {
    ...data,
    locale,
    timestamp: new Date().toISOString(),
  });

  // 5. Persist to local data store
  try {
    await addLead({
      type: "demo",
      status: "new",
      data: { ...data, locale, ...utm },
      source: request.headers.get("referer") || "/demo",
      locale,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    });
  } catch (err) {
    console.error("[API /leads/demo] Data store error (non-fatal):", err);
  }

  // 6. Create lead in Odoo CRM (non-blocking — don't fail if Odoo is down)
  try {
    await createLead({
      name: `Demo Request: ${data.company}`,
      contactName: data.fullName,
      email: data.email,
      phone: data.phone,
      companyName: data.company,
      jobTitle: data.jobTitle,
      country: data.country,
      companySize: data.companySize,
      industry: data.industry,
      currentERP: data.currentERP,
      message: data.message,
      source: "Demo Form",
      pageUrl: request.headers.get("referer") || "/demo",
      language: locale,
      ...utm,
    });
  } catch (err) {
    console.error("[API /leads/demo] Odoo error (non-fatal):", err);
  }

  // 7. Create calendar event if slot was selected
  const preferredDateTime = (body as Record<string, unknown>).preferredDateTime as string | undefined;
  if (preferredDateTime) {
    try {
      const integrations = await getIntegrations();
      if (integrations.calendar.enabled) {
        await createCalendarEvent({
          name: `Demo - ${data.company} (${data.fullName})`,
          startDatetime: preferredDateTime,
          duration: integrations.calendar.slotDuration / 60,
          attendeeEmail: data.email,
          attendeeName: data.fullName,
          description: `Company: ${data.company}\nPhone: ${data.phone}\nIndustry: ${data.industry || "N/A"}\nCurrent ERP: ${data.currentERP || "N/A"}\n\n${data.message || ""}`,
        });
        console.log("[API /leads/demo] Calendar event created for", preferredDateTime);
      }
    } catch (err) {
      console.error("[API /leads/demo] Calendar error (non-fatal):", err);
    }
  }

  // 8. Send confirmation email (non-blocking)
  try {
    await sendDemoConfirmation({
      to: data.email,
      name: data.fullName,
      language: locale,
    });
  } catch (err) {
    console.error("[API /leads/demo] Email error (non-fatal):", err);
  }

  // 9. Success response
  return jsonSuccess(
    { leadId: "captured" },
    locale === "ar"
      ? "تم إرسال طلبك بنجاح! سنتواصل معك قريباً."
      : "Your demo request has been submitted! We'll be in touch shortly."
  );
}
