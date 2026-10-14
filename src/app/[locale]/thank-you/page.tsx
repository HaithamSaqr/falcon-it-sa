import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Section from "@/components/v2/ui/section";
import Container from "@/components/v2/ui/container";
import Button from "@/components/v2/ui/button";
import Icon from "@/components/v2/ui/icon";
import { parseThankYouType } from "@/lib/thank-you";
import { PROFILE_DOWNLOAD_NAME, PROFILE_URL, getProfileInfo } from "@/lib/company-profile";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "thankYou" });
  // A post-submit page: never indexed, never in the sitemap.
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

const DEMO_STEPS = [
  { icon: "PhoneCall", key: "stepConfirm" },
  { icon: "Monitor", key: "stepSession" },
  { icon: "FileText", key: "stepRecommendation" },
] as const;

/**
 * Where the demo and contact forms land after a successful submit
 * (`?type=demo|contact`). The lead is already stored and the Ads conversion
 * already fired on the form page; this page only confirms and points onward.
 */
export default async function ThankYouPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const type = parseThankYouType((await searchParams).type);
  const t = await getTranslations("thankYou");
  // The download button shows only while the admin has a profile uploaded.
  const hasProfile = (await getProfileInfo()) !== null;

  return (
    <Section tone="page" className="pt-14 md:pt-20 lg:pt-24" data-thank-you={type}>
      <Container className="flex flex-col items-center text-center">
        <span
          aria-hidden
          className="animate-rise inline-flex size-16 items-center justify-center rounded-full bg-sky text-brand"
        >
          <Icon name="Check" size={30} />
        </span>
        <h1 className="v2-h2 animate-rise rise-d1 mt-6 max-w-[680px]">{t(`${type}.title`)}</h1>
        <p className="v2-copy animate-rise rise-d2 mt-4 max-w-[560px] text-[17px] text-body">{t(`${type}.body`)}</p>
        {hasProfile && (
          <div className="animate-rise rise-d2 mt-8">
            <Button href={PROFILE_URL} download={PROFILE_DOWNLOAD_NAME} size="lg" data-profile-download="">
              {t("downloadProfile")}
            </Button>
          </div>
        )}

        {type === "demo" && (
          <div className="animate-rise rise-d3 mt-12 w-full max-w-[880px] text-start">
            <h2 className="v2-title text-center text-lg font-bold">{t("nextTitle")}</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {DEMO_STEPS.map((s, i) => (
                <li key={s.key} className="rounded-[22px] bg-surface p-5 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.07)]">
                  <span className="flex items-center gap-2.5 text-brand">
                    <Icon name={s.icon} size={20} />
                    <span className="text-xs font-bold tracking-wide text-muted">{i + 1}</span>
                  </span>
                  <span className="v2-title mt-3 block text-[17px] font-bold leading-snug">{t(`${s.key}.title`)}</span>
                  <span className="v2-copy mt-1 block text-[15px] text-body">{t(`${s.key}.line`)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="animate-rise rise-d3 mt-10 flex flex-wrap items-center justify-center gap-3">
          {type === "contact" && <Button href="/demo">{t("bookDemo")}</Button>}
          <Button href="/erp/odoo" variant="ghost">
            {t("seeOdoo")}
          </Button>
          <Button href="/erp/falcon" variant="ghost">
            {t("seeFalcon")}
          </Button>
          <Button href="/" variant="ghost">
            {t("home")}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
