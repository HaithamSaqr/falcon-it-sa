import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { getSector } from "@/lib/data-store";
import { getPageBlocks } from "@/lib/blocks/store";
import { pickBi } from "@/lib/blocks/bi";
import PageBlocks from "@/components/v2/page-blocks";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Sector ids are lowercase kebab-case, but the pre-v2 database held mixed-case
 * rows (`Retail`) whose URLs are indexed. Those rows are disabled and the
 * lowercase v2 row took over, so send a mixed-case slug to its lowercase twin
 * when that is a live sector page. Done here, not in next.config redirects,
 * because config redirects match case-insensitively and a `Retail -> retail`
 * rule would loop. Unknown mixed-case slugs fall through to the 404 checks.
 */
async function redirectToLowercaseSlug(
  locale: string,
  slug: string,
  searchParams: Props["searchParams"],
): Promise<void> {
  const lower = slug.toLowerCase();
  if (lower === slug) return;
  const sector = await getSector(lower);
  if (!sector || !sector.enabled) return;
  if ((await getPageBlocks(`sector:${lower}`)).length === 0) return;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const v of [value].flat()) if (v !== undefined) qs.append(key, v);
  }
  const query = qs.size > 0 ? `?${qs}` : "";
  permanentRedirect(`${locale === "ar" ? "/ar" : ""}/sectors/${encodeURIComponent(lower)}${query}`);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  await redirectToLowercaseSlug(locale, slug, searchParams);
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
  await redirectToLowercaseSlug(locale, slug, searchParams);

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
