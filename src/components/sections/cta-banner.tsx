import { useTranslations } from "next-intl";
import Button from "@/components/ui/button";
import Container from "@/components/ui/container";

export default function CtaBanner() {
  const t = useTranslations("ctaBanner");

  return (
    <section className="bg-dark py-20 lg:py-28">
      <Container>
        <div className="text-center">
          <h2 className="text-white">{t("headline")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-on-dark/70">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="cta" size="lg" href="/contact">
              {t("ctaPrimary")}
            </Button>
            <Button variant="dark-outline" size="lg" href="/demo">
              {t("ctaSecondary")}
            </Button>
          </div>

          {/* Trust micro-copy */}
          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-text-on-dark/60 sm:flex-row sm:justify-center sm:gap-6">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {t("trustNoCreditCard")}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {t("trustMoneyBack")}
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
