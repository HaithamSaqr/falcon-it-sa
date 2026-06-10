import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SECTORS, getSector } from "@/lib/sectors";
import SectorLandingForm from "@/components/sections/sector-landing-form";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SECTORS.map((sector) => ({ locale, slug: sector.slug }))
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!getSector(slug)) return {};
  const t = await getTranslations({ locale, namespace: "sectors" });
  return {
    title: `${t(`items.${slug}.name`)} — Falcon ERP`,
    description: t(`items.${slug}.desc`),
  };
}

export default async function SectorPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!getSector(slug)) notFound();

  return <SectorLandingForm slug={slug} />;
}
