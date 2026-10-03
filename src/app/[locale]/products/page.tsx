import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { getProducts } from "@/lib/data-store";
import { getPageBlocks } from "@/lib/blocks/store";
import { productsIndexBlocks, type ProductService } from "@/lib/blocks/products-index";
import { supportingServices } from "@/lib/public-chrome";
import BlockRenderer from "@/components/v2/blocks";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    page: "products",
    path: "/products",
    locale,
    fallbackTitle: { en: "ERP systems and services", ar: "أنظمة ERP والخدمات" },
    fallbackDescription: {
      en: "Odoo and Falcon ERP, plus server management, data migration and custom apps from the same team.",
      ar: "أودو وفالكون ERP، إضافة إلى إدارة الخوادم وترحيل البيانات والتطبيقات المخصصة من الفريق نفسه.",
    },
  });
}

export default async function ProductsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // A supporting service is listed only when it has a page to open.
  const products = supportingServices(await getProducts(true));
  const services = (
    await Promise.all(
      products.map(async (p): Promise<ProductService | null> => {
        const blocks = await getPageBlocks(`product:${p.slug}`);
        if (blocks.length === 0) return null;
        const hero = blocks.find((b) => b.type === "hero");
        const sub = hero && hero.type === "hero" ? hero.content.subtitle : null;
        return { slug: p.slug, name: p.name, line: sub && (sub.en || sub.ar) ? sub : p.description };
      }),
    )
  ).filter((s): s is ProductService => s !== null);

  return <BlockRenderer blocks={productsIndexBlocks(services)} locale={locale} />;
}
