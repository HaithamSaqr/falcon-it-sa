import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSeo, updateSeo } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import type { SeoSettings } from "@/types/admin";

export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  return jsonSuccess(await getSeo());
}

export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const body = (await request.json().catch(() => null)) as SeoSettings | null;
  if (!body) return jsonError("Invalid body", 400);
  await updateSeo(body);
  return jsonSuccess({ saved: true }, "SEO settings updated");
}
