/**
 * Public chrome data (navbar, footer, WhatsApp widget, mobile bar): types and
 * pure helpers shared by the server (`getPublicSettings`, `/api/settings/public`)
 * and the client settings provider. No database or Node imports here.
 *
 * Owner decision (2026-10-03): the Egypt office is hidden. Placeholder phones
 * never reach the page and WhatsApp never routes to an Egyptian number.
 */
import type {
  Branch,
  FooterLink,
  IntegrationSettings,
  Product,
  Sector,
  SiteSettings,
} from "@/types/admin";
import { resolveKeptRoute } from "@/lib/kept-routes";
import { isSafeLink } from "@/lib/blocks/links";

export interface BilingualText {
  en: string;
  ar: string;
}

export interface PublicBranch {
  id: string;
  name: BilingualText;
  address: BilingualText;
  phone: string;
}

export interface PublicFooterLink {
  id: string;
  section: string;
  label: BilingualText;
  url: string;
}

export interface PublicProduct {
  slug: string;
  name: BilingualText;
}

export interface PublicSector {
  slug: string;
  name: BilingualText;
}

export interface WhatsappRouting {
  domains: { domain: string; number: string }[];
  countries: { country: string; number: string }[];
}

export interface LandingCta {
  mode: "whatsapp" | "url";
  url: string;
  label?: BilingualText;
  note?: BilingualText;
}

export interface PublicSettings {
  gulfOnly: boolean;
  loginUrl: string;
  blogEnabled: boolean;
  /** Global primary CTA ("Book a demo" to /demo by default). */
  primaryCta: { label: BilingualText; demoUrl: string };
  products: PublicProduct[];
  sectors: PublicSector[];
  whatsappRouting: WhatsappRouting;
  landingCta: LandingCta;
  /** Public Google Ads conversion config (no secrets). */
  googleAds: { adsId: string; quoteLabel: string; demoLabel: string; contactLabel: string; whatsappLabel: string };
  company: {
    name: BilingualText;
    email: string;
    /** Only the Saudi phone is public; the Egypt office is hidden. */
    phone: { ksa: string };
    whatsapp: string;
    branches: PublicBranch[];
    /** Unified national number. */
    crNumber: string;
    vatNumber: string;
  };
  social: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  footerLinks: PublicFooterLink[];
}

/** The placeholder Egypt phone shipped in the old defaults. */
export const PLACEHOLDER_PHONE = "+201000000000";

/**
 * A social profile URL from settings, or "" when it is blank or not a path or
 * https URL (so a stored `javascript:` link is never rendered as an href).
 */
export function safeSocialHref(value: string | null | undefined): string {
  const v = (value ?? "").trim();
  return isSafeLink(v) ? v : "";
}

/** Saudi WhatsApp number used whenever a stored or routed number is unusable. */
export const SAUDI_WHATSAPP_FALLBACK = "966568406006";

/** Products that moved to the /erp pages (old slug to new path); every other product is a supporting service. */
export const ERP_PRODUCT_PAGE: Record<string, string> = {
  "falcon-erp-desktop": "/erp/falcon",
  "falcon-cloud": "/erp/falcon",
  "odoo-services": "/erp/odoo",
};
export const ERP_PRODUCT_SLUGS = new Set(Object.keys(ERP_PRODUCT_PAGE));

/** Digits only, without a leading international `00`. */
function intlDigits(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^00/, "");
}

const PLACEHOLDER_DIGITS = intlDigits(PLACEHOLDER_PHONE);

/** An empty phone or the Egypt placeholder is never rendered. */
export function isHiddenPhone(phone: string | null | undefined): boolean {
  if (typeof phone !== "string") return true;
  const digits = intlDigits(phone);
  return digits === "" || digits === PLACEHOLDER_DIGITS;
}

/** Arabic letters (diacritics excluded, they never end a word). */
const AR_LETTER = "\u0620-\u064A\u066E-\u06D3\u06FA-\u06FF\u0750-\u077F";
const AR_MARKS = "\u064B-\u065F\u0670";
const EGYPT_LATIN = /\b(?:egypt|cairo)\b/i;
/**
 * مصر / القاهرة as whole words, allowing one prefix (و ب ل ف ال), so مصرف (bank)
 * and مصروفات (expenses) do not match.
 */
const EGYPT_ARABIC = new RegExp(
  `(?<![${AR_LETTER}${AR_MARKS}])(?:و|ب|ل|ف|ال)?(?:مصر|القاهرة)(?![${AR_MARKS}]*[${AR_LETTER}])`,
);

/** True when a text names Egypt or Cairo as a whole word (English or Arabic). */
export function mentionsEgypt(text: string | null | undefined): boolean {
  return typeof text === "string" && (EGYPT_LATIN.test(text) || EGYPT_ARABIC.test(text));
}

function hasText(v: BilingualText | null | undefined): boolean {
  return !!v && ((v.en ?? "").trim() !== "" || (v.ar ?? "").trim() !== "");
}

/** A branch is public only with a real phone and an address, and never when it is in Egypt. */
export function isVisibleBranch(branch: PublicBranch | Branch): boolean {
  if (isHiddenPhone(branch.phone) || !hasText(branch.address)) return false;
  const texts = [branch.id, branch.name?.en, branch.name?.ar, branch.address?.en, branch.address?.ar];
  return !texts.some(mentionsEgypt);
}

/** Egyptian (+20) numbers, the placeholder and blanks cannot be WhatsApp targets. */
export function isUnusableWhatsapp(number: string | null | undefined): boolean {
  if (isHiddenPhone(number)) return true;
  return intlDigits(number as string).startsWith("20");
}

