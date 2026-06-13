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
  HomeContent,
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
  testimonials: [
    {
      id: "ts-1", name: "Ahmed Al-Rashid", role: "CFO", company: "Saudi Emar Developments",
      quote: {
        en: "Falcon ERP completely transformed our operations. We migrated from SAP in just 6 weeks and saved 60% on costs. Arabic support and ZATCA compliance were ready from day one.",
        ar: "فالكون ERP حوّل عملياتنا بالكامل. انتقلنا من SAP خلال 6 أسابيع فقط ووفرنا 60% من التكاليف. الدعم العربي والامتثال مع ZATCA كان جاهزًا من اليوم الأول.",
      },
    },
    {
      id: "ts-2", name: "Mohammed Hassan", role: "IT Director", company: "Haddad Group",
      quote: {
        en: "We were using Excel to manage 8 branches. Falcon Cloud unified everything — inventory, accounting, and HR in one system. Stock reconciliation that took 3 days is now instant.",
        ar: "كنا نستخدم Excel لإدارة 8 فروع. فالكون كلاود وحّد كل شيء — المخزون، المحاسبة، والموارد البشرية في نظام واحد. تسوية المخزون التي كانت تستغرق 3 أيام أصبحت فورية.",
      },
    },
    {
      id: "ts-3", name: "Khaled Al-Omari", role: "CEO", company: "Almada Construction",
      quote: {
        en: "We tried two Odoo partners before Falcon. The difference was night and day — they understood Saudi market requirements from the start. Localization is flawless and our data stays on our servers in Riyadh.",
        ar: "جربنا شريكين أودو قبل فالكون. الفرق كان كبير — فهموا متطلبات السوق السعودي من البداية. التعريب ممتاز والبيانات تبقى على خوادمنا في الرياض.",
      },
    },
    {
      id: "ts-4", name: "Sara Al-Mutairi", role: "Operations Manager", company: "Nile Food Industries",
      quote: {
        en: "Falcon's POS system completely changed how we operate. Linking 5 restaurant branches in one system with real-time reports. We reduced waste by 30% in the first 3 months.",
        ar: "نظام نقاط البيع من فالكون غيّر طريقة عملنا تمامًا. ربط 5 فروع مطاعم في نظام واحد مع تقارير لحظية. تقليل الهدر بنسبة 30% خلال أول 3 أشهر.",
      },
    },
    {
      id: "ts-5", name: "Abdulrahman Al-Subaie", role: "General Manager", company: "Delta Pharma Egypt",
      quote: {
        en: "The transition to Falcon was easier than we expected. Support team available 24/7 in Arabic. ZATCA Phase 2 compliance happened automatically — we didn't have to lift a finger.",
        ar: "الانتقال إلى فالكون كان أسهل مما توقعنا. فريق الدعم متاح 24/7 وباللغة العربية. امتثال المرحلة الثانية من ZATCA تم تلقائيًا بدون أي تدخل منا.",
      },
    },
  ],
  faqs: [
    {
      id: "faq-1",
      question: { en: "What's included in the free trial?", ar: "ما المتضمن في التجربة المجانية؟" },
      answer: {
        en: "Full access to all Falcon Cloud ERP modules for 14 days. No credit card required. Your data is preserved when you subscribe.",
        ar: "وصول كامل لجميع وحدات فالكون كلاود ERP لمدة 14 يومًا. لا حاجة لبطاقة ائتمان. يتم حفظ بياناتك عند الاشتراك.",
      },
    },
    {
      id: "faq-2",
      question: { en: "How long does implementation take?", ar: "كم يستغرق التنفيذ؟" },
      answer: {
        en: "Falcon ERP typically goes live in 4–8 weeks, including data migration, training, and customization. Compare that to 6–12 months with SAP or Oracle.",
        ar: "فالكون ERP يبدأ العمل عادة خلال 4-8 أسابيع، بما في ذلك نقل البيانات والتدريب والتخصيص. قارن ذلك بـ 6-12 شهرًا مع SAP أو Oracle.",
      },
    },
    {
      id: "faq-3",
      question: { en: "Is Falcon ZATCA Phase 2 compliant?", ar: "هل فالكون متوافق مع فاتورة المرحلة الثانية؟" },
      answer: {
        en: "Yes. Falcon ERP has native ZATCA Phase 2 e-invoicing built into the core system — not bolted on as an add-on. We're fully certified.",
        ar: "نعم. فالكون ERP يحتوي على فوترة إلكترونية ZATCA المرحلة الثانية مدمجة في النظام الأساسي — وليست إضافة لاحقة. نحن معتمدون بالكامل.",
      },
    },
    {
      id: "faq-4",
      question: { en: "Can I migrate from SAP/Oracle/Odoo?", ar: "هل يمكنني الانتقال من SAP/Oracle/Odoo؟" },
      answer: {
        en: "Absolutely. We have a dedicated migration team that handles data extraction, transformation, and validation. Most migrations complete within 2–4 weeks.",
        ar: "بالتأكيد. لدينا فريق متخصص في نقل البيانات يتولى الاستخراج والتحويل والتحقق. معظم عمليات النقل تكتمل خلال 2-4 أسابيع.",
      },
    },
    {
      id: "faq-5",
      question: { en: "Do you support on-premise deployment?", ar: "هل تدعمون النشر المحلي؟" },
      answer: {
        en: "Yes, on-premise is our default deployment model. Your data stays on your servers, in your country. We also offer cloud and hybrid options.",
        ar: "نعم، النشر المحلي هو نموذج النشر الافتراضي لدينا. بياناتك تبقى على خوادمك، في بلدك. نقدم أيضًا خيارات سحابية وهجينة.",
      },
    },
    {
      id: "faq-6",
      question: { en: "What industries does Falcon serve?", ar: "ما القطاعات التي يخدمها فالكون؟" },
      answer: {
        en: "Falcon has pre-built templates for 9 industries: Retail, Manufacturing, Construction, Real Estate, Hospitality, Healthcare, Education, Logistics, and Trading.",
        ar: "لدى فالكون قوالب جاهزة لـ 9 قطاعات: التجزئة، التصنيع، المقاولات، العقارات، الضيافة، الرعاية الصحية، التعليم، النقل، والتجارة.",
      },
    },
    {
      id: "faq-7",
      question: { en: "What kind of support do you offer?", ar: "ما نوع الدعم الذي تقدمونه؟" },
      answer: {
        en: "We offer 5 SLA tiers from Basic (5 hrs/month, 48hr response) to VIP (unlimited hours, 1hr response). All plans include WhatsApp support.",
        ar: "نقدم 5 مستويات من اتفاقيات مستوى الخدمة من أساسي (5 ساعات/شهر، استجابة 48 ساعة) إلى VIP (ساعات غير محدودة، استجابة ساعة واحدة). جميع الخطط تشمل دعم واتساب.",
      },
    },
  ],
  stats: [
    { value: 500, suffix: "+", label: { en: "SMEs served", ar: "شركة ومؤسسة" } },
    { value: 5000, suffix: "+", label: { en: "Monthly users", ar: "مستخدم شهري" } },
    { value: 1000000, suffix: "+", label: { en: "Transactions processed", ar: "عملية محاسبية" } },
  ],
};

