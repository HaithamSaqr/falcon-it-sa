import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { getPageBlocks } from "@/lib/blocks/store";
import BlockRenderer from "@/components/v2/blocks";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  // Empty fallbacks: the home page uses the global title and description.
  return buildMetadata({
    page: "home",
    path: "/",
    locale,
    fallbackTitle: { en: "", ar: "" },
    fallbackDescription: { en: "", ar: "" },
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const blocks = await getPageBlocks("home");
  return <BlockRenderer blocks={blocks} locale={locale} />;
}
