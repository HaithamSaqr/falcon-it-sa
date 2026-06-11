import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getClients, updateClients } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import type { Client } from "@/types/admin";

export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  return jsonSuccess(await getClients());
}

export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const body = (await request.json().catch(() => null)) as Client[] | null;
  if (!Array.isArray(body)) return jsonError("Invalid body", 400);
  await updateClients(body);
  return jsonSuccess({ saved: true }, "Clients updated");
}
