import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { getProduct } from "@/lib/data-store";
import { getPageBlocks } from "@/lib/blocks/store";
import { seedHero } from "@/lib/blocks/seed";
import { pickBi } from "@/lib/blocks/bi";
import { ERP_PRODUCT_SLUGS } from "@/lib/public-chrome";
import PageBlocks from "@/components/v2/page-blocks";

type Props = { params: Promise<{ locale: string; slug: string }> };

/** An enabled supporting product (the ERP products live under /erp), or null. */
async function supportingProduct(slug: string) {
  if (ERP_PRODUCT_SLUGS.has(slug)) return null;
  const product = await getProduct(slug);
  return product && product.enabled ? product : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await supportingProduct(slug);
  if (!product) return {};
  return buildMetadata({
    page: `product:${slug}`,
    path: `/products/${slug}`,
    locale,
    fallbackTitle: product.name,
    fallbackDescription: seedHero(`product:${slug}`)?.subtitle ?? product.description,
  });
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await supportingProduct(slug);
  if (!product) notFound();

  const lang = locale === "ar" ? "ar" : "en";
  const [blocks, nav] = await Promise.all([
    getPageBlocks(`product:${slug}`),
    getTranslations({ locale: lang, namespace: "nav" }),
  ]);
  // A product with no page layout (enabled in admin, blocks never added) has nothing to show.
  if (blocks.length === 0) notFound();

  return (
    <PageBlocks
      blocks={blocks}
      locale={locale}
      crumbs={[
        { name: nav("products"), path: "/products" },
        { name: pickBi(product.name, lang), path: `/products/${slug}` },
      ]}
    />
  );
}
