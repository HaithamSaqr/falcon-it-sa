import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { breadcrumbLd, buildMetadata, localizedPath } from "@/lib/seo";
import { getSector } from "@/lib/data-store";
import { getPageBlocks } from "@/lib/blocks/store";
import { pickBi } from "@/lib/blocks/bi";
import BlockRenderer from "@/components/v2/blocks";
import JsonLd from "@/components/v2/json-ld";

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
  const [blocks, nav, chrome, query] = await Promise.all([
    getPageBlocks(`sector:${slug}`),
    getTranslations({ locale: lang, namespace: "nav" }),
    getTranslations({ locale: lang, namespace: "chrome" }),
    searchParams,
  ]);
  // A sector with no page layout (enabled in admin, blocks never added) has nothing to show.
  if (blocks.length === 0) notFound();

  const role = [query.role].flat()[0];

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: nav("home"), url: localizedPath("/", lang) },
          { name: chrome("sectors"), url: localizedPath("/sectors", lang) },
          { name: pickBi(sector.name, lang), url: localizedPath(`/sectors/${slug}`, lang) },
        ])}
      />
      <BlockRenderer
        blocks={blocks}
        locale={locale}
        context={{ sector: { id: slug, name: sector.name }, roleParam: role }}
      />
    </>
  );
}
