import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getClientTags, updateClientTags } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import type { ClientTag } from "@/types/admin";

export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  return jsonSuccess(await getClientTags());
}

export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const body = (await request.json().catch(() => null)) as ClientTag[] | null;
  if (!Array.isArray(body)) return jsonError("Invalid body", 400);
  await updateClientTags(body);
  return jsonSuccess({ saved: true }, "Client tags updated");
}
