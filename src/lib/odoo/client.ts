/**
 * Odoo XML-RPC Client
 * Handles authentication and CRUD operations against Odoo ERP.
 * Falls back gracefully when Odoo is unreachable (logs lead locally).
 * Reads config from data/integrations.json (admin panel) first, falls back to .env.
 */

import xmlrpc from "odoo-xmlrpc";
import { getIntegrations } from "@/lib/data-store";

// ── Config (dynamic — reads from integrations store or .env) ────────
interface OdooConfig {
  url: string;
  db: string;
  username: string;
  password: string;
  enabled: boolean;
}

async function getOdooConfig(): Promise<OdooConfig> {
  try {
    const integrations = await getIntegrations();
    if (integrations.odoo.enabled && integrations.odoo.url && integrations.odoo.password) {
      return {
        url: integrations.odoo.url,
        db: integrations.odoo.db,
        username: integrations.odoo.username,
        password: integrations.odoo.password,
        enabled: true,
      };
    }
  } catch {
    // Fall back to env if integrations store fails
  }

  const url = process.env.ODOO_URL || "";
  const db = process.env.ODOO_DB || "";
  const username = process.env.ODOO_USERNAME || "";
  const password = process.env.ODOO_PASSWORD || "";

  return {
    url,
    db,
    username,
    password,
    enabled: Boolean(url && db && username && password && !password.startsWith("changeme")),
  };
}

// Legacy sync check (for imports that check isOdooConfigured at module load)
const ODOO_URL = process.env.ODOO_URL || "";
const ODOO_DB = process.env.ODOO_DB || "";
const ODOO_USERNAME = process.env.ODOO_USERNAME || "";
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || "";
export const isOdooConfigured = Boolean(
  ODOO_URL && ODOO_DB && ODOO_USERNAME && ODOO_PASSWORD && !ODOO_PASSWORD.startsWith("changeme")
);

// ── Country → Odoo country_id mapping ───────────────────────────────
const COUNTRY_MAP: Record<string, number> = {
  ksa: 194,    // Saudi Arabia
  uae: 232,    // United Arab Emirates
  egypt: 65,   // Egypt
  qatar: 179,  // Qatar
  kuwait: 118, // Kuwait
  oman: 167,   // Oman
  bahrain: 18, // Bahrain
};

// ── Country → Sales Team mapping ────────────────────────────────────
const TEAM_MAP: Record<string, number> = {
  ksa: 1,   // KSA Sales Team
  uae: 1,   // Gulf Sales Team (same as KSA for MVP)
  qatar: 1,
  kuwait: 1,
  oman: 1,
  bahrain: 1,
  egypt: 2, // Egypt Sales Team
};

// ── Helpers ─────────────────────────────────────────────────────────
function getOdooCountryId(country: string): number | false {
  return COUNTRY_MAP[country.toLowerCase()] || false;
}

function getTeamByCountry(country: string): number {
  return TEAM_MAP[country.toLowerCase()] || 1;
}

// ── Odoo Connection ─────────────────────────────────────────────────
interface OdooInstance {
  execute_kw(
    model: string,
    method: string,
    params: unknown[],
    callback: (err: Error | null, result: number) => void
  ): void;
}

async function createOdooClient(): Promise<OdooInstance> {
  const config = await getOdooConfig();

  if (!config.enabled) {
    throw new Error("Odoo is not configured");
  }

  return new Promise((resolve, reject) => {
    const odoo = new xmlrpc({
      url: config.url,
      db: config.db,
      username: config.username,
      password: config.password,
    });

    odoo.connect((err: Error | null) => {
      if (err) {
        console.error("[Odoo] Connection failed:", err.message);
        reject(err);
      } else {
        resolve(odoo as unknown as OdooInstance);
      }
    });
  });
}

// ── Generic create record ───────────────────────────────────────────
async function createRecord(
  model: string,
  values: Record<string, unknown>
): Promise<number | null> {
  const config = await getOdooConfig();
  if (!config.enabled) {
    console.warn("[Odoo] Not configured — skipping record creation");
    console.log("[Odoo] Would create:", { model, values });
    return null;
  }

  try {
    const odoo = await createOdooClient();
    return new Promise((resolve, reject) => {
      odoo.execute_kw(
        model,
        "create",
        [[values]],
        (err: Error | null, result: number) => {
          if (err) {
            console.error(`[Odoo] Failed to create ${model}:`, err.message);
            reject(err);
          } else {
            console.log(`[Odoo] Created ${model} id=${result}`);
            resolve(result);
          }
        }
      );
    });
  } catch (error) {
    console.error("[Odoo] Connection error:", error);
    return null;
  }
}

// ── Lead Creation (CRM) ────────────────────────────────────────────
export interface LeadData {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  companyName?: string;
  jobTitle?: string;
  country?: string;
  companySize?: string;
  industry?: string;
  currentERP?: string;
  message?: string;
  source?: string;
  pageUrl?: string;
  language?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  // TCO Calculator specific
  tcoCalculator?: boolean;
  calculatorUsers?: number;
  calculatorSaving?: number;
}

