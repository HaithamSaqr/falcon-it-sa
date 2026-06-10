/**
 * Resend Email Service
 * Sends transactional emails (demo confirmations, contact acknowledgements, etc.)
 * Falls back to console logging when API key is not configured.
 */

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@falcon-it.sa";
const REPLY_TO = process.env.RESEND_REPLY_TO || "info@falcon-v.com";

export const isEmailConfigured = Boolean(
  RESEND_API_KEY && !RESEND_API_KEY.startsWith("re_xxx")
);

const resend = isEmailConfigured ? new Resend(RESEND_API_KEY) : null;

// ── Generic send ────────────────────────────────────────────────────
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.log("[Email] Not configured — would send:", {
      to: params.to,
      subject: params.subject,
    });
    return { success: true, id: "dev-mode" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Falcon Smart Solutions <${FROM_EMAIL}>`,
      replyTo: REPLY_TO,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error("[Email] Send failed:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Sent successfully:", data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Error:", message);
    return { success: false, error: message };
  }
}

// ── Notify internal sales team ──────────────────────────────────────
async function notifySalesTeam(params: {
  type: string;
  contactName: string;
  email: string;
  phone: string;
  company?: string;
  details?: string;
}): Promise<void> {
  const salesEmail = REPLY_TO; // sales team email
  await sendEmail({
    to: salesEmail,
    subject: `🦅 New ${params.type}: ${params.contactName} from ${params.company || "N/A"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891B2;">New ${params.type} Lead</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${params.contactName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;"><a href="mailto:${params.email}">${params.email}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;"><a href="tel:${params.phone}">${params.phone}</a></td></tr>
          ${params.company ? `<tr><td style="padding: 8px; font-weight: bold;">Company:</td><td style="padding: 8px;">${params.company}</td></tr>` : ""}
          ${params.details ? `<tr><td style="padding: 8px; font-weight: bold;">Details:</td><td style="padding: 8px;">${params.details}</td></tr>` : ""}
        </table>
        <p style="color: #64748B; font-size: 13px; margin-top: 24px;">This lead was captured from the Falcon website.</p>
      </div>
    `,
  });
}

// ── Demo Booking Confirmation ───────────────────────────────────────
export async function sendDemoConfirmation(data: {
  to: string;
  name: string;
  language: "ar" | "en";
}): Promise<void> {
  const isArabic = data.language === "ar";

  await sendEmail({
    to: data.to,
    subject: isArabic
      ? "تأكيد طلب العرض التجريبي — فالكون للحلول الذكية"
      : "Demo Request Confirmed — Falcon Smart Solutions",
    html: isArabic
      ? `
        <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #0891B2; font-size: 28px;">فالكون للحلول الذكية</h1>
          </div>
          <h2 style="color: #0F172A;">مرحباً ${data.name}! 🎉</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.8;">
            شكراً لطلب العرض التجريبي. فريقنا سيتواصل معك خلال <strong>24 ساعة عمل</strong> لتحديد موعد مناسب.
          </p>
          <div style="background: #F0FDFA; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #0E7490; margin-top: 0;">ماذا يتضمن العرض التجريبي:</h3>
            <ul style="color: #334155; line-height: 2;">
              <li>جولة حية في النظام مع سيناريوهات تناسب قطاعك</li>
              <li>تحليل مخصص للعائد على الاستثمار</li>
              <li>خارطة طريق التنفيذ مع الجدول الزمني</li>
              <li>جلسة أسئلة وأجوبة مع خبير ERP</li>
            </ul>
          </div>
          <p style="color: #64748B; font-size: 14px;">
            لأي استفسار عاجل، تواصل معنا عبر الواتساب: <a href="https://wa.me/966568406006" style="color: #10B981;">00966568406006</a>
          </p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #94A3B8; font-size: 12px; text-align: center;">
            فالكون للحلول الذكية | falcon-it.sa
          </p>
        </div>
      `
      : `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #0891B2; font-size: 28px;">Falcon Smart Solutions</h1>
          </div>
          <h2 style="color: #0F172A;">Hi ${data.name}! 🎉</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.8;">
            Thank you for requesting a demo. Our team will reach out within <strong>24 business hours</strong> to schedule a convenient time.
          </p>
          <div style="background: #F0FDFA; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #0E7490; margin-top: 0;">What your demo includes:</h3>
            <ul style="color: #334155; line-height: 2;">
              <li>Live product walkthrough tailored to your industry</li>
              <li>Custom ROI analysis vs. your current system</li>
              <li>Implementation roadmap with timeline</li>
              <li>Q&A session with an ERP specialist</li>
            </ul>
          </div>
          <p style="color: #64748B; font-size: 14px;">
            For urgent inquiries, reach us on WhatsApp: <a href="https://wa.me/966568406006" style="color: #10B981;">00966568406006</a>
          </p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #94A3B8; font-size: 12px; text-align: center;">
            Falcon Smart Solutions | falcon-it.sa
          </p>
        </div>
      `,
  });

  // Also notify the sales team
  await notifySalesTeam({
    type: "Demo Request",
    contactName: data.name,
    email: data.to,
    phone: "",
  });
}

// ── Contact Form Acknowledgement ────────────────────────────────────
export async function sendContactAcknowledgement(data: {
  to: string;
  name: string;
  language: "ar" | "en";
}): Promise<void> {
  const isArabic = data.language === "ar";

  await sendEmail({
    to: data.to,
    subject: isArabic
      ? "تم استلام رسالتك — فالكون للحلول الذكية"
      : "Message Received — Falcon Smart Solutions",
    html: isArabic
      ? `
        <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #0891B2;">فالكون للحلول الذكية</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.8;">
            مرحباً ${data.name}، شكراً لتواصلك معنا. تم استلام رسالتك وسنرد عليك في أقرب وقت ممكن.
          </p>
          <p style="color: #94A3B8; font-size: 12px;">فالكون للحلول الذكية | falcon-it.sa</p>
        </div>
      `
      : `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #0891B2;">Falcon Smart Solutions</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.8;">
            Hi ${data.name}, thanks for reaching out. We've received your message and will get back to you as soon as possible.
          </p>
          <p style="color: #94A3B8; font-size: 12px;">Falcon Smart Solutions | falcon-it.sa</p>
        </div>
      `,
  });
}

// ── Newsletter Welcome ──────────────────────────────────────────────
export async function sendNewsletterWelcome(data: {
  to: string;
  language: "ar" | "en";
}): Promise<void> {
  const isArabic = data.language === "ar";

  await sendEmail({
    to: data.to,
    subject: isArabic
      ? "مرحباً بك في نشرة فالكون البريدية! 🦅"
      : "Welcome to Falcon Newsletter! 🦅",
    html: isArabic
      ? `
        <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #0891B2;">مرحباً بك في نشرة فالكون! 🦅</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.8;">
            شكراً لانضمامك! ستحصل على آخر أخبار أنظمة ERP، وتحديثات ZATCA، ونصائح التحول الرقمي لمنطقة الشرق الأوسط.
          </p>
          <p style="color: #94A3B8; font-size: 12px;">فالكون للحلول الذكية | falcon-it.sa</p>
        </div>
      `
      : `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #0891B2;">Welcome to Falcon Newsletter! 🦅</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.8;">
            Thanks for subscribing! You'll receive the latest ERP insights, ZATCA updates, and digital transformation tips for MENA businesses.
          </p>
          <p style="color: #94A3B8; font-size: 12px;">Falcon Smart Solutions | falcon-it.sa</p>
        </div>
      `,
  });
}

export { sendEmail, notifySalesTeam };
