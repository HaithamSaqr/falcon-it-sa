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
  const faqs = content.faqs.filter((item) =>
    !/free trial|تجربة مجانية|التجربة المجانية/i.test(`${item.question.en} ${item.question.ar}`),
  );
  return <FAQ items={faqs} isAr={locale === "ar"} />;
}
