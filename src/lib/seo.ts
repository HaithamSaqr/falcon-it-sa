/**
 * SEO helpers: site origin, locale-aware paths, canonical and hreflang, the
 * per-page `generateMetadata` builder and JSON-LD documents.
 *
 * URLs follow next-intl `localePrefix: "as-needed"`: English is unprefixed,
 * Arabic lives under `/ar`. `x-default` is always the English URL.
 */
import type { Metadata } from "next";
import { getPageSeo, getSeo } from "@/lib/data-store";
import { DEFAULT_SEO } from "@/lib/db/defaults";
import { pickBi, type Bi } from "@/lib/blocks/bi";
import type { PublicSettings } from "@/lib/public-chrome";

export type SeoLocale = "en" | "ar";

/** Public origin, no trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://falcon-it.sa").replace(/\/+$/, "");

/** Share image used when neither the page nor the global SEO sets one. */
export const DEFAULT_OG_IMAGE = "/images/v2/photo-hero-office.jpg";

/** Logo used in Organization JSON-LD. */
export const ORG_LOGO = "/images/v2/falcon-mark.png";

const BRAND = "Falcon";
const BRAND_RE = /falcon|فالكون/i;

function normalizePath(path: string): string {
  const p = `/${path.trim().replace(/^\/+/, "")}`.replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

/** `/x` for en, `/ar/x` for ar; `/` and `/ar` for the home page. */
export function localizedPath(path: string, locale: SeoLocale): string {
  const p = normalizePath(path);
  if (locale === "en") return p;
  return p === "/" ? "/ar" : `/ar${p}`;
}

/** Resolve a path against SITE_URL; absolute http(s) URLs pass through. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export interface Alternates {
  canonical: string;
  languages: { en: string; ar: string; "x-default": string };
}

/** Absolute canonical (for `locale`, default en) and hreflang URLs of a page. */
export function alternatesFor(path: string, locale: SeoLocale = "en"): Alternates {
  const en = absoluteUrl(localizedPath(path, "en"));
  const ar = absoluteUrl(localizedPath(path, "ar"));
  return {
    canonical: locale === "ar" ? ar : en,
    languages: { en, ar, "x-default": en },
  };
}

export interface BuildMetadataInput {
  /** CMS page key (`home`, `sector:<slug>`, ...), used to read `page_seo`. */
  page: string;
  /** Route without locale prefix, e.g. `/sectors/real-estate`. */
  path: string;
  locale: SeoLocale | string;
  fallbackTitle: Bi;
  fallbackDescription: Bi;
}

const txt = (v: string | undefined | null) => (typeof v === "string" ? v.trim() : "");

/** Page title with the brand suffix; the home page and already branded titles stay as they are. */
function withBrand(title: string, isHome: boolean): string {
  if (isHome || BRAND_RE.test(title)) return title;
  return `${title} | ${BRAND}`;
}

/**
 * Metadata for one public page. Title, description and og image come from the
 * page's `page_seo` row, then the page's own fallback text, then the global SEO.
 * Never throws: with the database down it uses the fallbacks and defaults.
 */
export async function buildMetadata(input: BuildMetadataInput): Promise<Metadata> {
  const locale: SeoLocale = input.locale === "ar" ? "ar" : "en";
  const [row, global] = await Promise.all([
    getPageSeo(input.page).catch(() => null),
    getSeo().catch(() => DEFAULT_SEO),
  ]);

  // Row text for this locale only; the display rule (other locale) applies to the
  // fallback and global values, so a half-filled row never mixes languages.
  const rowTitle = txt(row?.title?.[locale]);
  const rowDescription = txt(row?.description?.[locale]);

  const pageTitle = rowTitle || pickBi(input.fallbackTitle, locale).trim();
  const title = pageTitle
    ? withBrand(pageTitle, input.page === "home")
    : pickBi(global.metaTitle, locale).trim() || DEFAULT_SEO.metaTitle[locale];
  const description =
    rowDescription ||
    pickBi(input.fallbackDescription, locale).trim() ||
    pickBi(global.metaDescription, locale).trim() ||
    DEFAULT_SEO.metaDescription[locale];

  // The shipped default global og image is the bare logo; treat it as unset.
  const globalImage = txt(global.ogImage);
  const ogImage = absoluteUrl(
    txt(row?.ogImage) || (globalImage && globalImage !== DEFAULT_SEO.ogImage ? globalImage : DEFAULT_OG_IMAGE),
  );

  const alternates = alternatesFor(input.path, locale);

  return {
    title,
    description,
    alternates: { canonical: alternates.canonical, languages: alternates.languages },
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "Falcon Smart Solutions",
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// ── JSON-LD ─────────────────────────────────────────────────────────

export type JsonLdData = Record<string, unknown>;

/** `00966568406006` and `966568406006` both become `+966568406006`. */
function e164(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^00/, "");
  return digits ? `+${digits}` : "";
}

/** Built-in Organization fallbacks (Saudi office only) for when settings are unavailable. */
const ORG_DEFAULTS = {
  name: { en: "Falcon Smart Solutions", ar: "فالكون للحلول الذكية" },
  email: "info@falcon-v.com",
  phone: "00966568406006",
  address: "Riyadh, Saudi Arabia",
  social: {
    linkedin: "https://linkedin.com/company/falcon-smart-solutions",
    twitter: "https://twitter.com/falconsmart",
    facebook: "https://facebook.com/falconsmartsolutions",
    instagram: "https://instagram.com/falconsmart",
    youtube: "https://www.youtube.com/@Falcon_Valley",
  },
} as const;

/**
 * Organization from the public settings (Saudi address and phone only; the
 * public settings already hide the Egypt office). Without settings it uses the
 * built-in company defaults.
 */
export function organizationLd(settings?: PublicSettings): JsonLdData {
  const company = settings?.company;
  const name = txt(company?.name?.en) || ORG_DEFAULTS.name.en;
  const alternateName = txt(company?.name?.ar) || ORG_DEFAULTS.name.ar;
  const branch = company?.branches?.[0];
  const phone = e164(company?.phone?.ksa ?? ORG_DEFAULTS.phone);
  const email = txt(company?.email) || ORG_DEFAULTS.email;

  const social = settings?.social ?? ORG_DEFAULTS.social;
  const sameAs = Object.values(social)
    .map((u) => txt(u))
    .filter((u) => /^https:\/\//i.test(u));

  const ld: JsonLdData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    alternateName,
    url: SITE_URL,
    logo: absoluteUrl(ORG_LOGO),
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: txt(branch?.address?.en) || ORG_DEFAULTS.address,
      addressCountry: "SA",
    },
  };
  if (phone) ld.telephone = phone;
  if (sameAs.length > 0) ld.sameAs = sameAs;
  return ld;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqLd(faqs: FaqItem[]): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  /** A path (resolved against SITE_URL) or an absolute URL. */
  url: string;
}

export function breadcrumbLd(items: BreadcrumbItem[]): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.url),
    })),
  };
}
