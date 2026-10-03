import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { getSectors } from "@/lib/data-store";
import { sectorsIndexBlocks } from "@/lib/blocks/sectors-index";
import BlockRenderer from "@/components/v2/blocks";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    page: "sectors",
    path: "/sectors",
    locale,
    fallbackTitle: { en: "Sectors we serve", ar: "القطاعات التي نخدمها" },
    fallbackDescription: {
      en: "Pick your sector to see the problems we solve and how Falcon sets up the ERP for it.",
      ar: "اختر قطاعك لترى المشكلات التي نحلّها، وكيف يضبط فالكون النظام له.",
    },
  });
}

export default async function SectorsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sectors = await getSectors(true);
  return <BlockRenderer blocks={sectorsIndexBlocks(sectors)} locale={locale} />;
}
