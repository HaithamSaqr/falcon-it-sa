/**
 * Relational data store. Leads live in the `leads` table; all config lives in
 * dedicated typed tables (see src/lib/db/store.ts). Public API is unchanged so
 * admin pages and API routes keep working.
 *
 * When the app isn't installed yet, reads fall back to in-memory defaults so the
 * public marketing site still renders.
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
  Branch,
} from "@/types/admin";
import { query, getPool } from "@/lib/db/pool";
import { isInstalledSync } from "@/lib/db/config";
import { DEFAULT_CONTENT, DEFAULT_SETTINGS, DEFAULT_INTEGRATIONS } from "@/lib/db/defaults";
import * as store from "@/lib/db/store";

// ═══════════════════════════════════════════════════════════════════
// LEADS
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

  if (filters?.type) leads = leads.filter((l) => l.type === filters.type);
  if (filters?.status) leads = leads.filter((l) => l.status === filters.status);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    leads = leads.filter((l) => {
      const d = l.data;
      const searchable = [d.fullName, d.name, d.email, d.company, d.contactName, d.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }
  if (filters?.dateFrom) leads = leads.filter((l) => l.createdAt >= filters.dateFrom!);
  if (filters?.dateTo) leads = leads.filter((l) => l.createdAt <= filters.dateTo!);

  const sortBy = filters?.sortBy || "createdAt";
  const sortOrder = filters?.sortOrder || "desc";
  leads.sort((a, b) => {
    const av = a[sortBy] || "";
    const bv = b[sortBy] || "";
    const cmp = String(av).localeCompare(String(bv));
    return sortOrder === "desc" ? -cmp : cmp;
  });

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

export async function bulkUpdateStatus(ids: string[], status: LeadStatus): Promise<number> {
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
    return await store.readContent(await getPool());
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function updateContent(content: SiteContent): Promise<void> {
  await store.writeContent(await getPool(), content);
}

// ═══════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════

export async function getSettings(): Promise<SiteSettings> {
  if (!isInstalledSync()) return DEFAULT_SETTINGS;
  try {
    return await store.readSettings(await getPool());
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(settings: SiteSettings): Promise<void> {
  await store.writeSettings(await getPool(), settings);
}

/** Lightweight JWT secret read (no branches/admin joins) for the auth hot path. */
export async function getJwtSecret(): Promise<string> {
  if (!isInstalledSync()) return "";
  try {
    const pool = await getPool();
    const r = await pool.query(`SELECT jwt_secret FROM site_settings WHERE id = 1`);
    return r.rows[0]?.jwt_secret || "";
  } catch {
    return "";
  }
}

// ═══════════════════════════════════════════════════════════════════
// BRANCHES
// ═══════════════════════════════════════════════════════════════════

export async function getBranches(): Promise<Branch[]> {
  if (!isInstalledSync()) return DEFAULT_SETTINGS.company.branches;
  try {
    return await store.readBranches(await getPool());
  } catch {
    return DEFAULT_SETTINGS.company.branches;
  }
}

export async function setBranches(branches: Branch[]): Promise<void> {
  await store.writeBranches(await getPool(), branches);
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN USERS
// ═══════════════════════════════════════════════════════════════════

export async function findAdmin(username: string) {
  return store.getAdminByUsername(await getPool(), username);
}

export async function adminCount(): Promise<number> {
  if (!isInstalledSync()) return 0;
  try {
    return await store.countAdmins(await getPool());
  } catch {
    return 0;
  }
}

export async function createAdminUser(username: string, passwordHash: string): Promise<void> {
  await store.createAdmin(await getPool(), username, passwordHash);
}

export async function setAdminPassword(username: string, passwordHash: string): Promise<void> {
  await store.updateAdminPassword(await getPool(), username, passwordHash);
}

export async function firstAdminUsername(): Promise<string> {
  if (!isInstalledSync()) return "";
  try {
    return await store.firstAdminUsername(await getPool());
  } catch {
    return "";
  }
}

// ═══════════════════════════════════════════════════════════════════
// INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════

export async function getIntegrations(): Promise<IntegrationSettings> {
  if (!isInstalledSync()) return DEFAULT_INTEGRATIONS;
  try {
    return await store.readIntegrations(await getPool());
  } catch {
    return DEFAULT_INTEGRATIONS;
  }
}

export async function updateIntegrations(settings: IntegrationSettings): Promise<void> {
  await store.writeIntegrations(await getPool(), settings);
}

// ═══════════════════════════════════════════════════════════════════
// ANALYTICS (computed from leads)
// ═══════════════════════════════════════════════════════════════════

export async function getAnalytics() {
  const leads = await getAllLeads();
  const now = new Date();

  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const countryMap: Record<string, number> = {};
  const industryMap: Record<string, number> = {};

  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  let thisWeek = 0;
  let lastWeek = 0;
  let converted = 0;

  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }

  for (const lead of leads) {
    byType[lead.type] = (byType[lead.type] || 0) + 1;
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
    if (lead.status === "converted") converted++;

    const createdAt = new Date(lead.createdAt);
    if (createdAt >= startOfThisWeek) thisWeek++;
    else if (createdAt >= startOfLastWeek && createdAt < startOfThisWeek) lastWeek++;

    const dayKey = lead.createdAt.slice(0, 10);
    if (dayKey in dayMap) dayMap[dayKey]++;

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
