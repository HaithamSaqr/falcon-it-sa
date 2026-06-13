// ── Lead Types ──────────────────────────────────────────────────────
export type LeadType = "demo" | "contact" | "newsletter" | "calculator" | "trial" | "partner";
export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export interface Lead {
  id: string;
  type: LeadType;
  status: LeadStatus;
  data: Record<string, unknown>;
  source?: string;
  locale?: string;
  ip?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters {
  type?: LeadType;
  status?: LeadStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "type" | "status";
  sortOrder?: "asc" | "desc";
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

// ── Content Types ───────────────────────────────────────────────────
export interface BilingualText {
  en: string;
  ar: string;
}

export interface SiteContent {
  hero: {
    en: { title: string; subtitle: string; cta1Text: string; cta2Text: string };
    ar: { title: string; subtitle: string; cta1Text: string; cta2Text: string };
  };
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    company: string;
    quote: BilingualText;
    image?: string;
  }>;
  faqs: Array<{
    id: string;
    question: BilingualText;
    answer: BilingualText;
  }>;
  stats: Array<{
    value: number;
    suffix: string;
    label: BilingualText;
  }>;
}

// ── Home Page Types ─────────────────────────────────────────────────
export interface CtaLink {
  label: BilingualText;
  url: string;
}

export interface HomeHero {
  eyebrow: BilingualText;
  title: BilingualText;
  subtitle: BilingualText;
  cta1: CtaLink;
  cta2: CtaLink;
  trust1: BilingualText;
  trust2: BilingualText;
  image: string;
}

export interface HomeCard {
  id: string;
  icon: string;
  title: BilingualText;
  desc: BilingualText;
}

export interface HomeContent {
  hero: HomeHero;
  whyErpFails: {
    label: BilingualText;
    heading: BilingualText;
    subheading: BilingualText;
    cards: HomeCard[];
  };
  whyChoose: {
    heading: BilingualText;
    subheading: BilingualText;
    cards: HomeCard[];
  };
  cta: {
    headline: BilingualText;
    subtitle: BilingualText;
    cta1: CtaLink;
    cta2: CtaLink;
  };
  stats: {
    heading: BilingualText;
    items: Array<{ value: number; suffix: string; label: BilingualText }>;
  };
  newsletter: { heading: BilingualText; subtitle: BilingualText };
}

// ── Settings Types ──────────────────────────────────────────────────
export interface Branch {
  id: string;
  name: BilingualText;
  address: BilingualText;
  phone: string;
}

export interface SiteSettings {
  company: {
    name: BilingualText;
    email: string;
    phone: { ksa: string; egypt: string };
    whatsapp: string;
    /** Dynamic list of office branches (admin can add/remove). */
    branches: Branch[];
  };
  notifications: {
    emailOnNewLead: boolean;
    salesEmail: string;
  };
  social: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  /** External URL the navbar "Login" button points to. */
  loginUrl: string;
  /** Clients marquee speed — seconds per logo (higher = slower). */
  clientsSpeed: number;
  /**
   * WhatsApp number routing. Resolution precedence at request time:
   * visitor country (by IP) → request domain → company.whatsapp (default).
   */
  whatsappRouting: {
    domains: { id: string; domain: string; number: string }[];
    countries: { id: string; country: string; number: string }[];
  };
  /**
   * Sector landing page CTA. "whatsapp" sends the request via WhatsApp;
   * "url" opens an external link (e.g. a SaaS checkout) with the quote
   * details appended as query params.
   */
  landingCta: {
    mode: "whatsapp" | "url";
    url: string;
    /** Optional button caption override (blank → sensible default per mode). */
    label: BilingualText;
    /** Optional helper text under the button (blank → default per mode). */
    note: BilingualText;
  };
  regional: {
    gulfOnly: boolean; // Hide Egypt office, phone, address when true
  };
  security: {
    /** Admin login username (set during first-run setup). */
    adminUsername: string;
    /** Write-only plaintext password input (settings UI). Never persisted. */
    adminPassword?: string;
    /** scrypt hash — the source of truth for admin login. */
    adminPasswordHash?: string;
    jwtSecret: string;
    rateLimitMax: number;
    rateLimitWindowMs: number;
  };
}

// ── Sector / Pricing / Client / Brochure Types ─────────────────────
export type SectorSystem = "desktop" | "cloud" | "odoo";

export interface Sector {
  id: string; // slug
  icon: string;
  gradient: string;
  name: BilingualText;
  title: BilingualText;
  description: BilingualText;
  systems: SectorSystem[];
  /** Default video URL (YouTube/Vimeo/embed) shown on the landing page. */
  videoUrl: string;
  /** Video overrides by domain (Layer 1) and visitor country (Layer 2). */
  videoDomains: { id: string; domain: string; videoUrl: string }[];
  videoCountries: { id: string; country: string; videoUrl: string }[];
  /**
   * Per-sector CTA override (overrides the global Landing CTA / WhatsApp
   * Routing). kind "whatsapp" → value is a number; kind "url" → value is a link.
   * Resolution: country → domain → global default.
   */
  ctaDomains: { id: string; domain: string; kind: "whatsapp" | "url"; value: string }[];
  ctaCountries: { id: string; country: string; kind: "whatsapp" | "url"; value: string }[];
  featured: boolean;
  enabled: boolean;
  sortOrder: number;
}

export interface VolumeDiscountTier {
  minUsers: number;
  discountPercent: number;
}

export interface PricingBase {
  pricePerUser: number;
  hostingPrice: number;
  operatingCosts: number;
  trainingCostPerDay: number;
  trainingDays: number;
  systemTrainingDays: Partial<Record<SectorSystem, number>>;
  /** Free technical support — informational only (months), no price effect. */
  freeSupportMonths: number;
  discountPercent: number;
  usdToEgp: number;
  usdToSar: number;
  volumeDiscounts: VolumeDiscountTier[];
}

export interface SectorPricingOverride {
  sectorId: string;
  system: SectorSystem;
  pricePerUser: number | null;
  operatingCosts: number | null;
  trainingDays: number | null;
  hostingPrice: number | null;
  discountPercent: number | null;
  volumeDiscounts: VolumeDiscountTier[] | null;
  /** Show the "Price includes full cloud hosting" note on the landing page. */
  includesCloudHosting: boolean;
  /** Free support months override (null → inherit base). Info only, no price. */
  freeSupportMonths: number | null;
}

export interface ClientTag {
  id: string;
  name: BilingualText;
  sortOrder: number;
}

export interface Client {
  id: string;
  name: BilingualText;
  logo: string;
  /** References to ClientTag ids. */
  tags: string[];
  sortOrder: number;
}

export interface Product {
  slug: string;
  name: BilingualText;
  eyebrow: BilingualText;
  title: BilingualText;
  description: BilingualText;
  heroImage: string;
  /** Separate image used by the home "Product Trio" card. */
  cardImage: string;
  cta1: { label: BilingualText; url: string };
  cta2: { label: BilingualText; url: string };
  isCustom: boolean;
  enabled: boolean;
  sortOrder: number;
}

export interface ProductBrochure {
  slug: string;
  title: BilingualText;
  content: BilingualText; // rich HTML
  enabled: boolean;
}

// ── SEO + Footer Types ──────────────────────────────────────────────
export interface SeoSettings {
  metaTitle: BilingualText;
  metaDescription: BilingualText;
  metaKeywords: BilingualText;
  ogImage: string;
}

export interface FooterLink {
  id: string;
  section: "about" | "support" | "products" | "legal";
  label: BilingualText;
  url: string;
}

// ── Integration Types ───────────────────────────────────────────────
export interface IntegrationSettings {
  odoo: {
    enabled: boolean;
    url: string;
    db: string;
    username: string;
    apiKey: string;
    lastTestedAt?: string;
    lastTestResult?: "success" | "failed";
  };
  ai: {
    enabled: boolean;
    serverUrl: string;
    apiKey: string;
  };
  calendar: {
    enabled: boolean;
    resourceId: number;
    slotDuration: number;
    availableDays: number[];
    startHour: number;
    endHour: number;
    bufferMinutes: number;
    maxAdvanceDays: number;
  };
  email: {
    enabled: boolean;
    provider: "resend";
    apiKey: string;
    fromEmail: string;
    replyTo: string;
  };
  whatsapp: {
    enabled: boolean;
    apiToken: string;
    phoneId: string;
  };
  helpdesk: {
    enabled: boolean;
    defaultTeamId: number;
    allowRating: boolean;
    allowNewTickets: boolean;
  };
  /** Google integration: ownership verification + tags (GTM / GA4 / Ads). */
  google: {
    enabled: boolean;
    /** content of <meta name="google-site-verification">. */
    verification: string;
    /** Google Tag Manager container id (GTM-XXXXXX). */
    gtmId: string;
    /** Google Analytics 4 measurement id (G-XXXXXXX). */
    ga4Id: string;
    /** Google Ads conversion id (AW-XXXXXXXXX). */
    adsId: string;
  };
}

export interface CalendarSlot {
  start: string;
  end: string;
  available: boolean;
}

// ── Portal / Helpdesk Types ────────────────────────────────────────
export interface PortalUser {
  uid: number;
  name: string;
  email: string;
  partnerId: number;
}

export interface HelpdeskTicket {
  id: number;
  ticketNumber: string;
  name: string;
  description: string;
  stage: string;
  stageClosed: boolean;
  priority: "0" | "1" | "2" | "3";
  categoryName: string;
  teamName: string;
  assignedTo: string;
  createdAt: string;
  closedAt: string | null;
  slaDeadline: string | null;
  slaStatus: string;
  rating: string;
  ratingComment: string;
  messageCount: number;
}

export interface HelpdeskMessage {
  id: number;
  body: string;
  author: string;
  date: string;
  type: "comment" | "notification";
}

export interface HelpdeskCategory {
  id: number;
  name: string;
}

// ── Analytics Types ─────────────────────────────────────────────────
export interface AnalyticsData {
  totalLeads: number;
  thisWeek: number;
  lastWeek: number;
  conversionRate: number;
  byType: Record<LeadType, number>;
  byStatus: Record<LeadStatus, number>;
  byDay: Array<{ date: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  topIndustries: Array<{ industry: string; count: number }>;
}
