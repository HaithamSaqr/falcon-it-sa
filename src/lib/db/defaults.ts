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
  Product,
  ProductBrochure,
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
    videoUrl: "",
    featured: i === 0,
    enabled: true,
    sortOrder: i,
  };
});

// ── Products ────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
const arM = arMessages as any;
const enM = enMessages as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

function seededProduct(
  slug: string,
  ns: string,
  navKey: string,
  i: number
): Product {
  const a = arM[ns] ?? {};
  const e = enM[ns] ?? {};
  return {
    slug,
    name: { en: enM.nav?.[navKey] ?? slug, ar: arM.nav?.[navKey] ?? slug },
    eyebrow: { en: e.badge ?? "", ar: a.badge ?? "" },
    title: { en: e.heroTitle ?? "", ar: a.heroTitle ?? "" },
    description: { en: e.heroSubtitle ?? "", ar: a.heroSubtitle ?? "" },
    heroImage: "",
    cta1: { label: { en: e.heroCtaPrimary ?? "Get Started", ar: a.heroCtaPrimary ?? "ابدأ الآن" }, url: "/contact" },
    cta2: { label: { en: e.heroCtaSecondary ?? "Book a Demo", ar: a.heroCtaSecondary ?? "احجز عرضاً" }, url: "/demo" },
    isCustom: false,
    enabled: true,
    sortOrder: i,
  };
}

export const DEFAULT_PRODUCTS: Product[] = [
  seededProduct("falcon-erp-desktop", "desktopPage", "falconDesktop", 0),
  seededProduct("falcon-cloud", "cloudPage", "falconCloud", 1),
  seededProduct("odoo-services", "odooPage", "odooServices", 2),
  {
    slug: "server-management",
    name: { en: "Server Management", ar: "إدارة السيرفرات" },
    eyebrow: { en: "Infrastructure", ar: "البنية التحتية" },
    title: { en: "Servers that never sleep.", ar: "خوادم لا تتوقف أبداً." },
    description: {
      en: "End-to-end management of your servers — provisioning, monitoring, security hardening, backups and 24/7 support. Keep your infrastructure fast, secure and always online.",
      ar: "إدارة متكاملة لخوادمك — التجهيز والمراقبة وتعزيز الأمان والنسخ الاحتياطي والدعم على مدار الساعة. أبقِ بنيتك التحتية سريعة وآمنة ومتاحة دائماً.",
    },
    heroImage: "",
    cta1: { label: { en: "Request a Quote", ar: "اطلب عرض سعر" }, url: "/contact" },
    cta2: { label: { en: "Book a Demo", ar: "احجز عرضاً" }, url: "/demo" },
    isCustom: true,
    enabled: true,
    sortOrder: 3,
  },
  {
    slug: "data-management",
    name: { en: "Data Management", ar: "إدارة البيانات" },
    eyebrow: { en: "Data & Analytics", ar: "البيانات والتحليلات" },
    title: { en: "Your data, organized and protected.", ar: "بياناتك، منظّمة ومحمية." },
    description: {
      en: "Centralize, secure and analyze your business data. Reliable backups, migrations, integrations and dashboards that turn raw data into decisions.",
      ar: "وحّد بياناتك وأمّنها وحلّلها. نسخ احتياطي موثوق وعمليات ترحيل وتكاملات ولوحات تحليلية تحوّل البيانات الخام إلى قرارات.",
    },
    heroImage: "",
    cta1: { label: { en: "Request a Quote", ar: "اطلب عرض سعر" }, url: "/contact" },
    cta2: { label: { en: "Book a Demo", ar: "احجز عرضاً" }, url: "/demo" },
    isCustom: true,
    enabled: true,
    sortOrder: 4,
  },
  {
    slug: "applications",
    name: { en: "Applications", ar: "تطبيقات" },
    eyebrow: { en: "Custom Software", ar: "برمجيات مخصصة" },
    title: { en: "Apps built around your business.", ar: "تطبيقات مصمّمة حول أعمالك." },
    description: {
      en: "Custom web and mobile applications tailored to your workflows — from internal tools to customer-facing products, designed, built and maintained by our team.",
      ar: "تطبيقات ويب وجوال مخصصة مصمّمة لسير عملك — من الأدوات الداخلية إلى المنتجات الموجهة للعملاء، نصمّمها ونبنيها وندعمها بفريقنا.",
    },
    heroImage: "",
    cta1: { label: { en: "Request a Quote", ar: "اطلب عرض سعر" }, url: "/contact" },
    cta2: { label: { en: "Book a Demo", ar: "احجز عرضاً" }, url: "/demo" },
    isCustom: true,
    enabled: true,
    sortOrder: 5,
  },
];

