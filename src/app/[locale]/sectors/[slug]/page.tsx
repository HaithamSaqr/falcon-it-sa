import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { getSector } from "@/lib/data-store";
import { getPageBlocks } from "@/lib/blocks/store";
import { pickBi } from "@/lib/blocks/bi";
import PageBlocks from "@/components/v2/page-blocks";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ role?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const sector = await getSector(slug);
  if (!sector || !sector.enabled) return {};
  return buildMetadata({
    page: `sector:${slug}`,
    path: `/sectors/${slug}`,
    locale,
    fallbackTitle: sector.title.en || sector.title.ar ? sector.title : sector.name,
    fallbackDescription:
      sector.description.en || sector.description.ar ? sector.description : (sector.shortPromise ?? sector.description),
  });
}

export default async function SectorPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const sector = await getSector(slug);
  if (!sector || !sector.enabled) notFound();

  const lang = locale === "ar" ? "ar" : "en";
  const [blocks, chrome, query] = await Promise.all([
    getPageBlocks(`sector:${slug}`),
    getTranslations({ locale: lang, namespace: "chrome" }),
    searchParams,
  ]);
  // A sector with no page layout (enabled in admin, blocks never added) has nothing to show.
  if (blocks.length === 0) notFound();

  const role = [query.role].flat()[0];

  return (
    <PageBlocks
      blocks={blocks}
      locale={locale}
      crumbs={[
        { name: chrome("sectors"), path: "/sectors" },
        { name: pickBi(sector.name, lang), path: `/sectors/${slug}` },
      ]}
      context={{ sector: { id: slug, name: sector.name }, roleParam: role }}
    />
  );
}