export async function createLead(data: LeadData): Promise<number | null> {
  // Build HTML description with all form details
  const rows: string[] = [];
  rows.push(`<h3>📋 Demo Request Details</h3>`);
  rows.push(`<table style="border-collapse:collapse;width:100%">`);

  const addRow = (label: string, value: string | undefined) => {
    if (value) rows.push(`<tr><td style="padding:4px 8px;font-weight:bold;vertical-align:top;width:180px">${label}</td><td style="padding:4px 8px">${value}</td></tr>`);
  };

  addRow("👤 Contact Name", data.contactName);
  addRow("📧 Email", data.email);
  addRow("📱 Phone", data.phone);
  addRow("🏢 Company", data.companyName);
  addRow("💼 Job Title", data.jobTitle);
  addRow("🌍 Country", data.country);
  addRow("📊 Company Size", data.companySize);
  addRow("🏭 Industry", data.industry);
  addRow("💻 Current ERP", data.currentERP);
  addRow("🔗 Source", data.source);
  addRow("📄 Page URL", data.pageUrl);
  addRow("🌐 Language", data.language);

  if (data.tcoCalculator) {
    addRow("🧮 TCO Calculator", "Yes");
    if (data.calculatorUsers) addRow("👥 Users", String(data.calculatorUsers));
    if (data.calculatorSaving) addRow("💰 Est. Saving", `$${data.calculatorSaving}`);
  }

  if (data.utmSource) addRow("📈 UTM Source", data.utmSource);
  if (data.utmMedium) addRow("📈 UTM Medium", data.utmMedium);
  if (data.utmCampaign) addRow("📈 UTM Campaign", data.utmCampaign);

  rows.push(`</table>`);

  if (data.message) {
    rows.push(`<br/><h4>💬 Message</h4><p>${data.message}</p>`);
  }

  const values: Record<string, unknown> = {
    name: data.name,
    contact_name: data.contactName,
    email_from: data.email,
    phone: data.phone,
    partner_name: data.companyName || "",
    function: data.jobTitle || "",
    type: "opportunity",
    user_id: 2, // Assign to admin user
    description: rows.join(""),
  };

  // Country mapping
  if (data.country) {
    const countryId = getOdooCountryId(data.country);
    if (countryId) values.country_id = countryId;
    values.team_id = getTeamByCountry(data.country);
  }

  return createRecord("crm.lead", values);
}

// ── Newsletter Subscription (Mailing List) ──────────────────────────
export async function addToMailingList(email: string): Promise<number | null> {
  return createRecord("mailing.contact", {
    email: email,
    list_ids: [[4, 1]], // Add to mailing list ID 1
  });
}

// ── Support Ticket (Helpdesk) ───────────────────────────────────────
export async function createSupportTicket(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  description: string;
}): Promise<number | null> {
  return createRecord("helpdesk.ticket", {
    name: data.subject,
    partner_email: data.email,
    partner_phone: data.phone || "",
    description: `From: ${data.name}\nEmail: ${data.email}\n\n${data.description}`,
  });
}

// ── Generic search_read ──────────────────────────────────────────────
export async function searchRecords(
  model: string,
  domain: unknown[][],
  fields: string[],
  limit = 100
): Promise<Record<string, unknown>[]> {
  const config = await getOdooConfig();
  if (!config.enabled) {
    console.warn("[Odoo] Not configured — skipping search");
    return [];
  }

  try {
    const odoo = await createOdooClient();
    return new Promise((resolve, reject) => {
      odoo.execute_kw(
        model,
        "search_read",
        [[domain, fields, 0, limit]],
        (err: Error | null, result: number) => {
          if (err) {
            console.error(`[Odoo] Failed to search ${model}:`, err.message);
            reject(err);
          } else {
            resolve(result as unknown as Record<string, unknown>[]);
          }
        }
      );
    });
  } catch (error) {
    console.error("[Odoo] Search error:", error);
    return [];
  }
}

// ── Calendar Events ─────────────────────────────────────────────────
export interface CalendarEventData {
  name: string;
  startDatetime: string; // ISO string
  duration: number; // hours
  attendeeEmail: string;
  attendeeName: string;
  description?: string;
}

export async function getCalendarEvents(
  dateFrom: string,
  dateTo: string,
  userId?: number
): Promise<Record<string, unknown>[]> {
  const domain: unknown[][] = [
    ["start", ">=", dateFrom],
    ["stop", "<=", dateTo],
  ];
  if (userId) {
    domain.push(["user_id", "=", userId]);
  }

  return searchRecords(
    "calendar.event",
    domain,
    ["id", "name", "start", "stop", "allday", "user_id"],
    200
  );
}

export async function createCalendarEvent(
  data: CalendarEventData
): Promise<number | null> {
  const startDate = new Date(data.startDatetime);
  const endDate = new Date(startDate.getTime() + data.duration * 60 * 60 * 1000);

  const startStr = startDate.toISOString().replace("T", " ").substring(0, 19);
  const stopStr = endDate.toISOString().replace("T", " ").substring(0, 19);

  const values: Record<string, unknown> = {
    name: data.name,
    start: startStr,
    stop: stopStr,
    allday: false,
    duration: data.duration,
    description: `${data.description || ""}\n\nAttendee: ${data.attendeeName} (${data.attendeeEmail})`,
    location: "Online - Link will be shared",
    user_id: 2,
    partner_ids: [[4, 3]], // Link admin partner (partner_id=3 for user_id=2)
  };

  console.log("[Odoo] Creating calendar event:", { name: data.name, start: startStr, stop: stopStr });
  const result = await createRecord("calendar.event", values);
  console.log("[Odoo] Calendar event result:", result);
  return result;
}

// ── Test Connection ─────────────────────────────────────────────────
export async function testOdooConnection(
  url: string,
  db: string,
  username: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  try {
    const odoo = new (await import("odoo-xmlrpc")).default({
      url,
      db,
      username,
      password,
    });

    return new Promise((resolve) => {
      odoo.connect((err: Error | null) => {
        if (err) {
          resolve({ success: false, message: err.message });
        } else {
          resolve({ success: true, message: "Connected successfully" });
        }
      });
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export { getOdooCountryId, getTeamByCountry };
