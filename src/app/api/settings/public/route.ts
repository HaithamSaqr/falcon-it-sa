import { getSettings } from "@/lib/data-store";
import { jsonSuccess } from "@/lib/api-helpers";
import { NextResponse } from "next/server";

// GET /api/settings/public — public endpoint for site settings
export async function GET() {
  const settings = await getSettings();
  const res = jsonSuccess({
    gulfOnly: settings.regional?.gulfOnly ?? false,
    company: {
      name: settings.company.name,
      email: settings.company.email,
      phone: settings.regional?.gulfOnly
        ? { ksa: settings.company.phone.ksa }
        : settings.company.phone,
      whatsapp: settings.company.whatsapp,
      branches: settings.company.branches ?? [],
    },
    social: settings.social,
  });

  // Cache for 60s on CDN, revalidate in background
  res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res;
}
