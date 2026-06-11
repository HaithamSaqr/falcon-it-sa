import { setRequestLocale } from "next-intl/server";
import { getContent } from "@/lib/data-store";
import FAQ from "@/components/sections/faq";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = await getContent();
  return <FAQ items={content.faqs} isAr={locale === "ar"} />;
}
