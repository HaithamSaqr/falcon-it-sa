import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getFooterLinks, updateFooterLinks } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import type { FooterLink } from "@/types/admin";

export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  return jsonSuccess(await getFooterLinks());
}

export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const body = (await request.json().catch(() => null)) as FooterLink[] | null;
  if (!Array.isArray(body)) return jsonError("Invalid body", 400);
  await updateFooterLinks(body);
  return jsonSuccess({ saved: true }, "Footer links updated");
}
