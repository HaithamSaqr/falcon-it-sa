/**
 * Shared seed pieces so every page reuses the same block shapes and wording
 * (plan durations, quote placeholder, client logos, booking note).
 */
import type { Bi } from "../bi";
import type { BlockContentMap } from "../types";
import { b, demoCta, noCta } from "../fields";
import type { SeedInput } from "./helpers";
import { V2_SECTORS } from "./sectors";

type Role = { id: string; label: Bi };

/** Typical phase durations, seeded for team confirmation (admin-editable). */
export const DURATION = {
  assess: b("1 day", "يوم واحد"),
  blueprint: b("1 to 2 weeks", "من أسبوع إلى أسبوعين"),
  build: b("4 to 8 weeks", "من 4 إلى 8 أسابيع"),
  train: b("1 to 2 weeks", "من أسبوع إلى أسبوعين"),
  support: b("Ongoing", "مستمر"),
};

/** The four-step plan used on sector pages; only the first, third and fourth descriptions change. */
export function planBlock(assess: Bi, setup: Bi, train: Bi): SeedInput {
  return {
    type: "plan",
    content: {
      heading: b("Four steps, no surprises.", "أربع خطوات، ولا مفاجآت."),
      intro: b(""),
      steps: [
        { title: b("Assess", "التقييم"), description: assess, duration: DURATION.assess },
        {
          title: b("Blueprint", "المخطط"),
          description: b(
            "A written scope and timeline you sign before we start.",
            "نطاق مكتوب وجدول زمني توقّع عليه قبل أن نبدأ.",
          ),
          duration: DURATION.blueprint,
        },
        { title: b("Setup and migration", "الإعداد والترحيل"), description: setup, duration: DURATION.build },
        { title: b("Training and go-live", "التدريب والتشغيل"), description: train, duration: DURATION.train },
      ],
    },
  };
}

/** The five-step implementation process used on home and the ERP pages. */
export function processBlock(heading: Bi = b("From first call to a live ERP, one team.", "من أول اتصال إلى نظام يعمل، فريق واحد.")): SeedInput {
  return {
    type: "process",
    content: {
      heading,
      intro: b(""),
      steps: [
        {
          title: b("Assess", "التقييم"),
          description: b(
            "A demo on your own workflow, and where it leaks today.",
            "عرض على دورة عملك أنت، وأين تتسرّب الأرقام اليوم.",
          ),
          duration: DURATION.assess,
        },
        {
          title: b("Blueprint", "المخطط"),
          description: b(
            "A written scope and timeline, agreed before we build.",
            "نطاق مكتوب وجدول زمني، نتفق عليهما قبل أن نبدأ البناء.",
          ),
          duration: DURATION.blueprint,
        },
        {
          title: b("Build", "البناء"),
          description: b(
            "Configure, develop what's missing, migrate your data.",
            "نضبط النظام، ونطوّر ما ينقصه، وننقل بياناتك.",
          ),
          duration: DURATION.build,
        },
        {
          title: b("Train", "التدريب"),
          description: b(
            "Your team practises on its own data before switching.",
            "فريقك يتدرّب على بياناته قبل الانتقال.",
          ),
          duration: DURATION.train,
        },
        {
          title: b("Support", "الدعم"),
          description: b(
            "We stay after go-live for fixes, modules and branches.",
            "نبقى معك بعد التشغيل للإصلاحات والوحدات الجديدة والفروع.",
          ),
          duration: DURATION.support,
        },
      ],
    },
  };
}

/** Disabled until a real, approved client quote is entered in admin. */
export function quotePlaceholder(who: Bi = b("a client", "عميل")): SeedInput {
  return {
    type: "quote",
    enabled: false,
    content: {
      text: b(
        `[One real sentence from ${who.en} about a specific result, approved by them.]`,
        `[جملة واحدة حقيقية من ${who.ar} عن نتيجة محددة، بعد موافقته.]`,
      ),
      name: b("[Name]", "[الاسم]"),
      role: b("[Role]", "[المنصب]"),
      company: b("[Company]", "[الشركة]"),
      logo: "",
      logoAlt: b(""),
    },
  };
}

/** Client logos (from the clients table) with the general, sector-neutral line. */
export function clientsWall(limit = 8): SeedInput {
  return {
    type: "logo_wall",
    content: {
      heading: b(
        "Companies across Saudi Arabia run on ERPs our team implemented",
        "شركات في السعودية تعمل على أنظمة ERP طبّقها فريقنا",
      ),
      intro: b(""),
      limit,
      link: noCta(),
    },
  };
}

