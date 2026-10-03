/**
 * Dev-only edge-case blocks for /dev-blocks (Task 7 e2e): the longest admin
 * text the schemas allow in practice, and Arabic left blank.
 */
import type { Block, BlockContentMap, BlockType } from "@/lib/blocks/types";

const bi = (en: string, ar = "") => ({ en, ar });

/** Exactly 140 characters. */
export const TITLE_140 =
  "A deliberately long headline typed into the admin to check that every block wraps cleanly at phone width and on a wide desktop screen today.";

const many = <T>(n: number, make: (i: number) => T): T[] => Array.from({ length: n }, (_, i) => make(i));
const long = (i: number) =>
  bi(
    `Item ${i + 1}: a longer line of admin text that keeps going so it has to wrap across the card on narrow screens`,
    `البند ${i + 1}: سطر أطول من نص الإدارة يستمر حتى يضطر إلى الالتفاف داخل البطاقة على الشاشات الضيقة`,
  );
const roles = [
  { id: "a", label: bi("Owner", "المالك") },
  { id: "b", label: bi("Finance manager", "المدير المالي") },
];

type Item = { [K in BlockType]: { type: K; content: BlockContentMap[K] } }[BlockType];

const toBlocks = (page: string, items: Item[]): Block[] =>
  items.map((it, i) => ({ id: `${page}-${i}`, page, sortOrder: i, enabled: true, ...it }) as Block);

export const EDGE_LONG: Block[] = toBlocks("edge-long", [
  {
    type: "hero",
    content: {
      title: bi(TITLE_140, TITLE_140),
      subtitle: long(0),
      primaryCta: { label: bi("Book a demo", "احجز عرضًا تجريبيًا"), href: "/demo" },
      secondaryCta: { label: bi("A secondary link with a long label", "رابط ثانوي بعنوان طويل"), href: "/contact" },
      sectorsLabel: bi("See it for", "شاهده لقطاع"),
      card: { image: "/images/v2/photo-hero-laptop.jpg", alt: bi("Laptop"), caption: bi("Every department, one system") },
      sectorPills: many(12, (i) => ({
        label: bi(`Sector ${i + 1}`, `قطاع ${i + 1}`),
        subtitle: long(i),
        image: "/images/v2/photo-retail.jpg",
        alt: bi("Store"),
        caption: bi(`Sector ${i + 1} with a long caption that wraps`),
        href: "/sectors/retail",
      })),
    },
  },
  {
    type: "departments",
    content: {
      heading: bi(TITLE_140, TITLE_140),
      intro: long(1),
      items: many(12, (i) => ({ icon: i === 3 ? "NotARealIcon" : "Calculator", title: long(i), line: long(i) })),
    },
  },
  {
    type: "sector_grid",
    content: {
      heading: bi(TITLE_140, TITLE_140),
      intro: long(2),
      cards: many(12, (i) => ({
        title: long(i),
        line: long(i),
        image: i % 3 === 2 ? "" : "/images/v2/photo-logistics.jpg",
        imageAlt: bi("Trucks"),
        href: "/sectors/logistics",
      })),
      otherCard: { title: bi(TITLE_140), line: long(3), ctaLabel: bi("Book a demo"), href: "/demo" },
    },
  },
  {
    type: "setup_list",
    content: {
      heading: bi(TITLE_140, TITLE_140),
      intro: long(3),
      points: many(12, (i) => ({ problem: long(i), fix: long(i) })),
      link: { label: bi("How we set it up"), href: "/#how" },
    },
  },
  {
    type: "erp_compare",
    content: {
      heading: bi(TITLE_140, TITLE_140),
      intro: long(4),
      odoo: {
        logo: "/images/v2/logo-odoo.png",
        logoAlt: bi("Odoo"),
        title: bi(TITLE_140),
        body: long(5),
        chips: many(16, (i) => bi(`Module ${i + 1}`)),
        points: many(12, long),
        link: { label: bi("Our Odoo services"), href: "/erp/odoo" },
      },
      falcon: {
        logo: "/images/v2/logo-falcon-erp.png",
        logoAlt: bi("Falcon ERP"),
        title: bi(TITLE_140),
        body: long(6),
        chips: many(16, (i) => bi(`Module ${i + 1}`)),
        points: many(12, long),
        link: { label: bi("Explore Falcon ERP"), href: "/erp/falcon" },
      },
    },
  },
  {
    type: "process",
    content: {
      heading: bi(TITLE_140, TITLE_140),
      intro: long(7),
      steps: many(10, (i) => ({ title: long(i), description: long(i), duration: bi("4 to 8 weeks") })),
    },
  },
  {
    type: "lifecycle",
    content: {
      heading: bi(TITLE_140, TITLE_140),
      intro: long(8),
      yourRoleLabel: bi("Your role"),
      roles,
      stages: many(12, (i) => ({ title: long(i), description: long(i), modules: long(i), roles: i % 2 ? ["a"] : ["a", "b"] })),
      summary: { a: { headline: bi(TITLE_140), points: many(8, long) } },
    },
  },
  {
    type: "role_pains",
    content: {
      heading: bi(TITLE_140, TITLE_140),
      intro: long(9),
      roles,
      pains: { a: { headline: bi(TITLE_140), items: many(12, (i) => ({ pain: long(i), fix: long(i) })) } },
    },
  },
  {
    type: "faq_ref",
    content: {
      heading: bi(TITLE_140, TITLE_140),
      items: many(12, (i) => ({ question: long(i), answer: long(i) })),
    },
  },
  {
    type: "rich_text",
    content: {
      heading: bi(TITLE_140, TITLE_140),
      paragraphs: [
        bi("An unbroken token: https://example.com/a-very-long-path-without-any-spaces-at-all-to-break-on-0123456789"),
        ...many(12, long),
      ],
    },
  },
  {
    type: "booking",
    content: {
      heading: bi(TITLE_140, TITLE_140),
      body: long(10),
      cta: { label: bi("Book a demo", "احجز عرضًا تجريبيًا"), href: "/demo" },
      noteTitle: bi(TITLE_140),
      note: long(11),
    },
  },
]);

export const EDGE_BLANK_AR: Block[] = toBlocks("edge-blank-ar", [
  {
    type: "rich_text",
    content: {
      heading: bi("English only heading", ""),
      paragraphs: [bi("English only paragraph", ""), bi("", "")],
    },
  },
  {
    type: "hero",
    content: {
      title: bi("English only hero title without a photo", ""),
      subtitle: bi("English only subtitle", ""),
      primaryCta: { label: bi("Book a demo", ""), href: "/demo" },
      secondaryCta: { label: bi(""), href: "" },
      sectorsLabel: bi(""),
      card: { image: "", alt: bi(""), caption: bi("") },
      sectorPills: [],
    },
  },
  {
    type: "departments",
    content: {
      heading: bi("English only departments", ""),
      intro: bi(""),
      items: [
        { icon: "NotARealIcon", title: bi("Unknown icon keeps its slot", ""), line: bi("English only line", "") },
        { icon: "Package", title: bi("", "عنوان بالعربية فقط"), line: bi("") },
      ],
    },
  },
]);
