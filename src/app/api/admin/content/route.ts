import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getContent, updateContent } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// GET /api/admin/content
export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const content = await getContent();
  return jsonSuccess(content);
}

// PUT /api/admin/content
export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid body", 400);

  await updateContent(body);
  return jsonSuccess({ saved: true }, "Content updated successfully");
}
