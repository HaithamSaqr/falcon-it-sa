import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import SectionHeader from "@/components/shared/section-header";
import {
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { SiteContent } from "@/types/admin";

export default function Faq({
  items,
  isAr,
}: {
  items: SiteContent["faqs"];
  isAr: boolean;
}) {
  const t = useTranslations("faq");
  if (!items.length) return null;

  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <SectionHeader title={t("heading")} />

        <div className="mx-auto max-w-3xl">
          <AccordionRoot type="single" collapsible>
            {items.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-b border-gray-200">
                <AccordionTrigger>{isAr ? faq.question.ar : faq.question.en}</AccordionTrigger>
                <AccordionContent>{isAr ? faq.answer.ar : faq.answer.en}</AccordionContent>
              </AccordionItem>
            ))}
          </AccordionRoot>

          {/* Still have questions */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-lg font-medium text-text-primary">{t("stillHaveQuestions")}</p>
            <Button variant="primary" size="md" href="/contact">
              {t("contactUs")}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
