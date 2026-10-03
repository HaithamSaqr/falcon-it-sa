import { getPublicSettings } from "@/lib/public-settings";
import { jsonSuccess } from "@/lib/api-helpers";

// GET /api/settings/public — public endpoint for site settings (no secrets).
// Same data the locale layout renders server-side (Egypt office hidden).
export async function GET() {
  const res = jsonSuccess(await getPublicSettings());

  // Cache for 60s on CDN, revalidate in background
  res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res;
}
