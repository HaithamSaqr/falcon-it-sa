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
    // Odoo API keys are used in place of the password during XML-RPC auth.
    if (integrations.odoo.enabled && integrations.odoo.url && integrations.odoo.apiKey) {
      return {
        url: integrations.odoo.url,
        db: integrations.odoo.db,
        username: integrations.odoo.username,
        password: integrations.odoo.apiKey,
        enabled: true,
      };
    }
  } catch {
    // Fall back to env if integrations store fails
  }

  const url = process.env.ODOO_URL || "";
  const db = process.env.ODOO_DB || "";
  const username = process.env.ODOO_USERNAME || "";
  const password = process.env.ODOO_API_KEY || process.env.ODOO_PASSWORD || "";

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

// ── Portal Authentication ────────────────────────────────────────────
export async function authenticatePortalUser(
  email: string,
  password: string
): Promise<{ uid: number; name: string; partnerId: number } | null> {
  const config = await getOdooConfig();
  if (!config.enabled) return null;

  try {
    // Authenticate using the customer's own credentials
    const odoo = new (await import("odoo-xmlrpc")).default({
      url: config.url,
      db: config.db,
      username: email,
      password: password,
    });

    // Step 1: Authenticate with user's credentials to verify they're valid
    // Note: odoo-xmlrpc passes uid as 2nd callback arg, NOT as odoo.uid property
    const uid: number | null = await new Promise((resolve) => {
      odoo.connect(((err: Error | null, uidValue?: number) => {
        if (err) {
          console.error("[Odoo Portal] Auth failed:", err.message);
          resolve(null);
        } else {
          resolve(uidValue || null);
        }
      }) as (err: Error | null) => void);
    });

    if (!uid) return null;

    // Step 2: Use admin connection to look up user's name and partner_id
    // (portal users can't read res.users)
    try {
      const adminOdoo = await createOdooClient();
      const userInfo: { name: string; partnerId: number } = await new Promise((resolve, reject) => {
        adminOdoo.execute_kw(
          "res.users",
          "search_read",
          [[
            [["id", "=", uid]],
            ["name", "partner_id"],
            0,
            1,
          ]],
          (readErr: Error | null, result: unknown) => {
            if (readErr || !Array.isArray(result) || result.length === 0) {
              console.warn("[Odoo Portal] Could not read user info, using fallback");
              resolve({ name: email, partnerId: uid });
            } else {
              const user = result[0] as { name: string; partner_id: [number, string] };
              console.log("[Odoo Portal] User info:", { uid, name: user.name, partnerId: user.partner_id?.[0] });
              resolve({
                name: user.name,
                partnerId: user.partner_id?.[0] || uid,
              });
            }
          }
        );
      });

      return { uid, ...userInfo };
    } catch {
      // If admin lookup fails, fall back to uid
      console.warn("[Odoo Portal] Admin lookup failed, using uid as partnerId");
      return { uid, name: email, partnerId: uid };
    }
  } catch (error) {
    console.error("[Odoo Portal] Auth error:", error);
    return null;
  }
}

// ── Helpdesk Tickets (portal) ────────────────────────────────────────
export async function getHelpdeskTickets(
  partnerId: number,
  options?: { limit?: number; offset?: number; closed?: boolean }
): Promise<Record<string, unknown>[]> {
  const domain: unknown[][] = [
    ["partner_id", "=", partnerId],
  ];
  if (options?.closed === false) {
    domain.push(["is_closed", "=", false]);
  } else if (options?.closed === true) {
    domain.push(["is_closed", "=", true]);
  }

  const config = await getOdooConfig();
  if (!config.enabled) return [];

  try {
    const odoo = await createOdooClient();
    return new Promise((resolve, reject) => {
      odoo.execute_kw(
        "helpdesk.ticket",
        "search_read",
        [[
          domain,
          [
            "ticket_number", "name", "description", "stage_id", "priority",
            "category_id", "team_id", "user_id", "create_date", "date_close",
            "sla_deadline", "sla_status", "rating", "rating_comment", "is_closed",
            "message_ids",
          ],
          options?.offset || 0,
          options?.limit || 50,
          "create_date desc",
        ]],
        (err: Error | null, result: unknown) => {
          if (err) {
            console.error("[Odoo] Failed to fetch helpdesk tickets:", err.message);
            reject(err);
          } else {
            resolve(result as Record<string, unknown>[]);
          }
        }
      );
    });
  } catch (error) {
    console.error("[Odoo] Helpdesk tickets error:", error);
    return [];
  }
}

