/**
 * POST /api/leads/contact
 * General contact form → creates Odoo lead + sends acknowledgement.
 */

import { NextRequest } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { createLead } from "@/lib/odoo/client";
import { sendContactAcknowledgement } from "@/lib/email/resend";
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
import type { ContactFormData } from "@/lib/validations";

export async function POST(request: NextRequest) {
  // 1. Rate limit
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  // 2. Parse body
  const { data: body, error: parseError } = await parseBody<ContactFormData>(request);
  if (parseError || !body) return jsonError(parseError || "Missing body");

  // 3. Server-side validation
  const result = contactFormSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Validation failed";
    return jsonError(firstError, 422);
  }

  const data = result.data;
  const locale = getLocale(request);
  const utm = getUtmParams(request);

  // 4. Log lead locally
  logLeadFallback("Contact Form", {
    ...data,
    locale,
    timestamp: new Date().toISOString(),
  });

  // 5. Persist to local data store
  try {
    await addLead({
      type: "contact",
      status: "new",
      data: { ...data, locale, ...utm },
      source: request.headers.get("referer") || "/contact",
      locale,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    });
  } catch (err) {
    console.error("[API /leads/contact] Data store error (non-fatal):", err);
  }

  // 6. Create lead in Odoo CRM
  try {
    await createLead({
      name: `Contact: ${data.subject}`,
      contactName: data.name,
      email: data.email,
      phone: data.phone || "",
      message: data.message,
      source: "Contact Form",
      pageUrl: request.headers.get("referer") || "/contact",
      language: locale,
      ...utm,
    });
  } catch (err) {
    console.error("[API /leads/contact] Odoo error (non-fatal):", err);
  }

  // 6. Send acknowledgement email
  try {
    await sendContactAcknowledgement({
      to: data.email,
      name: data.name,
      language: locale,
    });
  } catch (err) {
    console.error("[API /leads/contact] Email error (non-fatal):", err);
  }

  // 7. Success response
  return jsonSuccess(
    { leadId: "captured" },
    locale === "ar"
      ? "تم إرسال رسالتك بنجاح! سنرد عليك قريباً."
      : "Your message has been sent! We'll get back to you soon."
  );
}