export function bookingBlock(heading: Bi, body: Bi): SeedInput {
  return {
    type: "booking",
    content: {
      heading,
      body,
      cta: demoCta(),
      noteTitle: b("Free, no commitment.", "مجانية وبلا التزام."),
      note: b(
        "No prices online because every business runs differently; your proposal comes in writing after the session.",
        "لا أسعار على الموقع لأن لكل نشاط طريقته؛ وعرضك يصلك مكتوبًا بعد الجلسة.",
      ),
    },
  };
}

/** Same answer on every page: both systems issue Fatoora e-invoices (owner confirmed). */
export const FATOORA_FAQ = {
  question: b("Does it issue Fatoora e-invoices?", "هل يصدر فواتير إلكترونية متوافقة مع منصة فاتورة؟"),
  answer: b(
    "Yes. Both Odoo and Falcon ERP issue ZATCA Fatoora e-invoices, and we set it up as part of the implementation.",
    "نعم. أودو وفالكون ERP كلاهما يصدر الفواتير الإلكترونية عبر منصة فاتورة من هيئة الزكاة والضريبة والجمارك، ونجهّز الربط ضمن التطبيق.",
  ),
};

type Stage = { title: Bi; description: Bi; modules: Bi; roles: string[] };
type Summary = { headline: Bi; points: Bi[] };
type Pains = { headline: Bi; items: { pain: Bi; fix: Bi }[] };
type FitOption = { when: Bi; points: Bi[] };

export interface SectorSpec {
  slug: string;
  roles: Role[];
  promise: Record<string, { title: Bi; subtitle: Bi }>;
  lifecycleHeading: Bi;
  stages: Stage[];
  summary: Record<string, Summary>;
  pains: Record<string, Pains>;
  fit: { odoo: FitOption; falcon: FitOption };
  plan: { assess: Bi; setup: Bi; train: Bi };
  quoteWho: Bi;
  faqHeading: Bi;
  faqs: { question: Bi; answer: Bi }[];
  booking: { heading: Bi; body: Bi };
}

/** A sector landing page in the same block order as sector:real-estate. */
export function sectorBlocks(spec: SectorSpec): SeedInput[] {
  const sector = V2_SECTORS.find((s) => s.slug === spec.slug);
  if (!sector) throw new Error(`Unknown v2 sector ${spec.slug}`);
  const hero: BlockContentMap["sector_hero"] = {
    roles: spec.roles,
    rolePrompt: b("Your role", "دورك"),
    promise: spec.promise,
    photo: sector.photo,
    photoAlt: sector.photoAlt,
    trustLine: b(""),
    primaryCta: demoCta(),
    secondaryCta: {
      label: b("See your stages in the cycle", "شاهد مراحلك في الدورة"),
      href: `/sectors/${spec.slug}#cycle`,
    },
  };
  return [
    { type: "sector_hero", content: hero },
    clientsWall(),
    {
      type: "lifecycle",
      content: {
        heading: spec.lifecycleHeading,
        intro: b(
          "No spreadsheets in between. Switch your role above to light up the stages you work in every day.",
          "لا جداول بين مرحلة وأخرى. غيّر دورك في الأعلى، وستضيء المراحل التي تعيشها كل يوم.",
        ),
        yourRoleLabel: b("Your role", "دورك هنا"),
        roles: spec.roles,
        stages: spec.stages,
        summary: spec.summary,
      },
    },
    {
      type: "role_pains",
      content: {
        heading: b("Sound familiar?", "هل يبدو هذا مألوفًا؟"),
        intro: b(""),
        roles: spec.roles,
        pains: spec.pains,
      },
    },
    {
      type: "fit",
      content: {
        heading: b("Odoo or Falcon? We will tell you plainly.", "أودو أم فالكون؟ سنقولها لك بصراحة."),
        intro: b(
          "We implement both, so we gain nothing by pushing either one. The recommendation comes from your own cycle.",
          "نطبّق النظامين، فلا مصلحة لنا في ترشيح أحدهما. التوصية تأتي من دورتك أنت.",
        ),
        odoo: { name: b("Odoo", "أودو"), ...spec.fit.odoo },
        falcon: { name: b("Falcon ERP", "فالكون ERP"), ...spec.fit.falcon },
        closing: b(""),
      },
    },
    planBlock(spec.plan.assess, spec.plan.setup, spec.plan.train),
    quotePlaceholder(spec.quoteWho),
    { type: "faq_ref", content: { heading: spec.faqHeading, items: spec.faqs } },
    bookingBlock(spec.booking.heading, spec.booking.body),
  ];
}

