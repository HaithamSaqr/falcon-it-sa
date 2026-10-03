/**
 * Populated, valid content for every block type (Task 2 fixtures). Lives in
 * src so the dev-only /dev-blocks gallery can render it without importing test
 * files; tests/unit/fixtures/blocks.ts re-exports it. Typed against
 * BlockContentMap so a schema change breaks compilation here. Image paths are
 * real files in public/images/v2 so the gallery loads without 404s.
 */
import type { BlockContentMap, BlockType } from "./types";

const bi = (en: string, ar = "") => ({ en, ar });
const demo = { label: bi("Book a demo", "احجز عرضًا تجريبيًا"), href: "/demo" };

const roles = [
  { id: "dev", label: bi("Developer", "مطوّر عقاري") },
  { id: "con", label: bi("Contractor", "مقاول") },
  { id: "bro", label: bi("Broker", "وسيط عقاري") },
];

export const validFixtures: { [K in BlockType]: BlockContentMap[K] } = {
  hero: {
    title: bi("One ERP for your whole company.", "نظام واحد لشركتك كلها."),
    subtitle: bi("Accounting, inventory, sales, projects and e-invoicing in one system.", "المحاسبة والمخزون والمبيعات في نظام واحد."),
    primaryCta: demo,
    secondaryCta: { label: bi("Talk on WhatsApp", "تحدث معنا على واتساب"), href: "https://wa.me/966500000000" },
    sectorsLabel: bi("See it for", "شاهده لقطاع"),
    card: { image: "/images/v2/photo-hero-laptop.jpg", alt: bi("Falcon ERP on a laptop"), caption: bi("Every department in one system") },
    sectorPills: [
      {
        label: bi("Real estate", "العقارات"),
        subtitle: bi("For developers, contractors and brokers."),
        image: "/images/v2/photo-realestate.jpg",
        alt: bi("Tower at blue hour"),
        caption: bi("Projects, units, instalments"),
        href: "/sectors/real-estate",
      },
      {
        label: bi("Manufacturing", "التصنيع"),
        subtitle: bi("For factories."),
        image: "/images/v2/photo-manufacturing.jpg",
        alt: bi(""),
        caption: bi("Real cost per product"),
        href: "",
      },
    ],
  },
  logo_wall: {
    heading: bi("Companies across Saudi Arabia run on ERPs our team implemented"),
    intro: bi("", "عملاء يعتمدون على أنظمتنا"),
    limit: 12,
    link: { label: bi("See all clients", "كل العملاء"), href: "/clients" },
  },
  departments: {
    heading: bi("One system. Every department.", "نظام واحد. كل الأقسام."),
    intro: bi("Stop copying numbers between Excel and WhatsApp."),
    items: [
      { icon: "Calculator", title: bi("Accounting and e-invoicing", "المحاسبة والفوترة"), line: bi("Month-end in days.") },
      { icon: "Package", title: bi("Inventory and warehouses"), line: bi("One stock number every branch trusts.") },
      { icon: "UsersThree", title: bi("HR and payroll"), line: bi("") },
    ],
  },
  sector_grid: {
    heading: bi("The same ERP, set up for your sector.", "نفس النظام، مضبوط لقطاعك."),
    intro: bi("Pick yours."),
    cards: [
      {
        title: bi("Real estate and construction", "العقارات والمقاولات"),
        line: bi("From land to keys."),
        image: "/images/v2/photo-realestate.jpg",
        imageAlt: bi("Tower"),
        href: "/sectors/real-estate",
      },
      {
        title: bi("Manufacturing"),
        line: bi("Real cost per product."),
        image: "",
        imageAlt: bi(""),
        href: "/sectors/manufacturing",
      },
    ],
    otherCard: {
      title: bi("Don't see your sector?", "لا ترى قطاعك؟"),
      line: bi("Tell us how your business runs."),
      ctaLabel: bi("Book a demo", "احجز عرضًا تجريبيًا"),
      href: "/demo",
    },
  },
  setup_list: {
    heading: bi("An ERP is only as good as its setup.", "قوة النظام في إعداده."),
    intro: bi("Most ERP projects fail on configuration, data and training."),
    points: [
      { problem: bi("Month-end still takes weeks"), fix: bi("We configure closing around how your accounts work.") },
      { problem: bi("Nobody trusts the stock count", "لا أحد يثق بالمخزون"), fix: bi("We connect warehouses, branches and sales.") },
    ],
    link: { label: bi("How we set it up"), href: "/how-we-work" },
  },
  erp_compare: {
    heading: bi("Two ERPs. One honest recommendation."),
    intro: bi("We implement both."),
    odoo: {
      logo: "/images/v2/logo-odoo.png",
      logoAlt: bi("Odoo"),
      title: bi("Odoo"),
      body: bi("The global ERP, set up for you."),
      chips: [bi("Accounting"), bi("Inventory"), bi("CRM")],
      points: [bi("Many connected apps in one system"), bi("Add modules as you grow")],
      link: { label: bi("Our Odoo services"), href: "/erp/odoo" },
    },
    falcon: {
      logo: "/images/v2/logo-falcon-erp.png",
      logoAlt: bi("Falcon ERP"),
      title: bi("Falcon ERP", "فالكون ERP"),
      body: bi("Our own ERP, built in-house."),
      chips: [bi("Accounting"), bi("Projects"), bi("Real estate")],
      points: [bi("On your own servers"), bi("Arabic-first")],
      link: { label: bi("Explore Falcon ERP"), href: "/erp/falcon" },
    },
  },
  process: {
    heading: bi("From first call to a live ERP, one team."),
    intro: bi(""),
    steps: [
      { title: bi("Assess"), description: bi("A demo on your own workflow."), duration: bi("1 day") },
      { title: bi("Blueprint"), description: bi("A written scope and timeline."), duration: bi("1 to 2 weeks", "من أسبوع إلى أسبوعين") },
      { title: bi("Build"), description: bi("Configure, develop, migrate."), duration: bi("4 to 8 weeks") },
      { title: bi("Train"), description: bi(""), duration: bi("1 to 2 weeks") },
      { title: bi("Support"), description: bi("We stay after go-live."), duration: bi("Ongoing") },
    ],
  },
  quote: {
    text: bi("One real sentence from a client about a specific result.", "جملة حقيقية من العميل."),
    name: bi("Client name", "اسم العميل"),
    role: bi("Finance director"),
    company: bi("Example Co"),
    logo: "/images/v2/logo-zamil.png",
    logoAlt: bi("Example Co logo"),
  },
  booking: {
    heading: bi("See your own workflow running in the ERP.", "شاهد دورتك تعمل داخل النظام."),
    body: bi("In one session a senior implementer shows you the ERP on your processes."),
    cta: demo,
    noteTitle: bi("Why no prices here?", "لماذا لا توجد أسعار؟"),
    note: bi("Your proposal comes in writing after the demo."),
  },
  sector_hero: {
    roles,
    rolePrompt: bi("I am", "أنا"),
    promise: {
      dev: { title: bi("Know each unit's profit before you sell it."), subtitle: bi("Cost, sales and instalments in one system.") },
      con: { title: bi("Your certificate on time, your margin in view."), subtitle: bi("") },
      bro: { title: bi("No unit listed twice, no commission lost."), subtitle: bi("Every owner's units with their real status.") },
    },
    photo: "/images/v2/photo-realestate.jpg",
    photoAlt: bi("Tower at blue hour"),
    trustLine: bi("Developers and contractors work on systems our team implemented."),
    primaryCta: demo,
    secondaryCta: { label: bi("See your stages in the lifecycle"), href: "/sectors/real-estate" },
  },
  lifecycle: {
    heading: bi("From land to keys, one number runs through every stage."),
    intro: bi("Change your role and the stages you live every day light up."),
    yourRoleLabel: bi("Your role", "دورك هنا"),
    roles,
    stages: [
      { title: bi("Land and feasibility"), description: bi("Know before the first riyal."), modules: bi("Assets, budgets"), roles: ["dev"] },
      { title: bi("Execution"), description: bi("Every certificate against work done."), modules: bi("Certificates, stores, equipment"), roles: ["dev", "con"] },
      { title: bi("Handover and operations"), description: bi("Warranty, maintenance, leases."), modules: bi("Maintenance, leases"), roles: ["dev", "con", "bro"] },
    ],
    summary: {
      dev: { headline: bi("Every morning: spent, sold, collected."), points: [bi("Build cost spread across units"), bi("One status per unit")] },
      bro: { headline: bi("No unit listed after it sells."), points: [] },
    },
  },
  role_pains: {
    heading: bi("Sound familiar?"),
    intro: bi(""),
    roles,
    pains: {
      dev: {
        headline: bi("You sold the unit and still do not know your profit."),
        items: [
          { pain: bi("Cost sits with accounting, sales with the sales team"), fix: bi("Cost per unit is visible from day one.") },
          { pain: bi("Same unit, two customers"), fix: bi("One status for every unit.") },
        ],
      },
      con: { headline: bi(""), items: [{ pain: bi("Certificates wait for weeks"), fix: bi("") }] },
    },
  },
  fit: {
    heading: bi("Odoo or Falcon? We will tell you plainly.", "أودو أم فالكون؟ سنقولها لك بصراحة."),
    intro: bi("We implement both, so the recommendation comes from your workflow."),
    odoo: { name: bi("Odoo"), when: bi("If sales and brokers are the core of your business"), points: [bi("Strong CRM and portal"), bi("Custom units, contracts and commissions")] },
    falcon: { name: bi("Falcon ERP", "فالكون ERP"), when: bi("If you want a ready real estate system on your own server"), points: [bi("Real estate investment module")] },
    closing: bi("Not sure? Book a demo and we will recommend one in writing."),
  },
  plan: {
    heading: bi("Four steps, no surprises.", "أربع خطوات، ولا مفاجآت."),
    intro: bi(""),
    steps: [
      { title: bi("Assessment"), description: bi("We map your cycle in one session."), duration: bi("1 day") },
      { title: bi("Blueprint"), description: bi("A written scope you sign before we start."), duration: bi("2 weeks") },
      { title: bi("Setup and migration"), description: bi("We move your data and match it with you."), duration: bi("6 weeks") },
      { title: bi("Training and go-live"), description: bi("Your team practises on its own data."), duration: bi("2 weeks") },
    ],
  },
  faq_ref: {
    heading: bi("Questions we hear often", "أسئلة نسمعها كثيرًا"),
    items: [
      { question: bi("Why are there no prices on the website?"), answer: bi("Because needs differ. Your proposal comes in writing after the demo.") },
      { question: bi("Can you migrate our current data?", "هل تنقلون بياناتنا؟"), answer: bi("Yes, open projects, balances and contracts are part of the plan.", "نعم.") },
    ],
  },
  rich_text: {
    heading: bi("About our approach", "عن أسلوبنا"),
    paragraphs: [bi("First paragraph with **bold** text.", "فقرة أولى."), bi("Second paragraph."), bi("", "فقرة بالعربية فقط.")],
  },
  contact_info: {
    heading: bi("Contact us", "تواصل معنا"),
    intro: bi("We reply within one business day."),
    show: { phone: true, whatsapp: true, email: true, address: false, hours: true, branches: true, social: false },
  },
  demo_form: {
    heading: bi("Book a demo", "احجز عرضًا تجريبيًا"),
    body: bi("Free, no commitment."),
    submitLabel: bi("Book a demo", "احجز عرضًا تجريبيًا"),
    privacyNote: bi("See our privacy policy."),
  },
};
