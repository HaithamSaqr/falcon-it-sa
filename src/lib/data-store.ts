/**
 * JSON File Data Store
 * Simple file-based persistence for leads, content, and settings.
 * Uses in-process mutex to prevent concurrent write corruption.
 */

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type {
  Lead,
  LeadType,
  LeadStatus,
  LeadFilters,
  LeadsResponse,
  SiteContent,
  SiteSettings,
  IntegrationSettings,
} from "@/types/admin";

// ── Paths ───────────────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const INTEGRATIONS_FILE = path.join(DATA_DIR, "integrations.json");

// ── File Mutex (per-file write serialization) ───────────────────────
const locks = new Map<string, Promise<void>>();

async function withLock<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(file) || Promise.resolve();
  let resolve: () => void;
  const next = new Promise<void>((r) => { resolve = r; });
  locks.set(file, next);

  await prev;
  try {
    return await fn();
  } finally {
    resolve!();
  }
}

// ── Low-level file I/O ──────────────────────────────────────────────
async function ensureDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // already exists
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDir();
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    // File doesn't exist or invalid JSON — write default
    await fs.writeFile(file, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await ensureDir();
  const tmp = file + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, file);
}

// ═══════════════════════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════════════════════

export async function getAllLeads(): Promise<Lead[]> {
  return readJson<Lead[]>(LEADS_FILE, []);
}

