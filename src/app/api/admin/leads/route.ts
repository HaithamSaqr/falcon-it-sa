import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getLeads, bulkUpdateStatus } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import type { LeadFilters, LeadStatus } from "@/types/admin";

// GET /api/admin/leads — List leads with filters
export async function GET(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const params = request.nextUrl.searchParams;
  const filters: LeadFilters = {
    type: (params.get("type") as LeadFilters["type"]) || undefined,
    status: (params.get("status") as LeadFilters["status"]) || undefined,
    search: params.get("search") || undefined,
    dateFrom: params.get("dateFrom") || undefined,
    dateTo: params.get("dateTo") || undefined,
    page: Number(params.get("page")) || 1,
    limit: Number(params.get("limit")) || 20,
    sortBy: (params.get("sortBy") as LeadFilters["sortBy"]) || "createdAt",
    sortOrder: (params.get("sortOrder") as LeadFilters["sortOrder"]) || "desc",
  };

  const result = await getLeads(filters);
  return jsonSuccess(result);
}

// PATCH /api/admin/leads — Bulk update status
export async function PATCH(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body?.ids?.length || !body?.status) {
    return jsonError("ids[] and status are required", 400);
  }

  const validStatuses: LeadStatus[] = ["new", "contacted", "qualified", "converted", "lost"];
  if (!validStatuses.includes(body.status)) {
    return jsonError("Invalid status", 400);
  }

  const count = await bulkUpdateStatus(body.ids, body.status);
  return jsonSuccess({ updated: count });
}
