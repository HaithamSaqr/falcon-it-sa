import { NextRequest } from "next/server";
import { jsonSuccess, jsonError, jsonRateLimited, checkRateLimit, parseBody } from "@/lib/api-helpers";
import { getPortalSession } from "@/lib/portal-auth";
import { getIntegrations } from "@/lib/data-store";
import { getHelpdeskTicketById, rateTicket } from "@/lib/odoo/client";

// POST — Rate a closed ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { allowed } = await checkRateLimit(request);
  if (!allowed) return jsonRateLimited();

  const session = await getPortalSession();
  if (!session.authenticated || !session.user) {
    return jsonError("Unauthorized", 401);
  }

  const integrations = await getIntegrations();
  if (!integrations.helpdesk.allowRating) {
    return jsonError("Rating is not enabled", 403);
  }

  const { id } = await params;
  const ticketId = Number(id);
  if (!ticketId) return jsonError("Invalid ticket ID");

  // Verify ownership and ticket is closed
  const ticket = await getHelpdeskTicketById(ticketId, session.user.partnerId);
  if (!ticket) return jsonError("Ticket not found", 404);
  if (!ticket.is_closed) return jsonError("Can only rate closed tickets");

  const { data, error } = await parseBody<{ rating: string; comment?: string }>(request);
  if (error || !data) return jsonError(error || "Invalid request");

  const validRatings = ["1", "2", "3", "4", "5"];
  if (!validRatings.includes(data.rating)) {
    return jsonError("Rating must be between 1 and 5");
  }

  const success = await rateTicket(ticketId, data.rating, data.comment);
  if (!success) {
    return jsonError("Failed to submit rating", 500);
  }

  return jsonSuccess(null, "Rating submitted");
}
