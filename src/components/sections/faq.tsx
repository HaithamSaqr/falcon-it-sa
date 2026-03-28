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

const FAQ_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;

export default function Faq() {
  const t = useTranslations("faq");

  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <SectionHeader title={t("heading")} />

        <div className="mx-auto max-w-3xl">
          <AccordionRoot type="single" collapsible>
            {FAQ_KEYS.map((num) => (
              <AccordionItem
                key={num}
                value={`faq-${num}`}
                className="border-b border-gray-200"
              >
                <AccordionTrigger>{t(`q${num}`)}</AccordionTrigger>
                <AccordionContent>{t(`a${num}`)}</AccordionContent>
              </AccordionItem>
            ))}
          </AccordionRoot>

          {/* Still have questions */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-lg font-medium text-text-primary">
              {t("stillHaveQuestions")}
            </p>
            <Button variant="primary" size="md" href="/contact">
              {t("contactUs")}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