/**
 * The number itself when usable, else the fallback, else the Saudi number,
 * always as wa.me digits (`+966 56 840 6006` becomes `966568406006`).
 */
export function safeWhatsapp(number: string | null | undefined, fallback: string): string {
  if (!isUnusableWhatsapp(number)) return intlDigits(number as string);
  if (!isUnusableWhatsapp(fallback)) return intlDigits(fallback);
  return SAUDI_WHATSAPP_FALLBACK;
}

/** Drops Egyptian, placeholder and empty targets and the EG country rule. */
export function sanitizeWhatsappRouting(
  routing: SiteSettings["whatsappRouting"] | WhatsappRouting | null | undefined,
): WhatsappRouting {
  return {
    domains: (routing?.domains ?? [])
      .filter((d) => (d.domain ?? "").trim() !== "" && !isUnusableWhatsapp(d.number))
      .map((d) => ({ domain: d.domain.trim(), number: d.number.trim() })),
    countries: (routing?.countries ?? [])
      .filter(
        (c) =>
          (c.country ?? "").trim() !== "" &&
          c.country.trim().toUpperCase() !== "EG" &&
          !isUnusableWhatsapp(c.number),
      )
      .map((c) => ({ country: c.country.trim().toUpperCase(), number: c.number.trim() })),
  };
}

/** Supporting services for the footer: every product except the ERP products. */
export function supportingServices<T extends { slug: string }>(products: T[]): T[] {
  return products.filter((p) => !ERP_PRODUCT_SLUGS.has(p.slug));
}

/** `/blog`, `/blog/x`, `/ar/blog` (internal blog URLs). */
export function isBlogUrl(url: string): boolean {
  return /^\/(?:ar\/|en\/)?blog(?:[/?#]|$)/.test((url ?? "").trim());
}

export interface PublicSettingsInput {
  settings: SiteSettings;
  footerLinks: FooterLink[];
  /** Enabled products. */
  products: Product[];
  /** Enabled sectors. */
  sectors: Sector[];
  integrations: IntegrationSettings;
}

/** What the public layout and `/api/settings/public` expose. */
export function buildPublicSettings({
  settings,
  footerLinks,
  products,
  sectors,
  integrations,
}: PublicSettingsInput): PublicSettings {
  const g = integrations.google;
  const blogEnabled = settings.blogEnabled === true;
  const phoneKsa = isHiddenPhone(settings.company.phone?.ksa) ? "" : settings.company.phone.ksa;
  const ksaWhatsapp = intlDigits(phoneKsa);

  return {
    gulfOnly: settings.regional?.gulfOnly ?? false,
    loginUrl: settings.loginUrl || "https://falcon-valley.com",
    blogEnabled,
    primaryCta: {
      label: {
        en: settings.primaryCta?.label?.en ?? "",
        ar: settings.primaryCta?.label?.ar ?? "",
      },
      demoUrl: settings.primaryCta?.demoUrl || "/demo",
    },
    googleAds: g?.enabled
      ? {
          adsId: g.adsId,
          quoteLabel: g.adsQuoteLabel,
          demoLabel: g.adsDemoLabel,
          contactLabel: g.adsContactLabel,
          whatsappLabel: g.adsWhatsappLabel,
        }
      : { adsId: "", quoteLabel: "", demoLabel: "", contactLabel: "", whatsappLabel: "" },
    whatsappRouting: sanitizeWhatsappRouting(settings.whatsappRouting),
    landingCta: settings.landingCta ?? {
      mode: "whatsapp",
      url: "",
      label: { en: "", ar: "" },
      note: { en: "", ar: "" },
    },
    products: products.map((p) => ({ slug: p.slug, name: p.name })),
    sectors: sectors.map((s) => ({ slug: s.id, name: s.name })),
    company: {
      name: settings.company.name,
      email: settings.company.email,
      phone: { ksa: phoneKsa },
      whatsapp: safeWhatsapp(settings.company.whatsapp, ksaWhatsapp),
      branches: (settings.company.branches ?? []).filter(isVisibleBranch).map((b) => ({
        id: b.id,
        name: b.name,
        address: b.address,
        phone: b.phone,
      })),
      crNumber: (settings.company.crNumber ?? "").trim(),
      vatNumber: (settings.company.vatNumber ?? "").trim(),
    },
    social: { ...settings.social, tiktok: settings.social?.tiktok ?? "" },
    footerLinks: footerLinks
      .filter((l) => (blogEnabled || !isBlogUrl(l.url)) && (l.url ?? "").trim() !== "")
      // Links to a kept route (R3) point straight at its destination.
      .map((l) => ({ id: l.id, section: l.section, label: l.label, url: resolveKeptRoute(l.url) })),
  };
}

/** `tel:` target in international form (`00966…` and `966…` become `+966…`). */
export function telHref(phone: string): string {
  const trimmed = phone.trim();
  const digits = intlDigits(trimmed);
  const international = trimmed.startsWith("+") || trimmed.startsWith("00") || digits.startsWith("966");
  return `tel:${international ? "+" : ""}${digits}`;
}

/** Saudi mobile numbers read as `+966 56 840 6006`; anything else is shown as stored. */
export function displayPhone(phone: string): string {
  const digits = intlDigits(phone);
  const m = /^966(5\d)(\d{3})(\d{4})$/.exec(digits);
  return m ? `+966 ${m[1]} ${m[2]} ${m[3]}` : phone.trim();
}
