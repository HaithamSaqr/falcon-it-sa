import { useTranslations } from "next-intl";
import Button from "@/components/ui/button";
import Container from "@/components/ui/container";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-screen bg-dark overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-lighter/60 to-dark pointer-events-none" />
      <div className="absolute top-0 end-0 w-1/2 h-full bg-gradient-to-s from-primary-500/5 to-transparent pointer-events-none" />

      <Container className="relative z-10 flex min-h-screen items-center">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text block */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
            <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-primary-500">
              {t("label")}
            </span>

            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              {t("headline")}
            </h1>

            <p className="mt-6 max-w-xl text-lg text-text-on-dark/70">
              {t("subtitle")}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Button variant="cta" size="lg" href="/contact">
                {t("ctaPrimary")}
              </Button>
              <Button variant="dark-outline" size="lg" href="/demo">
                {t("ctaSecondary")}
              </Button>
            </div>

            {/* Trust micro-copy */}
            <div className="mt-6 flex flex-col gap-2 text-sm text-text-on-dark/60 sm:flex-row sm:gap-6">
              <span className="flex items-center justify-center gap-1.5 lg:justify-start">
                <svg className="h-4 w-4 text-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t("trustNoCreditCard")}
              </span>
              <span className="flex items-center justify-center gap-1.5 lg:justify-start">
                <svg className="h-4 w-4 text-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t("trustMoneyBack")}
              </span>
            </div>
          </div>

          {/* Product visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[560px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/screens/falcon-desktop-hero.png"
                alt="Falcon ERP Platform"
                width={560}
                height={350}
                className="h-auto w-full rounded-2xl shadow-2xl shadow-primary-500/20 ring-1 ring-white/10"
              />
              {/* Decorative glow */}
              <div className="absolute -top-12 -end-12 h-48 w-48 rounded-full bg-primary-500/20 blur-3xl" />
              <div className="absolute -bottom-8 -start-8 h-36 w-36 rounded-full bg-cyan-400/15 blur-2xl" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
