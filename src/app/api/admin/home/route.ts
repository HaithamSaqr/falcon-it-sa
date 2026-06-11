import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getHome, updateHome } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// GET /api/admin/home
export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const home = await getHome();
  return jsonSuccess(home);
}

// PUT /api/admin/home
export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body", 400);

  await updateHome(body);
  return jsonSuccess({ saved: true }, "Home page updated successfully");
}
