import { NextRequest } from "next/server";
import { jsonSuccess, jsonError, jsonRateLimited, checkRateLimit, parseBody } from "@/lib/api-helpers";
import { getPortalSession } from "@/lib/portal-auth";
import { getIntegrations } from "@/lib/data-store";
import { getHelpdeskTickets, createHelpdeskTicket, getHelpdeskTicketCount } from "@/lib/odoo/client";

// GET — List tickets for authenticated portal user
export async function GET(request: NextRequest) {
  const session = await getPortalSession();
  if (!session.authenticated || !session.user) {
    return jsonError("Unauthorized", 401);
  }

  const integrations = await getIntegrations();
  if (!integrations.helpdesk.enabled) {
    return jsonError("Portal is not enabled", 503);
  }

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter"); // "open" | "closed" | "all"
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);
  const offset = Number(url.searchParams.get("offset")) || 0;

  const [tickets, counts] = await Promise.all([
    getHelpdeskTickets(session.user.partnerId, {
      limit,
      offset,
      closed: filter === "closed" ? true : filter === "open" ? false : undefined,
    }),
    getHelpdeskTicketCount(session.user.partnerId),
  ]);

  // Transform Odoo records to portal format
  const mapped = tickets.map((t) => ({
    id: t.id,
    ticketNumber: t.ticket_number || "",
    name: t.name || "",
    stage: Array.isArray(t.stage_id) ? (t.stage_id as [number, string])[1] : "",
    stageClosed: Boolean(t.is_closed),
    priority: String(t.priority || "1"),
    categoryName: Array.isArray(t.category_id) ? (t.category_id as [number, string])[1] : "",
    teamName: Array.isArray(t.team_id) ? (t.team_id as [number, string])[1] : "",
    assignedTo: Array.isArray(t.user_id) ? (t.user_id as [number, string])[1] : "",
    createdAt: t.create_date || "",
    closedAt: t.date_close || null,
    slaDeadline: t.sla_deadline || null,
    slaStatus: t.sla_status || "",
    rating: String(t.rating || "0"),
  }));

  return jsonSuccess({ tickets: mapped, counts });
}

// POST — Create a new ticket
export async function POST(request: NextRequest) {
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  const session = await getPortalSession();
  if (!session.authenticated || !session.user) {
    return jsonError("Unauthorized", 401);
  }

  const integrations = await getIntegrations();
  if (!integrations.helpdesk.enabled || !integrations.helpdesk.allowNewTickets) {
    return jsonError("Ticket creation is not enabled", 403);
  }

  const { data, error } = await parseBody<{
    subject: string;
    description: string;
    categoryId?: number;
    priority?: string;
  }>(request);
  if (error || !data) return jsonError(error || "Invalid request");

  if (!data.subject || data.subject.length < 3) {
    return jsonError("Subject must be at least 3 characters");
  }
  if (!data.description || data.description.length < 10) {
    return jsonError("Description must be at least 10 characters");
  }

  try {
    const ticketId = await createHelpdeskTicket({
      partnerId: session.user.partnerId,
      name: data.subject,
      description: data.description,
      categoryId: data.categoryId,
      teamId: integrations.helpdesk.defaultTeamId > 0 ? integrations.helpdesk.defaultTeamId : undefined,
      priority: data.priority,
    });

    if (!ticketId) {
      return jsonError("Failed to create ticket. The helpdesk module may not be installed on the Odoo server.", 500);
    }

    return jsonSuccess({ ticketId }, "Ticket created successfully", 201);
  } catch (err) {
    console.error("[Portal] Create ticket error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return jsonError(`Failed to create ticket: ${msg}`, 500);
  }
}
