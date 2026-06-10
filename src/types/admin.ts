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

// ── Integration Types ───────────────────────────────────────────────
export interface IntegrationSettings {
  odoo: {
    enabled: boolean;
    url: string;
    db: string;
    username: string;
    password: string;
    lastTestedAt?: string;
    lastTestResult?: "success" | "failed";
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
