import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { getPageBlocks } from "@/lib/blocks/store";
import { seedHero } from "@/lib/blocks/seed";
import PageBlocks from "@/components/v2/page-blocks";

type Props = { params: Promise<{ locale: string; system: string }> };

/** The two ERP systems with a page. `crumb` is the `chrome` message key for the breadcrumb name. */
const SYSTEMS = {
  falcon: { crumb: "falconErp", title: { en: "Falcon ERP", ar: "فالكون ERP" } },
  odoo: { crumb: "odoo", title: { en: "Odoo services", ar: "خدمات أودو" } },
} as const;

type SystemSlug = keyof typeof SYSTEMS;

function systemOf(slug: string): SystemSlug | null {
  return Object.hasOwn(SYSTEMS, slug) ? (slug as SystemSlug) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, system } = await params;
  const slug = systemOf(system);
  if (!slug) return {};
  return buildMetadata({
    page: `erp:${slug}`,
    path: `/erp/${slug}`,
    locale,
    fallbackTitle: SYSTEMS[slug].title,
    fallbackDescription: seedHero(`erp:${slug}`)?.subtitle ?? { en: "", ar: "" },
  });
}

export default async function ErpPage({ params }: Props) {
  const { locale, system } = await params;
  const slug = systemOf(system);
  if (!slug) notFound();
  setRequestLocale(locale);

  const lang = locale === "ar" ? "ar" : "en";
  const [blocks, chrome] = await Promise.all([
    getPageBlocks(`erp:${slug}`),
    getTranslations({ locale: lang, namespace: "chrome" }),
  ]);
  // A page the admin emptied has nothing to show.
  if (blocks.length === 0) notFound();

  return (
    <PageBlocks
      blocks={blocks}
      locale={locale}
      crumbs={[{ name: chrome(SYSTEMS[slug].crumb), path: `/erp/${slug}` }]}
    />
  );
}
