/**
 * PostgreSQL-backed data store for leads, content, settings, and integrations.
 *
 * Public API is unchanged from the previous JSON-file implementation, so all
 * admin pages and API routes keep working. Leads live in the `leads` table;
 * content/settings/integrations are single JSONB documents in `singletons`.
 *
 * When the app is not yet installed (no DB configured), reads fall back to the
 * in-memory defaults so the public marketing site still renders.
 */

import crypto from "crypto";
import type {
  Lead,
  LeadStatus,
  LeadFilters,
  LeadsResponse,
  SiteContent,
  SiteSettings,
  IntegrationSettings,
} from "@/types/admin";
import { query } from "@/lib/db/pool";
import { isInstalledSync } from "@/lib/db/config";
import { DEFAULT_CONTENT, DEFAULT_SETTINGS, DEFAULT_INTEGRATIONS } from "@/lib/db/defaults";

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

interface LeadRow {
  id: string;
  type: string;
  status: string;
  data: Record<string, unknown>;
  source: string | null;
  locale: string | null;
  ip: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

function rowToLead(r: LeadRow): Lead {
  return {
    id: r.id,
    type: r.type as Lead["type"],
    status: r.status as LeadStatus,
    data: r.data ?? {},
    source: r.source ?? undefined,
    locale: r.locale ?? undefined,
    ip: r.ip ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

async function getSingleton<T>(key: string): Promise<T | null> {
  const res = await query<{ value: T }>(
    `SELECT value FROM singletons WHERE key = $1`,
    [key]
  );
  return res.rows[0]?.value ?? null;
}

async function setSingleton<T>(key: string, value: T): Promise<void> {
  await query(
    `INSERT INTO singletons (key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, JSON.stringify(value)]
  );
}

// ═══════════════════════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════════════════════

export async function getAllLeads(): Promise<Lead[]> {
  if (!isInstalledSync()) return [];
  try {
    const res = await query<LeadRow>(
      `SELECT id, type, status, data, source, locale, ip, notes, created_at, updated_at
       FROM leads ORDER BY created_at DESC`
    );
    return res.rows.map(rowToLead);
  } catch {
    return [];
  }
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
  if (!isInstalledSync()) return null;
  const res = await query<LeadRow>(
    `SELECT id, type, status, data, source, locale, ip, notes, created_at, updated_at
     FROM leads WHERE id = $1`,
    [id]
  );
  return res.rows[0] ? rowToLead(res.rows[0]) : null;
}

export async function addLead(
  lead: Omit<Lead, "id" | "createdAt" | "updatedAt">
): Promise<Lead> {
  const id = crypto.randomUUID();
  const res = await query<LeadRow>(
    `INSERT INTO leads (id, type, status, data, source, locale, ip, notes)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)
     RETURNING id, type, status, data, source, locale, ip, notes, created_at, updated_at`,
    [
      id,
      lead.type,
      lead.status,
      JSON.stringify(lead.data ?? {}),
      lead.source ?? null,
      lead.locale ?? null,
      lead.ip ?? null,
      lead.notes ?? null,
    ]
  );
  return rowToLead(res.rows[0]);
}

export async function updateLead(
  id: string,
  updates: Partial<Pick<Lead, "status" | "notes">>
): Promise<Lead | null> {
  const res = await query<LeadRow>(
    `UPDATE leads
     SET status = COALESCE($2, status),
         notes  = COALESCE($3, notes),
         updated_at = now()
     WHERE id = $1
     RETURNING id, type, status, data, source, locale, ip, notes, created_at, updated_at`,
    [id, updates.status ?? null, updates.notes ?? null]
  );
  return res.rows[0] ? rowToLead(res.rows[0]) : null;
}

export async function deleteLead(id: string): Promise<boolean> {
  const res = await query(`DELETE FROM leads WHERE id = $1`, [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function bulkUpdateStatus(
  ids: string[],
  status: LeadStatus
): Promise<number> {
  if (ids.length === 0) return 0;
  const res = await query(
    `UPDATE leads SET status = $2, updated_at = now() WHERE id = ANY($1::uuid[])`,
    [ids, status]
  );
  return res.rowCount ?? 0;
}

// ═══════════════════════════════════════════════════════════════════
// CONTENT
// ═══════════════════════════════════════════════════════════════════

export async function getContent(): Promise<SiteContent> {
  if (!isInstalledSync()) return DEFAULT_CONTENT;
  try {
    const stored = await getSingleton<SiteContent>("content");
    return stored ?? DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function updateContent(content: SiteContent): Promise<void> {
  await setSingleton("content", content);
}

// ═══════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════

function mergeSettings(stored: Partial<SiteSettings>): SiteSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    company: { ...DEFAULT_SETTINGS.company, ...stored.company },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...stored.notifications },
    social: { ...DEFAULT_SETTINGS.social, ...stored.social },
    regional: { ...DEFAULT_SETTINGS.regional, ...stored.regional },
    security: { ...DEFAULT_SETTINGS.security, ...stored.security },
  };
}

export async function getSettings(): Promise<SiteSettings> {
  if (!isInstalledSync()) return DEFAULT_SETTINGS;
  try {
    const stored = await getSingleton<SiteSettings>("settings");
    return stored ? mergeSettings(stored) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(settings: SiteSettings): Promise<void> {
  await setSingleton("settings", settings);
}

// ═══════════════════════════════════════════════════════════════════
// INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════

export async function getIntegrations(): Promise<IntegrationSettings> {
  if (!isInstalledSync()) return DEFAULT_INTEGRATIONS;
  try {
    const stored = (await getSingleton<Partial<IntegrationSettings>>("integrations")) ?? {};
    // Deep-merge defaults so new sections/fields are always present
    return {
      odoo: { ...DEFAULT_INTEGRATIONS.odoo, ...stored.odoo },
      calendar: { ...DEFAULT_INTEGRATIONS.calendar, ...stored.calendar },
      email: { ...DEFAULT_INTEGRATIONS.email, ...stored.email },
      whatsapp: { ...DEFAULT_INTEGRATIONS.whatsapp, ...stored.whatsapp },
      helpdesk: { ...DEFAULT_INTEGRATIONS.helpdesk, ...stored.helpdesk },
    };
  } catch {
    return DEFAULT_INTEGRATIONS;
  }
}

export async function updateIntegrations(settings: IntegrationSettings): Promise<void> {
  await setSingleton("integrations", settings);
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
    byType: byType as Record<Lead["type"], number>,
    byStatus: byStatus as Record<LeadStatus, number>,
    byDay,
    topCountries,
    topIndustries,
  };
}