export async function getLeads(filters?: LeadFilters): Promise<LeadsResponse> {
  let leads = await getAllLeads();

  // Apply filters
  if (filters?.type) {
    leads = leads.filter((l) => l.type === filters.type);
  }
  if (filters?.status) {
    leads = leads.filter((l) => l.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    leads = leads.filter((l) => {
      const d = l.data;
      const searchable = [
        d.fullName, d.name, d.email, d.company, d.contactName, d.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }
  if (filters?.dateFrom) {
    leads = leads.filter((l) => l.createdAt >= filters.dateFrom!);
  }
  if (filters?.dateTo) {
    leads = leads.filter((l) => l.createdAt <= filters.dateTo!);
  }

  // Sort
  const sortBy = filters?.sortBy || "createdAt";
  const sortOrder = filters?.sortOrder || "desc";
  leads.sort((a, b) => {
    const av = a[sortBy] || "";
    const bv = b[sortBy] || "";
    const cmp = String(av).localeCompare(String(bv));
    return sortOrder === "desc" ? -cmp : cmp;
  });

  // Paginate
  const total = leads.length;
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  leads = leads.slice(start, start + limit);

  return { leads, total, page, totalPages };
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const leads = await getAllLeads();
  return leads.find((l) => l.id === id) || null;
}

export async function addLead(
  lead: Omit<Lead, "id" | "createdAt" | "updatedAt">
): Promise<Lead> {
  return withLock(LEADS_FILE, async () => {
    const leads = await getAllLeads();
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    leads.unshift(newLead); // newest first
    await writeJson(LEADS_FILE, leads);
    return newLead;
  });
}

export async function updateLead(
  id: string,
  updates: Partial<Pick<Lead, "status" | "notes">>
): Promise<Lead | null> {
  return withLock(LEADS_FILE, async () => {
    const leads = await getAllLeads();
    const idx = leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;

    leads[idx] = {
      ...leads[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await writeJson(LEADS_FILE, leads);
    return leads[idx];
  });
}

export async function deleteLead(id: string): Promise<boolean> {
  return withLock(LEADS_FILE, async () => {
    const leads = await getAllLeads();
    const filtered = leads.filter((l) => l.id !== id);
    if (filtered.length === leads.length) return false;
    await writeJson(LEADS_FILE, filtered);
    return true;
  });
}

export async function bulkUpdateStatus(
  ids: string[],
  status: LeadStatus
): Promise<number> {
  return withLock(LEADS_FILE, async () => {
    const leads = await getAllLeads();
    let count = 0;
    const now = new Date().toISOString();
    for (const lead of leads) {
      if (ids.includes(lead.id)) {
        lead.status = status;
        lead.updatedAt = now;
        count++;
      }
    }
    await writeJson(LEADS_FILE, leads);
    return count;
  });
}

// ═══════════════════════════════════════════════════════════════════
// CONTENT
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_CONTENT: SiteContent = {
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

export async function getContent(): Promise<SiteContent> {
  return readJson<SiteContent>(CONTENT_FILE, DEFAULT_CONTENT);
}

export async function updateContent(content: SiteContent): Promise<void> {
  return withLock(CONTENT_FILE, async () => {
    await writeJson(CONTENT_FILE, content);
  });
}

// ═══════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_SETTINGS: SiteSettings = {
  company: {
    name: { en: "Falcon Smart Solutions", ar: "فالكون للحلول الذكية" },
    email: "info@falcon-v.com",
    phone: { ksa: "+966500000000", egypt: "+201000000000" },
    whatsapp: "966500000000",
    address: {
      ksa: { en: "Riyadh, Saudi Arabia", ar: "الرياض، المملكة العربية السعودية" },
      egypt: { en: "Cairo, Egypt", ar: "القاهرة، مصر" },
    },
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
    youtube: "https://youtube.com/@falconsmart",
  },
  regional: {
    gulfOnly: false,
  },
  security: {
    adminPassword: process.env.ADMIN_PASSWORD || "",
    jwtSecret: process.env.ADMIN_JWT_SECRET || crypto.randomUUID() + crypto.randomUUID(),
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 10,
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  },
};

export async function getSettings(): Promise<SiteSettings> {
  return readJson<SiteSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);
}

export async function updateSettings(settings: SiteSettings): Promise<void> {
  return withLock(SETTINGS_FILE, async () => {
    await writeJson(SETTINGS_FILE, settings);
  });
}

// ═══════════════════════════════════════════════════════════════════
// ANALYTICS (computed from leads)
// ═══════════════════════════════════════════════════════════════════

export async function getAnalytics() {
  const leads = await getAllLeads();
  const now = new Date();

  // By type
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const countryMap: Record<string, number> = {};
  const industryMap: Record<string, number> = {};

  // Week boundaries
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  let thisWeek = 0;
  let lastWeek = 0;
  let converted = 0;

  // Daily counts (last 30 days)
  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }

  for (const lead of leads) {
    // Type & status counts
    byType[lead.type] = (byType[lead.type] || 0) + 1;
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;

    if (lead.status === "converted") converted++;

    // Week comparison
    const createdAt = new Date(lead.createdAt);
    if (createdAt >= startOfThisWeek) thisWeek++;
    else if (createdAt >= startOfLastWeek && createdAt < startOfThisWeek) lastWeek++;

    // Daily
    const dayKey = lead.createdAt.slice(0, 10);
    if (dayKey in dayMap) dayMap[dayKey]++;

    // Country & industry
    const country = (lead.data.country as string) || "";
    const industry = (lead.data.industry as string) || "";
    if (country) countryMap[country] = (countryMap[country] || 0) + 1;
    if (industry) industryMap[industry] = (industryMap[industry] || 0) + 1;
  }

  const byDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

  const topCountries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));

  const topIndustries = Object.entries(industryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([industry, count]) => ({ industry, count }));

  return {
    totalLeads: leads.length,
    thisWeek,
    lastWeek,
    conversionRate: leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0,
    byType: byType as Record<LeadType, number>,
    byStatus: byStatus as Record<LeadStatus, number>,
    byDay,
    topCountries,
    topIndustries,
  };
}

// ═══════════════════════════════════════════════════════════════════
// INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_INTEGRATIONS: IntegrationSettings = {
  odoo: {
    enabled: false,
    url: process.env.ODOO_URL || "",
    db: process.env.ODOO_DB || "",
    username: process.env.ODOO_USERNAME || "",
    password: process.env.ODOO_PASSWORD || "",
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
};

export async function getIntegrations(): Promise<IntegrationSettings> {
  return readJson<IntegrationSettings>(INTEGRATIONS_FILE, DEFAULT_INTEGRATIONS);
}

export async function updateIntegrations(settings: IntegrationSettings): Promise<void> {
  return withLock(INTEGRATIONS_FILE, async () => {
    await writeJson(INTEGRATIONS_FILE, settings);
  });
}
