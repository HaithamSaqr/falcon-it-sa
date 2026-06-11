import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getSector, getPricingBase, getSectorPricing } from "@/lib/data-store";
import SectorLandingForm from "@/components/sections/sector-landing-form";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const sector = await getSector(slug);
  if (!sector) return {};
  const isAr = locale === "ar";
  return {
    title: `${isAr ? sector.title.ar : sector.title.en} — Falcon ERP`,
    description: isAr ? sector.description.ar : sector.description.en,
  };
}

export default async function SectorPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const sector = await getSector(slug);
  if (!sector || !sector.enabled) notFound();

  const [base, allOverrides] = await Promise.all([getPricingBase(), getSectorPricing()]);
  const overrides = allOverrides.filter((o) => o.sectorId === slug);

  // Country detection from common proxy headers (Vercel / Cloudflare).
  const h = await headers();
  const country = (h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "").toUpperCase();
  const isEgypt = country === "EG";
  const isSaudi = country === "SA";

  return (
    <SectorLandingForm sector={sector} base={base} overrides={overrides} isEgypt={isEgypt} isSaudi={isSaudi} />
  );
}