export async function getHelpdeskTicketById(
  ticketId: number,
  partnerId: number
): Promise<Record<string, unknown> | null> {
  const config = await getOdooConfig();
  if (!config.enabled) return null;

  try {
    const odoo = await createOdooClient();
    const tickets: Record<string, unknown>[] = await new Promise((resolve, reject) => {
      odoo.execute_kw(
        "helpdesk.ticket",
        "search_read",
        [[
          [["id", "=", ticketId], ["partner_id", "=", partnerId]],
          [
            "ticket_number", "name", "description", "stage_id", "priority",
            "category_id", "team_id", "user_id", "create_date", "date_close",
            "sla_deadline", "sla_status", "rating", "rating_comment", "is_closed",
            "message_ids",
          ],
          0,
          1,
        ]],
        (err: Error | null, result: unknown) => {
          if (err) reject(err);
          else resolve(result as Record<string, unknown>[]);
        }
      );
    });
    return tickets.length > 0 ? tickets[0] : null;
  } catch (error) {
    console.error("[Odoo] Helpdesk ticket detail error:", error);
    return null;
  }
}

export async function getTicketMessages(
  ticketId: number
): Promise<Record<string, unknown>[]> {
  const config = await getOdooConfig();
  if (!config.enabled) return [];

  try {
    const odoo = await createOdooClient();
    return new Promise((resolve, reject) => {
      odoo.execute_kw(
        "mail.message",
        "search_read",
        [[
          [["res_id", "=", ticketId], ["model", "=", "helpdesk.ticket"], ["message_type", "in", ["comment", "notification"]]],
          ["body", "author_id", "date", "message_type", "subtype_id"],
          0,
          100,
          "date asc",
        ]],
        (err: Error | null, result: unknown) => {
          if (err) reject(err);
          else resolve(result as Record<string, unknown>[]);
        }
      );
    });
  } catch (error) {
    console.error("[Odoo] Ticket messages error:", error);
    return [];
  }
}

export async function createHelpdeskTicket(data: {
  partnerId: number;
  name: string;
  description: string;
  categoryId?: number;
  teamId?: number;
  priority?: string;
}): Promise<number | null> {
  const values: Record<string, unknown> = {
    name: data.name,
    description: data.description,
    partner_id: data.partnerId,
    priority: data.priority || "1",
  };
  if (data.categoryId) values.category_id = data.categoryId;
  if (data.teamId) values.team_id = data.teamId;

  return createRecord("helpdesk.ticket", values);
}

export async function addTicketMessage(
  ticketId: number,
  body: string,
  authorId: number
): Promise<number | null> {
  const config = await getOdooConfig();
  if (!config.enabled) return null;

  try {
    const odoo = await createOdooClient();
    return new Promise((resolve, reject) => {
      odoo.execute_kw(
        "helpdesk.ticket",
        "message_post",
        [[ticketId], {
          body,
          message_type: "comment",
          subtype_xmlid: "mail.mt_comment",
          author_id: authorId,
        }],
        (err: Error | null, result: number) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  } catch (error) {
    console.error("[Odoo] Add ticket message error:", error);
    return null;
  }
}

export async function rateTicket(
  ticketId: number,
  rating: string,
  comment?: string
): Promise<boolean> {
  const config = await getOdooConfig();
  if (!config.enabled) return false;

  try {
    const odoo = await createOdooClient();
    return new Promise((resolve, reject) => {
      odoo.execute_kw(
        "helpdesk.ticket",
        "write",
        [[[ticketId], { rating, rating_comment: comment || "" }]],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
  } catch (error) {
    console.error("[Odoo] Rate ticket error:", error);
    return false;
  }
}

export async function getHelpdeskCategories(): Promise<Record<string, unknown>[]> {
  return searchRecords(
    "helpdesk.category",
    [],
    ["id", "name"],
    100
  );
}

export async function getHelpdeskTicketCount(
  partnerId: number
): Promise<{ open: number; closed: number; total: number }> {
  const config = await getOdooConfig();
  if (!config.enabled) return { open: 0, closed: 0, total: 0 };

  try {
    const odoo = await createOdooClient();

    const searchCount = (domain: unknown[][]): Promise<number> =>
      new Promise((resolve, reject) => {
        odoo.execute_kw(
          "helpdesk.ticket",
          "search_count",
          [[domain]],
          (err: Error | null, result: number) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

    const [open, closed] = await Promise.all([
      searchCount([["partner_id", "=", partnerId], ["is_closed", "=", false]]),
      searchCount([["partner_id", "=", partnerId], ["is_closed", "=", true]]),
    ]);

    return { open, closed, total: open + closed };
  } catch (error) {
    console.error("[Odoo] Ticket count error:", error);
    return { open: 0, closed: 0, total: 0 };
  }
}

export { getOdooCountryId, getTeamByCountry };
