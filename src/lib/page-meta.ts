/**
 * Fallback titles and descriptions of the standalone pages (used by
 * `buildMetadata` when the page has no `page_seo` row, and as breadcrumb
 * names). Every title is different so no two pages share a browser title.
 */
import type { Metadata } from "next";
import type { Bi } from "@/lib/blocks/bi";
import { buildMetadata } from "@/lib/seo";

export type PageMeta = { path: string; title: Bi; description: Bi };

export const PAGE_META = {
  about: {
    path: "/about",
    title: { en: "About us", ar: "من نحن" },
    description: {
      en: "Falcon Smart Solutions implements Odoo and develops Falcon ERP for companies in Saudi Arabia, from recommendation to go-live and support.",
      ar: "فالكون للحلول الذكية تطبّق أودو وتطوّر فالكون ERP للشركات في السعودية، من التوصية حتى التشغيل والدعم.",
    },
  },
  contact: {
    path: "/contact",
    title: { en: "Contact us", ar: "تواصل معنا" },
    description: {
      en: "Reach the Falcon team by phone, WhatsApp or email, or send a message about Odoo, Falcon ERP or a project you are planning.",
      ar: "تواصل مع فريق فالكون بالهاتف أو واتساب أو البريد، أو أرسل رسالة عن أودو أو فالكون ERP أو مشروع تخطط له.",
    },
  },
  demo: {
    path: "/demo",
    title: { en: "Book a demo", ar: "احجز عرضًا تجريبيًا" },
    description: {
      en: "See the ERP running on your own processes, then get a written recommendation. Free, no commitment.",
      ar: "شاهد النظام يعمل على إجراءاتك أنت، ثم احصل على توصية مكتوبة. مجاني وبلا التزام.",
    },
  },
  faq: {
    path: "/faq",
    title: { en: "Frequently asked questions", ar: "الأسئلة الشائعة" },
    description: {
      en: "Answers about booking a demo, implementation time, Fatoora e-invoicing and moving from another system.",
      ar: "إجابات عن حجز العرض التجريبي ومدة التطبيق والفوترة الإلكترونية عبر فاتورة والانتقال من نظام آخر.",
    },
  },
  clients: {
    path: "/clients",
    title: { en: "Our clients", ar: "عملاؤنا" },
    description: {
      en: "Companies across Saudi Arabia that run on ERPs our team implemented.",
      ar: "شركات في السعودية تعمل على أنظمة ERP طبّقها فريقنا.",
    },
  },
  terms: {
    path: "/terms",
    title: { en: "Terms and conditions", ar: "الشروط والأحكام" },
    description: {
      en: "The terms that govern your use of the Falcon Smart Solutions website.",
      ar: "الشروط التي تحكم استخدامك لموقع فالكون للحلول الذكية.",
    },
  },
  "privacy-policy": {
    path: "/privacy-policy",
    title: { en: "Website privacy policy", ar: "سياسة خصوصية الموقع" },
    description: {
      en: "How Falcon Smart Solutions handles the personal data collected through this website.",
      ar: "كيف تتعامل فالكون للحلول الذكية مع البيانات الشخصية التي تُجمع عبر هذا الموقع.",
    },
  },
  privacy: {
    path: "/privacy",
    title: { en: "Falcon Valley app privacy policy", ar: "سياسة خصوصية تطبيق Falcon Valley" },
    description: {
      en: "How the Falcon Valley app handles data when you use it to reach your organisation's business systems.",
      ar: "كيف يتعامل تطبيق Falcon Valley مع البيانات عند استخدامه للوصول إلى أنظمة أعمال مؤسستك.",
    },
  },
  blog: {
    path: "/blog",
    title: { en: "Blog", ar: "المدونة" },
    description: {
      en: "Articles on ERP, Fatoora e-invoicing and running a business in Saudi Arabia.",
      ar: "مقالات عن أنظمة ERP والفوترة الإلكترونية وإدارة الأعمال في السعودية.",
    },
  },
} satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof PAGE_META;

/** `generateMetadata` result for one of these pages (CMS page key = the `PAGE_META` key). */
export function pageMetadata(key: PageKey, locale: string): Promise<Metadata> {
  const m: PageMeta = PAGE_META[key];
  return buildMetadata({
    page: key,
    path: m.path,
    locale,
    fallbackTitle: m.title,
    fallbackDescription: m.description,
  });
}