// ── Default brochures for the new products (professional content) ──
export const DEFAULT_BROCHURES: ProductBrochure[] = [
  {
    slug: "server-management",
    title: { en: "Server Setup, Docker & Containers", ar: "إعداد السيرفرات والدوكر والكونتينرز" },
    enabled: true,
    content: {
      en: `<h2>Server setup, Docker &amp; containers</h2><p>We design, provision and harden the infrastructure your business runs on — from a single server to a full containerized platform — so your systems stay fast, secure and always online.</p><h3>Server provisioning &amp; preparation</h3><p>Operating-system setup, networking, firewalls, SSL certificates and security hardening. We prepare your servers for production workloads with best-practice configuration.</p><h3>Docker &amp; containers</h3><p>We containerize your applications with Docker for portability, isolation and effortless scaling, and orchestrate them with Docker Compose so every environment behaves identically.</p><h3>Getting servers production-ready</h3><ul><li>Databases, reverse proxies (Nginx) and load balancing</li><li>Automated backups and disaster recovery</li><li>Monitoring, logging and alerting</li><li>Zero-downtime deployments and updates</li></ul>`,
      ar: `<h2>إعداد السيرفرات والدوكر والكونتينرز</h2><p>نُصمّم ونُجهّز ونُؤمّن البنية التحتية التي تعمل عليها أعمالك — من خادم واحد إلى منصة حاويات متكاملة — لتبقى أنظمتك سريعة وآمنة ومتاحة دائماً.</p><h3>تجهيز وإعداد الخوادم</h3><p>إعداد نظام التشغيل والشبكات والجدران النارية وشهادات SSL وتعزيز الأمان. نُجهّز خوادمك للعمل الإنتاجي وفق أفضل الممارسات.</p><h3>الدوكر والحاويات (Docker &amp; Containers)</h3><p>نحوّل تطبيقاتك إلى حاويات Docker لسهولة النقل والعزل والتوسّع، وننظّمها عبر Docker Compose لتتطابق كل البيئات تماماً.</p><h3>تجهيز الخوادم للعمل</h3><ul><li>قواعد البيانات والـ Reverse Proxy (Nginx) وموازنة الأحمال</li><li>نسخ احتياطي تلقائي وخطط تعافٍ من الكوارث</li><li>المراقبة والسجلّات والتنبيهات</li><li>نشر وتحديثات بدون توقف</li></ul>`,
    },
  },
  {
    slug: "data-management",
    title: { en: "Data Analysis & Migration", ar: "تحليل البيانات ونقلها" },
    enabled: true,
    content: {
      en: `<h2>Data analysis &amp; migration</h2><p>Centralize, analyze and move your business data with confidence — from messy legacy systems to clean, modern, world-class software.</p><h3>Data analysis</h3><p>We turn raw data into clear dashboards and actionable insights, so you can make decisions based on facts, not guesswork.</p><h3>Data migration</h3><p>We migrate your data from any old or legacy program to modern, globally trusted software (such as Odoo, SAP and others) — accurately mapped, cleaned, validated and transferred with zero data loss.</p><ul><li>Migration from any legacy system to modern platforms</li><li>Data cleansing, deduplication and validation</li><li>ETL pipelines and integrations</li><li>Dashboards and business intelligence</li></ul>`,
      ar: `<h2>تحليل البيانات ونقلها (Data Migration)</h2><p>وحّد بياناتك وحلّلها وانقلها بثقة — من الأنظمة القديمة المبعثرة إلى برمجيات حديثة عالمية المستوى.</p><h3>تحليل البيانات</h3><p>نحوّل بياناتك الخام إلى لوحات واضحة ورؤى قابلة للتنفيذ، لتتّخذ قراراتك بناءً على حقائق لا تخمين.</p><h3>ترحيل ونقل البيانات</h3><p>ننقل بيانات عميلك من أي برنامج قديم إلى البرامج الحديثة والمشهورة عالمياً (مثل Odoo وSAP وغيرها) — مع مطابقة دقيقة وتنظيف وتحقّق ونقل بدون فقدان أي بيانات.</p><ul><li>الترحيل من أي نظام قديم إلى المنصات الحديثة</li><li>تنظيف البيانات وإزالة التكرار والتحقّق منها</li><li>مسارات ETL والتكاملات</li><li>لوحات التحليل وذكاء الأعمال</li></ul>`,
    },
  },
  {
    slug: "applications",
    title: { en: "Custom Applications", ar: "صناعة التطبيقات" },
    enabled: true,
    content: {
      en: `<h2>Custom applications</h2><p>From idea to launch, we design and build the apps your business needs — mobile, web and Odoo.</p><h3>Mobile apps — Android &amp; iOS</h3><p>Native and cross-platform mobile applications for Android and iPhone, with great UX, performance and store publishing.</p><h3>Custom &amp; bespoke applications</h3><p>Tailor-made software built around your exact processes — internal tools, portals and customer-facing products.</p><h3>Odoo apps &amp; modules</h3><p>Custom Odoo modules and apps that extend your ERP with the exact features your business needs.</p><ul><li>Android &amp; iOS mobile apps</li><li>Custom web applications</li><li>Custom Odoo modules &amp; integrations</li><li>UI/UX design, development &amp; maintenance</li></ul>`,
      ar: `<h2>صناعة التطبيقات</h2><p>من الفكرة إلى الإطلاق، نُصمّم ونبني التطبيقات التي تحتاجها أعمالك — جوال وويب وأودو.</p><h3>تطبيقات الجوال — أندرويد وآيفون</h3><p>تطبيقات جوال أصلية ومتعددة المنصات لأندرويد وآيفون، بتجربة استخدام ممتازة وأداء عالٍ ونشر على المتاجر.</p><h3>تطبيقات مخصّصة</h3><p>برمجيات مصمّمة حول عملياتك بالضبط — أدوات داخلية وبوابات ومنتجات موجّهة للعملاء.</p><h3>تطبيقات وموديولات أودو</h3><p>موديولات وتطبيقات أودو مخصّصة تُوسّع نظامك بالمزايا التي تحتاجها أعمالك تماماً.</p><ul><li>تطبيقات جوال أندرويد وآيفون</li><li>تطبيقات ويب مخصّصة</li><li>موديولات وتكاملات أودو مخصّصة</li><li>تصميم واجهات وتطوير وصيانة</li></ul>`,
    },
  },
];

export const DEFAULT_PRICING_BASE: PricingBase = {
  pricePerUser: 50,
  hostingPrice: 200,
  operatingCosts: 100,
  trainingCostPerDay: 80,
  trainingDays: 3,
  discountPercent: 10,
  usdToEgp: 50,
  usdToSar: 3.75,
  systemTrainingDays: { desktop: 5, cloud: 3, odoo: 7 },
  volumeDiscounts: [
    { minUsers: 10, discountPercent: 5 },
    { minUsers: 25, discountPercent: 10 },
    { minUsers: 50, discountPercent: 15 },
  ],
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
