import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { getPortalSession } from "@/lib/portal-auth";
import { getHelpdeskTicketById } from "@/lib/odoo/client";

// GET — Get single ticket detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getPortalSession();
  if (!session.authenticated || !session.user) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await params;
  const ticketId = Number(id);
  if (!ticketId) return jsonError("Invalid ticket ID");

  const ticket = await getHelpdeskTicketById(ticketId, session.user.partnerId);
  if (!ticket) {
    return jsonError("Ticket not found", 404);
  }

  const mapped = {
    id: ticket.id,
    ticketNumber: ticket.ticket_number || "",
    name: ticket.name || "",
    description: ticket.description || "",
    stage: Array.isArray(ticket.stage_id) ? (ticket.stage_id as [number, string])[1] : "",
    stageClosed: Boolean(ticket.is_closed),
    priority: String(ticket.priority || "1"),
    categoryName: Array.isArray(ticket.category_id) ? (ticket.category_id as [number, string])[1] : "",
    teamName: Array.isArray(ticket.team_id) ? (ticket.team_id as [number, string])[1] : "",
    assignedTo: Array.isArray(ticket.user_id) ? (ticket.user_id as [number, string])[1] : "",
    createdAt: ticket.create_date || "",
    closedAt: ticket.date_close || null,
    slaDeadline: ticket.sla_deadline || null,
    slaStatus: ticket.sla_status || "",
    rating: String(ticket.rating || "0"),
    ratingComment: ticket.rating_comment || "",
  };

  return jsonSuccess(mapped);
}
