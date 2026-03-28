/**
 * POST /api/leads/newsletter
 * Newsletter subscription → adds to Odoo mailing list + sends welcome email.
 */

import { NextRequest } from "next/server";
import { newsletterSchema } from "@/lib/validations";
import { addToMailingList } from "@/lib/odoo/client";
import { sendNewsletterWelcome } from "@/lib/email/resend";
import { addLead } from "@/lib/data-store";
import {
  checkRateLimit,
  jsonSuccess,
  jsonError,
  jsonRateLimited,
  parseBody,
  getLocale,
  logLeadFallback,
} from "@/lib/api-helpers";
import type { NewsletterData } from "@/lib/validations";

export async function POST(request: NextRequest) {
  // 1. Rate limit
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  // 2. Parse body
  const { data: body, error: parseError } = await parseBody<NewsletterData>(request);
  if (parseError || !body) return jsonError(parseError || "Missing body");

  // 3. Server-side validation
  const result = newsletterSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Validation failed";
    return jsonError(firstError, 422);
  }

  const data = result.data;
  const locale = getLocale(request);

  // 4. Log locally
  logLeadFallback("Newsletter", {
    email: data.email,
    locale,
    timestamp: new Date().toISOString(),
  });

  // 5. Persist to local data store
  try {
    await addLead({
      type: "newsletter",
      status: "new",
      data: { email: data.email, locale },
      source: request.headers.get("referer") || "/",
      locale,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    });
  } catch (err) {
    console.error("[API /leads/newsletter] Data store error (non-fatal):", err);
  }

  // 6. Add to Odoo mailing list
  try {
    await addToMailingList(data.email);
  } catch (err) {
    console.error("[API /leads/newsletter] Odoo error (non-fatal):", err);
  }

  // 6. Send welcome email
  try {
    await sendNewsletterWelcome({
      to: data.email,
      language: locale,
    });
  } catch (err) {
    console.error("[API /leads/newsletter] Email error (non-fatal):", err);
  }

  // 7. Success response
  return jsonSuccess(
    { subscribed: true },
    locale === "ar"
      ? "تم الاشتراك بنجاح! شكراً لانضمامك."
      : "Successfully subscribed! Thanks for joining."
  );
}
