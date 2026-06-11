/**
 * Default seed values for the singleton documents (settings, content, integrations).
 * Returned in-memory when the app is not yet installed, and used to seed the DB
 * during first-run setup.
 */

import type {
  SiteContent,
  SiteSettings,
  IntegrationSettings,
  SeoSettings,
  FooterLink,
  Sector,
  PricingBase,
} from "@/types/admin";
import arMessages from "../../../messages/ar.json";
import enMessages from "../../../messages/en.json";

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
    branches: [
      {
        id: "ksa",
        name: { en: "Saudi Arabia Office", ar: "مكتب السعودية" },
        address: { en: "Riyadh, Saudi Arabia", ar: "الرياض، المملكة العربية السعودية" },
        phone: "00966568406006",
      },
      {
        id: "egypt",
        name: { en: "Egypt Office", ar: "مكتب مصر" },
        address: { en: "Cairo, Egypt", ar: "القاهرة، مصر" },
        phone: "+201000000000",
      },
    ],
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
    tiktok: "",
  },
  loginUrl: "https://falcon-valley.com",
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

// ── Sectors (seeded from the existing 18 sectors + their translations) ──
const SECTOR_GRADIENTS = [
  "bg-gradient-to-br from-primary-800 to-primary-600",
  "bg-gradient-to-tr from-primary-900 to-primary-700",
  "bg-gradient-to-bl from-primary-700 to-dark-lighter",
  "bg-gradient-to-r from-dark to-primary-800",
  "bg-gradient-to-tl from-primary-600 to-dark",
  "bg-gradient-to-b from-primary-800 to-primary-500/60",
  "bg-gradient-to-t from-dark-lighter to-primary-700",
  "bg-gradient-to-br from-dark to-primary-600",
  "bg-gradient-to-l from-primary-900 to-primary-700",
];

const SECTOR_SEED: { slug: string; icon: string }[] = [
  { slug: "retail", icon: "🛍️" },
  { slug: "manufacturing", icon: "🏭" },
  { slug: "construction", icon: "🏗️" },
  { slug: "real-estate", icon: "🏢" },
  { slug: "hospitality", icon: "🍽️" },
  { slug: "healthcare", icon: "🏥" },
  { slug: "education", icon: "🎓" },
  { slug: "logistics", icon: "🚚" },
  { slug: "trading", icon: "📦" },
  { slug: "automotive", icon: "🚗" },
  { slug: "food-beverage", icon: "🍔" },
  { slug: "pharma", icon: "💊" },
  { slug: "professional-services", icon: "💼" },
  { slug: "agriculture", icon: "🌾" },
  { slug: "energy", icon: "⚡" },
  { slug: "fashion", icon: "👗" },
  { slug: "jewelry", icon: "💎" },
  { slug: "nonprofit", icon: "🤝" },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
const arItems = (arMessages as any).sectors?.items ?? {};
const enItems = (enMessages as any).sectors?.items ?? {};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const DEFAULT_SECTORS: Sector[] = SECTOR_SEED.map((s, i) => {
  const ar = arItems[s.slug] ?? {};
  const en = enItems[s.slug] ?? {};
  const name = { en: en.name ?? s.slug, ar: ar.name ?? s.slug };
  return {
    id: s.slug,
    icon: s.icon,
    gradient: SECTOR_GRADIENTS[i % SECTOR_GRADIENTS.length],
    name,
    title: { ...name },
    description: { en: en.desc ?? "", ar: ar.desc ?? "" },
    systems: ["desktop", "cloud", "odoo"],
    featured: i === 0,
    enabled: true,
    sortOrder: i,
  };
});

export const DEFAULT_PRICING_BASE: PricingBase = {
  pricePerUser: 50,
  hostingPrice: 200,
  operatingCosts: 100,
  trainingCostPerDay: 80,
  trainingDays: 3,
  discountPercent: 10,
  usdToEgp: 50,
};

export const DEFAULT_SEO: SeoSettings = {
  metaTitle: {
    en: "Falcon Smart Solutions | Enterprise ERP for MENA",
    ar: "فالكون للحلول الذكية | نظام ERP للمؤسسات في الشرق الأوسط",
  },
  metaDescription: {
    en: "MENA-native ERP platform with ZATCA compliance, Arabic support, and on-premise data sovereignty. Falcon ERP, Falcon Cloud, and Odoo services.",
    ar: "منصة ERP مصمّمة للشرق الأوسط متوافقة مع هيئة الزكاة والضريبة، بدعم عربي كامل واستضافة محلية أو سحابية. فالكون ERP وفالكون كلاود وخدمات Odoo.",
  },
  metaKeywords: {
    en: "ERP, ERP Saudi Arabia, Odoo, ZATCA e-invoicing, accounting software, cloud ERP, Falcon ERP, MENA ERP, enterprise software",
    ar: "ERP, نظام تخطيط موارد المؤسسات, اودو, الفاتورة الإلكترونية, برنامج محاسبة, نظام سحابي, فالكون, أنظمة المؤسسات, السعودية",
  },
  ogImage: "/images/logos/falcon-logo.png",
};

export const DEFAULT_FOOTER_LINKS: FooterLink[] = [
  { id: "about", section: "about", label: { en: "About Us", ar: "من نحن" }, url: "/about" },
  { id: "blog", section: "about", label: { en: "Blog", ar: "المدونة" }, url: "/blog" },
  { id: "careers", section: "about", label: { en: "Careers", ar: "الوظائف" }, url: "/careers" },
  { id: "faq", section: "support", label: { en: "FAQ", ar: "الأسئلة الشائعة" }, url: "/faq" },
  { id: "help", section: "support", label: { en: "Help Center", ar: "مركز المساعدة" }, url: "/help" },
  { id: "webinars", section: "support", label: { en: "Webinars", ar: "الندوات" }, url: "/webinars" },
  { id: "privacy", section: "legal", label: { en: "Privacy Policy", ar: "سياسة الخصوصية" }, url: "/privacy" },
  { id: "terms", section: "legal", label: { en: "Terms of Service", ar: "الشروط والأحكام" }, url: "/terms" },
];

export const DEFAULT_INTEGRATIONS: IntegrationSettings = {
  odoo: {
    enabled: false,
    url: process.env.ODOO_URL || "",
    db: process.env.ODOO_DB || "",
    username: process.env.ODOO_USERNAME || "",
    apiKey: process.env.ODOO_API_KEY || process.env.ODOO_PASSWORD || "",
  },
  ai: {
    enabled: false,
    serverUrl: process.env.AI_SERVER_URL || "",
    apiKey: process.env.AI_API_KEY || "",
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
