import { getSettings, getFooterLinks, getProducts, getSectors } from "@/lib/data-store";
import { jsonSuccess } from "@/lib/api-helpers";
import { NextResponse } from "next/server";

// GET /api/settings/public — public endpoint for site settings
export async function GET() {
  const [settings, footerLinks, products, sectors] = await Promise.all([
    getSettings(),
    getFooterLinks(),
    getProducts(true), // enabled only
    getSectors(true), // enabled only
  ]);
  const res = jsonSuccess({
    gulfOnly: settings.regional?.gulfOnly ?? false,
    loginUrl: settings.loginUrl || "https://falcon-valley.com",
    whatsappRouting: settings.whatsappRouting ?? { domains: [], countries: [] },
    landingCta: settings.landingCta ?? { mode: "whatsapp", url: "", label: { en: "", ar: "" }, note: { en: "", ar: "" } },
    products: products.map((p) => ({ slug: p.slug, name: p.name })),
    sectors: sectors.map((s) => ({ slug: s.id, name: s.name })),
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
    footerLinks,
  });

  // Cache for 60s on CDN, revalidate in background
  res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res;
}