/** Odoo or Falcon, without a sector: used on the ERP pages. */
export function erpFitBlock(): SeedInput {
  return {
    type: "fit",
    content: {
      heading: b("Odoo or Falcon? We will tell you plainly.", "أودو أم فالكون؟ سنقولها لك بصراحة."),
      intro: b(
        "We implement both, so we gain nothing by pushing either one. The recommendation comes from your own cycle.",
        "نطبّق النظامين، فلا مصلحة لنا في ترشيح أحدهما. التوصية تأتي من دورتك أنت.",
      ),
      odoo: {
        name: b("Odoo", "أودو"),
        when: b(
          "If you want many connected apps and plan to add more as you grow",
          "إذا أردت تطبيقات كثيرة مترابطة وتنوي إضافة المزيد مع نموك",
        ),
        points: [
          b("Many connected apps in one system", "تطبيقات كثيرة مترابطة في نظام واحد"),
          b("eCommerce, CRM and a customer portal on the same data", "المتجر الإلكتروني وCRM وبوابة العملاء على البيانات نفسها"),
          b("Custom features our developers build", "مزايا خاصة يبنيها مطوّرونا"),
        ],
      },
      falcon: {
        name: b("Falcon ERP", "فالكون ERP"),
        when: b(
          "If you want your ERP on your own servers, in Arabic",
          "إذا أردت نظامك على سيرفراتك، وبالعربية",
        ),
        points: [
          b("On your own servers, inside your network", "على سيرفراتك، داخل شبكتك"),
          b("Arabic-first, quick for accountants to learn", "عربي أولًا، ويتعلّمه المحاسبون بسرعة"),
          b("Desktop, Cloud in the browser, or hybrid", "سطح المكتب، أو كلاود من المتصفح، أو الاثنان معًا"),
        ],
      },
      closing: b("Not sure yet? That is what the demo session is for.", "لست متأكدًا بعد؟ لهذا وُجدت جلسة العرض."),
    },
  };
}

/** The home booking block wording, reused on general pages. */
export function generalBookingBlock(): SeedInput {
  return {
    type: "booking",
    content: {
      heading: b("See your own workflow running in the ERP.", "شاهد دورتك تعمل داخل النظام."),
      body: b(
        "In one session, a senior implementer shows you the ERP on your processes, then sends a written recommendation: which system, what scope, how long.",
        "في جلسة واحدة، يعرض لك مستشار تطبيق خبير النظام على إجراءاتك، ثم يرسل لك توصية مكتوبة: أي نظام، أي نطاق، وكم من الوقت.",
      ),
      cta: demoCta(),
      noteTitle: b("Free, no commitment.", "مجانية وبلا التزام."),
      note: b(
        "No prices online because every business runs differently; your proposal comes in writing after the session.",
        "لا أسعار على الموقع لأن لكل نشاط طريقته؛ وعرضك يصلك مكتوبًا بعد الجلسة.",
      ),
    },
  };
}

/** Same answer wherever it appears. */
export const NOT_BUILT_ON_ODOO_FAQ = {
  question: b("Is Falcon ERP built on Odoo?", "هل فالكون ERP مبني على أودو؟"),
  answer: b(
    "No. Falcon ERP is our own product, developed in-house. We also implement Odoo, and we recommend whichever of the two fits you.",
    "لا. فالكون ERP منتجنا الخاص، طوّرناه بأنفسنا. ونطبّق أودو أيضًا، ونرشّح لك ما يناسبك من النظامين.",
  ),
};

export const NO_PRICES_FAQ = {
  question: b("Why are there no prices on the site?", "لماذا لا توجد أسعار على الموقع؟"),
  answer: b(
    "Because every business runs differently. After the demo session you get a written proposal with scope, price and timeline.",
    "لأن لكل نشاط طريقته. بعد جلسة العرض تحصل على عرض مكتوب بالنطاق والسعر والجدول الزمني.",
  ),
};

type Item = { icon: string; title: Bi; line: Bi };
type Step = { title: Bi; description: Bi };

export interface ProductSpec {
  title: Bi;
  subtitle: Bi;
  featuresHeading: Bi;
  featuresIntro: Bi;
  features: Item[];
  steps: Step[];
  booking: { heading: Bi; body: Bi };
}

/** A supporting-service page (server management, data management, applications). No prices. */
export function productBlocks(spec: ProductSpec): SeedInput[] {
  return [
    {
      type: "hero",
      content: {
        title: spec.title,
        subtitle: spec.subtitle,
        primaryCta: demoCta(),
        secondaryCta: { label: b("Contact us", "تواصل معنا"), href: "/contact" },
        sectorsLabel: b(""),
        card: { image: "", alt: b(""), caption: b("") },
        sectorPills: [],
      },
    },
    {
      type: "departments",
      content: { heading: spec.featuresHeading, intro: spec.featuresIntro, items: spec.features },
    },
    {
      type: "process",
      content: {
        heading: b("How we work", "طريقة عملنا"),
        intro: b(""),
        // Durations depend on the scope, so they stay empty until agreed.
        steps: spec.steps.map((s) => ({ ...s, duration: b("") })),
      },
    },
    bookingBlock(spec.booking.heading, spec.booking.body),
  ];
}
