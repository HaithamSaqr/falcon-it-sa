import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { BlockValidationError, getPageSeo, savePageSeo, type PageSeo } from "@/lib/blocks/store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { decodePageKey } from "@/lib/admin/page-keys";

// GET /api/admin/page-seo?page=<key>: the page's SEO row (blank when it has none).
export async function GET(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const page = decodePageKey(request.nextUrl.searchParams.get("page") ?? "");
  if (!page) return jsonError("page: invalid page key", 400);

  const row = await getPageSeo(page);
  const blank: PageSeo = { page, title: { en: "", ar: "" }, description: { en: "", ar: "" }, ogImage: "" };
  return jsonSuccess(row ?? blank);
}

// PUT /api/admin/page-seo  body PageSeo
export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const body = (await request.json().catch(() => null)) as PageSeo | null;
  if (!body || typeof body !== "object") return jsonError("Invalid body", 400);

  try {
    await savePageSeo({
      page: body.page,
      title: body.title,
      description: body.description,
      ogImage: body.ogImage,
    });
    return jsonSuccess({ saved: true }, "Page SEO saved");
  } catch (err) {
    if (err instanceof BlockValidationError) return jsonError(err.message, 400);
    console.error("[admin/page-seo] save failed:", err);
    return jsonError("Could not save the page SEO.", 500);
  }
}
