import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getSector, getPricingBase, getSectorPricing } from "@/lib/data-store";
import SectorLandingForm from "@/components/sections/sector-landing-form";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ system?: string }>;
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

export default async function SectorPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const { system: presetSystem } = await searchParams;
  setRequestLocale(locale);

  const sector = await getSector(slug);
  if (!sector || !sector.enabled) notFound();

  const [base, allOverrides] = await Promise.all([getPricingBase(), getSectorPricing()]);
  const overrides = allOverrides.filter((o) => o.sectorId === slug);
  if (process.env.NODE_ENV === "development") {
    console.log(`[sector/${slug}] allOverrides(${allOverrides.length}):`, JSON.stringify(allOverrides));
    console.log(`[sector/${slug}] filtered overrides(${overrides.length}):`, JSON.stringify(overrides));
    console.log(`[sector/${slug}] sector.id:`, sector.id, "base.discountPercent:", base.discountPercent, "base.systemTrainingDays:", JSON.stringify(base.systemTrainingDays));
  }

  // Country detection from common proxy headers (Vercel / Cloudflare).
  const h = await headers();
  const country = (h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "").toUpperCase();
  const isEgypt = country === "EG";
  const isSaudi = country === "SA";

  // Only honor a preset system if this sector is actually linked to it.
  const validPreset =
    presetSystem && sector.systems.includes(presetSystem as (typeof sector.systems)[number])
      ? presetSystem
      : undefined;

  return (
    <SectorLandingForm
      sector={sector}
      base={base}
      overrides={overrides}
      isEgypt={isEgypt}
      isSaudi={isSaudi}
      presetSystem={validPreset}
    />
  );
}
