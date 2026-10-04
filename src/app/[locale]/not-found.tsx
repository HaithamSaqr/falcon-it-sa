import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { pickBi } from "@/lib/blocks/bi";
import { getPublicSettings } from "@/lib/public-settings";
import Section from "@/components/v2/ui/section";
import Container from "@/components/v2/ui/container";
import Button from "@/components/v2/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");
  // Next adds <meta name="robots" content="noindex"> to every 404 itself.
  return { title: t("metaTitle") };
}

/**
 * Localized 404 inside the v2 chrome (navbar, footer, mobile bar from the
 * locale layout): Arabic under /ar, English otherwise. Shown for notFound()
 * in any locale page and for unknown paths ([...rest]/page.tsx). Paths outside
 * the locale routes keep the root app/not-found.tsx.
 */
export default async function LocaleNotFound() {
  const locale = await getLocale();
  const lang = locale === "ar" ? "ar" : "en";
  const t = await getTranslations("notFound");
  const settings = await getPublicSettings();
  const cta = pickBi(settings.primaryCta.label, lang);

  return (
    <Section tone="page" className="pt-14 md:pt-20 lg:pt-24">
      <Container className="flex flex-col items-center text-center">
        <p aria-hidden className="animate-rise text-[72px] font-extrabold leading-none tracking-[-0.035em] text-muted lg:text-[96px]">
          404
        </p>
        <h1 className="v2-h2 animate-rise rise-d1 mt-5 max-w-[640px]">{t("title")}</h1>
        <p className="v2-copy animate-rise rise-d2 mt-4 max-w-[520px] text-[17px] text-body">{t("body")}</p>
        <div className="animate-rise rise-d3 mt-9 flex flex-wrap items-center justify-center gap-3">
          {cta && <Button href={settings.primaryCta.demoUrl}>{cta}</Button>}
          <Button href="/" variant="ghost">
            {t("home")}
          </Button>
          <Button href="/sectors" variant="ghost">
            {t("sectors")}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
