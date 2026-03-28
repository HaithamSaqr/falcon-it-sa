import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getLeadById, updateLead, deleteLead } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// GET /api/admin/leads/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) return jsonError("Lead not found", 404);

  return jsonSuccess(lead);
}

// PATCH /api/admin/leads/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body", 400);

  const updated = await updateLead(id, {
    status: body.status,
    notes: body.notes,
  });

  if (!updated) return jsonError("Lead not found", 404);
  return jsonSuccess(updated);
}

// DELETE /api/admin/leads/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const deleted = await deleteLead(id);
  if (!deleted) return jsonError("Lead not found", 404);

  return jsonSuccess({ deleted: true });
}
