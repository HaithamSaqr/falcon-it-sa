import { setRequestLocale } from "next-intl/server";
import FAQ from "@/components/sections/faq";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FAQ />;
}
