import { getTranslations } from "next-intl/server";
import Section from "@/components/v2/ui/section";
import Container from "@/components/v2/ui/container";
import Icon from "@/components/v2/ui/icon";

/**
 * "Starts from … EGP" for visitors in Egypt (owner, 2026-10-15), under the
 * hero of the Odoo and Falcon ERP pages. Renders nothing without a price.
 */
export default async function EgyptPriceNote({
  system,
  price,
  locale,
}: {
  system: "odoo" | "falcon";
  price: string;
  locale: string;
}) {
  if (!price) return null;
  const t = await getTranslations({ locale: locale === "ar" ? "ar" : "en", namespace: "egyptPrice" });
  return (
    <Section tone="page" className="py-6 md:py-8 lg:py-8" data-egypt-price={system}>
      <Container>
        <div className="flex flex-col items-start gap-1.5 rounded-[22px] bg-surface px-6 py-5 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.07)] sm:flex-row sm:items-center sm:gap-4">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-sky text-brand">
            <Icon name="Tag" size={20} />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="v2-title text-[17px] font-bold leading-snug text-ink">{t(system, { price })}</span>
            <span className="v2-copy text-[14px] text-muted">{t("note")}</span>
          </span>
        </div>
      </Container>
    </Section>
  );
}