export const DEFAULT_HOME: HomeContent = {
  hero: {
    eyebrow: { en: "Best ERP Solution", ar: "أفضل حل لإدارة الأعمال" },
    title: {
      en: "Enterprise ERP Power. Half the Price. Built for the Middle East.",
      ar: "قوة أنظمة ERP المؤسسية. بنصف التكلفة. مصمم للشرق الأوسط.",
    },
    subtitle: {
      en: "ZATCA-compliant. Arabic-native. On-premise or Cloud. Go live in 4–8 weeks — not 6 months.",
      ar: "متوافق مع هيئة الزكاة والضريبة. عربي بالكامل. محلي أو سحابي. ابدأ العمل خلال 4-8 أسابيع — وليس 6 أشهر.",
    },
    cta1: { label: { en: "Start Free Trial", ar: "ابدأ تجربتك المجانية" }, url: "/contact" },
    cta2: { label: { en: "Book a Demo", ar: "احجز عرض تجريبي" }, url: "/demo" },
    trust1: { en: "No credit card required", ar: "لا حاجة لبطاقة ائتمان" },
    trust2: { en: "Money-back guarantee", ar: "ضمان استرداد الأموال" },
    image: "/images/screens/falcon-desktop-hero.png",
  },
  whyErpFails: {
    label: { en: "The hidden cost", ar: "التكلفة الخفية" },
    heading: {
      en: "You're overpaying for ERP and still not compliant",
      ar: "تدفع أكثر من اللازم مقابل ERP — وبدون امتثال",
    },
    subheading: {
      en: "Three reasons most Saudi businesses are paying for the wrong system.",
      ar: "ثلاثة أسباب تجعل معظم الشركات السعودية تدفع لنظام لا يناسبها.",
    },
    cards: [
      {
        id: "wef-overpay",
        icon: "💸",
        title: { en: "You're overpaying for global ERP", ar: "أنت تدفع أكثر من اللازم لأنظمة ERP العالمية" },
        desc: {
          en: "SAP and Oracle can cost several times more than Odoo for the same core functions, with implementations that stretch 6–12 months before you see value. You're funding their brand, not your business.",
          ar: "قد تكلف SAP وOracle أضعاف ما تكلفه Odoo لنفس الوظائف الأساسية، مع تنفيذ يمتد من 6 إلى 12 شهرًا قبل أن ترى أي قيمة. أنت تموّل علامتهم التجارية، لا أعمالك.",
        },
      },
      {
        id: "wef-zatca",
        icon: "🛡️",
        title: { en: "ZATCA is treated as an add-on", ar: "يُعامل امتثال هيئة الزكاة كإضافة لاحقة" },
        desc: {
          en: "Most ERPs bolt Fatoora e-invoicing on after the fact. With Phase 2 now mandatory for businesses over SAR 375,000 in turnover, a single non-compliant invoice is a penalty, not a software bug you can fix later.",
          ar: "معظم أنظمة ERP تُلحق الفوترة الإلكترونية «فاتورة» بعد التنفيذ. ومع إلزامية المرحلة الثانية للمنشآت التي تتجاوز إيراداتها 375,000 ريال، فإن فاتورة واحدة غير ممتثلة تعني غرامة، لا خللاً برمجياً يمكن إصلاحه لاحقاً.",
        },
      },
      {
        id: "wef-data",
        icon: "🔒",
        title: { en: "Your data leaves the Kingdom", ar: "بياناتك تغادر المملكة" },
        desc: {
          en: "Cloud-only global ERPs store your financial data on servers outside Saudi Arabia. Under PDPL, that's not just a setting, it's a regulatory exposure most businesses don't realize they've accepted.",
          ar: "أنظمة ERP السحابية العالمية تخزّن بياناتك المالية على خوادم خارج المملكة العربية السعودية. وبموجب نظام حماية البيانات الشخصية (PDPL)، هذا ليس مجرد إعداد، بل تعرّض تنظيمي لا تدركه معظم الشركات.",
        },
      },
    ],
  },
  whyChoose: {
    heading: { en: "Why businesses choose Falcon", ar: "لماذا تختار الشركات فالكون" },
    subheading: {
      en: "Enterprise-grade ERP, built for Saudi compliance — without the global price tag.",
      ar: "نظام ERP بمستوى المؤسسات، مبني للامتثال السعودي — دون السعر العالمي.",
    },
    cards: [
      {
        id: "wc-zatca",
        icon: "✅",
        title: { en: "ZATCA Compliance", ar: "امتثال هيئة الزكاة (ZATCA)" },
        desc: {
          en: "Fatoora e-invoicing is part of how we implement Odoo, not bolted on later. You're Phase 2 ready before you go live.",
          ar: "الفوترة الإلكترونية «فاتورة» جزء من طريقة تنفيذنا لـ Odoo، وليست إضافة لاحقة. تكون جاهزاً للمرحلة الثانية قبل الإطلاق.",
        },
      },
      {
        id: "wc-value",
        icon: "💰",
        title: { en: "Lower cost", ar: "تكلفة أقل" },
        desc: {
          en: "Built on Odoo: the modules global ERPs charge a premium for — accounting, inventory, sales, HR — at a fraction of the cost, live in weeks.",
          ar: "مبني على Odoo: الوحدات التي تتقاضى عنها أنظمة ERP العالمية مبالغ كبيرة — المحاسبة والمخزون والمبيعات والموارد البشرية — بجزء بسيط من التكلفة، وتنطلق خلال أسابيع.",
        },
      },
      {
        id: "wc-data",
        icon: "🇸🇦",
        title: { en: "Sovereignty", ar: "السيادة على البيانات" },
        desc: {
          en: "We deploy so your financial data stays inside the Kingdom. PDPL compliance by default, not by accident.",
          ar: "ننفّذ النظام بحيث تبقى بياناتك المالية داخل المملكة. امتثال نظام حماية البيانات (PDPL) افتراضياً، لا بالصدفة.",
        },
      },
      {
        id: "wc-partner",
        icon: "🤝",
        title: { en: "Official Odoo Partner", ar: "شريك Odoo الرسمي" },
        desc: {
          en: "An officially recognized Odoo partner, not a reseller — certified expertise and implementations done to standard.",
          ar: "شريك Odoo معترف به رسمياً، لسنا موزعين — خبرة معتمدة وتنفيذ وفق المعايير.",
        },
      },
    ],
  },
  cta: {
    headline: {
      en: "E-Invoicing built for MENA compliance.",
      ar: "فوترة إلكترونية مصممة للامتثال في الشرق الأوسط.",
    },
    subtitle: {
      en: "Join 500+ businesses already using Falcon ERP.",
      ar: "انضم إلى أكثر من 500 شركة تستخدم فالكون ERP.",
    },
    cta1: { label: { en: "Get a Quote", ar: "اطلب عرض سعر" }, url: "/contact" },
    cta2: { label: { en: "Book a Demo", ar: "احجز عرض تجريبي" }, url: "/demo" },
  },
  stats: {
    heading: { en: "Falcon delivers excellence", ar: "فالكون شريك نجاحك وتميّزك" },
    items: [
      { value: 500, suffix: "+", label: { en: "SMEs served", ar: "شركة ومؤسسة" } },
      { value: 5000, suffix: "+", label: { en: "Monthly users", ar: "مستخدم شهري" } },
      { value: 1000000, suffix: "+", label: { en: "Transactions processed", ar: "عملية محاسبية" } },
    ],
  },
  newsletter: {
    heading: { en: "Subscribe to Our Newsletter", ar: "انضم إلى قائمة فالكون البريدية" },
    subtitle: {
      en: "Get ZATCA updates, ERP insights, and digital transformation news for MENA.",
      ar: "احصل على تحديثات ZATCA ورؤى ERP وأخبار التحول الرقمي في الشرق الأوسط.",
    },
  },
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
  clientsSpeed: 3,
  whatsappRouting: { domains: [], countries: [] },
  landingCta: { mode: "whatsapp", url: "", label: { en: "", ar: "" }, note: { en: "", ar: "" } },
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
    videoDomains: [],
    videoCountries: [],
    ctaDomains: [],
    ctaCountries: [],
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
  i: number,
  cardImage = ""
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
    cardImage,
    cta1: { label: { en: e.heroCtaPrimary ?? "Get Started", ar: a.heroCtaPrimary ?? "ابدأ الآن" }, url: "/contact" },
    cta2: { label: { en: e.heroCtaSecondary ?? "Book a Demo", ar: a.heroCtaSecondary ?? "احجز عرضاً" }, url: "/demo" },
    isCustom: false,
    enabled: true,
    sortOrder: i,
  };
}

export const DEFAULT_PRODUCTS: Product[] = [
  seededProduct("falcon-erp-desktop", "desktopPage", "falconDesktop", 0, "/images/products/falcon-erp-logo.png"),
  seededProduct("falcon-cloud", "cloudPage", "falconCloud", 1, "/images/screens/web-modules-dark.png"),
  seededProduct("odoo-services", "odooPage", "odooServices", 2, "/images/logos/odoo-logo.png"),
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
    cardImage: "",
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
    cardImage: "",
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
    cardImage: "",
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
