import { NextRequest } from "next/server";
import { jsonSuccess, jsonError, jsonRateLimited, checkRateLimit, parseBody } from "@/lib/api-helpers";
import { getPortalSession } from "@/lib/portal-auth";
import { getHelpdeskTicketById, getTicketMessages, addTicketMessage } from "@/lib/odoo/client";

// GET — Get ticket messages
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

  // Verify ownership
  const ticket = await getHelpdeskTicketById(ticketId, session.user.partnerId);
  if (!ticket) return jsonError("Ticket not found", 404);

  const messages = await getTicketMessages(ticketId);

  const mapped = messages.map((m) => ({
    id: m.id,
    body: m.body || "",
    author: Array.isArray(m.author_id) ? (m.author_id as [number, string])[1] : "",
    date: m.date || "",
    type: m.message_type === "comment" ? "comment" : "notification",
  }));

  return jsonSuccess(mapped);
}

// POST — Add a message/reply
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

  const { id } = await params;
  const ticketId = Number(id);
  if (!ticketId) return jsonError("Invalid ticket ID");

  // Verify ownership
  const ticket = await getHelpdeskTicketById(ticketId, session.user.partnerId);
  if (!ticket) return jsonError("Ticket not found", 404);

  const { data, error } = await parseBody<{ body: string }>(request);
  if (error || !data) return jsonError(error || "Invalid request");
  if (!data.body || data.body.trim().length < 1) {
    return jsonError("Message cannot be empty");
  }

  const messageId = await addTicketMessage(
    ticketId,
    data.body,
    session.user.partnerId
  );

  if (!messageId) {
    return jsonError("Failed to send message", 500);
  }

  return jsonSuccess({ messageId }, "Message sent");
}
