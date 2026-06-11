import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getBrochure, updateBrochure } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import type { ProductBrochure } from "@/types/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const { slug } = await params;
  const b = await getBrochure(slug);
  return jsonSuccess(
    b ?? { slug, title: { en: "", ar: "" }, content: { en: "", ar: "" }, enabled: false }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const { slug } = await params;
  const body = (await request.json().catch(() => null)) as Partial<ProductBrochure> | null;
  if (!body) return jsonError("Invalid body", 400);
  await updateBrochure({
    slug,
    title: body.title ?? { en: "", ar: "" },
    content: body.content ?? { en: "", ar: "" },
    enabled: Boolean(body.enabled),
  });
  return jsonSuccess({ saved: true }, "Brochure saved");
}
