/**
 * Default seed values for the singleton documents (settings, content, integrations).
 * Returned in-memory when the app is not yet installed, and used to seed the DB
 * during first-run setup.
 */

import type { SiteContent, SiteSettings, IntegrationSettings } from "@/types/admin";

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    en: {
      title: "Enterprise ERP Power. Half the Price. Built for the Middle East.",
      subtitle: "ZATCA-compliant. Arabic-native. On-premise or Cloud. Go live in 4-8 weeks.",
      cta1Text: "Start Free Trial",
      cta2Text: "Book a Demo",
    },
    ar: {
      title: "قوة أنظمة ERP المؤسسية. بنصف التكلفة. مصمم للشرق الأوسط.",
      subtitle: "متوافق مع هيئة الزكاة والضريبة. عربي بالكامل. محلي أو سحابي.",
      cta1Text: "ابدأ تجربتك المجانية",
      cta2Text: "احجز عرض تجريبي",
    },
  },
  testimonials: [],
  faqs: [],
  stats: [
    { value: 500, suffix: "+", label: { en: "SMEs served", ar: "شركة ومؤسسة" } },
    { value: 5000, suffix: "+", label: { en: "Monthly users", ar: "مستخدم شهري" } },
    { value: 1000000, suffix: "+", label: { en: "Transactions processed", ar: "عملية محاسبية" } },
  ],
};

export const DEFAULT_SETTINGS: SiteSettings = {
  company: {
    name: { en: "Falcon Smart Solutions", ar: "فالكون للحلول الذكية" },
    email: "info@falcon-v.com",
    phone: { ksa: "00966568406006", egypt: "+201000000000" },
    whatsapp: "966568406006",
    address: {
      ksa: { en: "Riyadh, Saudi Arabia", ar: "الرياض، المملكة العربية السعودية" },
      egypt: { en: "Cairo, Egypt", ar: "القاهرة، مصر" },
    },
  },
  notifications: {
    emailOnNewLead: true,
    salesEmail: "info@falcon-v.com",
  },
  social: {
    linkedin: "https://linkedin.com/company/falcon-smart-solutions",
    twitter: "https://twitter.com/falconsmart",
    facebook: "https://facebook.com/falconsmartsolutions",
    instagram: "https://instagram.com/falconsmart",
    youtube: "https://www.youtube.com/@Falcon_Valley",
  },
  regional: {
    gulfOnly: false,
  },
  security: {
    adminUsername: "",
    adminPassword: "",
    adminPasswordHash: "",
    jwtSecret: "",
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 10,
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  },
};

export const DEFAULT_INTEGRATIONS: IntegrationSettings = {
  odoo: {
    enabled: false,
    url: process.env.ODOO_URL || "",
    db: process.env.ODOO_DB || "",
    username: process.env.ODOO_USERNAME || "",
    password: process.env.ODOO_PASSWORD || "",
  },
  calendar: {
    enabled: false,
    resourceId: 1,
    slotDuration: 30,
    availableDays: [0, 1, 2, 3, 4], // Sun-Thu (MENA work week)
    startHour: 9,
    endHour: 17,
    bufferMinutes: 10,
    maxAdvanceDays: 30,
  },
  email: {
    enabled: false,
    provider: "resend",
    apiKey: process.env.RESEND_API_KEY || "",
    fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@falcon-it.sa",
    replyTo: process.env.RESEND_REPLY_TO || "info@falcon-v.com",
  },
  whatsapp: {
    enabled: false,
    apiToken: "",
    phoneId: "",
  },
  helpdesk: {
    enabled: false,
    defaultTeamId: 0,
    allowRating: true,
    allowNewTickets: true,
  },
};
