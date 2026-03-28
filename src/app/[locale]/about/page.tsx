import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import SectionHeader from "@/components/shared/section-header";

type Props = {
  params: Promise<{ locale: string }>;
};

const STAT_KEYS = ["clients", "experience", "users", "industries"] as const;
const VALUE_KEYS = ["menaNative", "affordable", "compliant", "dataSovereign"] as const;
const VALUE_ICONS = ["🌍", "💰", "📋", "🏛️"] as const;

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations("about");
  const tc = useTranslations("common");

  return (
    <>
      {/* Hero */}
      <section className="bg-dark py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              {t("heading")}
            </h1>
            <p className="text-xl text-gray-300">{t("subtitle")}</p>
          </div>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="text-start">
              <span className="mb-4 inline-block text-3xl">🎯</span>
              <h2 className="mb-3 text-2xl font-bold text-text-primary">
                {t("mission")}
              </h2>
              <p className="text-text-secondary">{t("missionText")}</p>
            </Card>
            <Card className="text-start">
              <span className="mb-4 inline-block text-3xl">🔭</span>
              <h2 className="mb-3 text-2xl font-bold text-text-primary">
                {t("vision")}
              </h2>
              <p className="text-text-secondary">{t("visionText")}</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="bg-primary-900 py-16">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STAT_KEYS.map((key) => (
              <div key={key} className="text-center">
                <p className="text-4xl font-extrabold text-primary-500 sm:text-5xl">
                  {t(`stats.${key}.value`)}
                </p>
                <p className="mt-2 text-sm font-medium text-gray-300">
                  {t(`stats.${key}.label`)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why Falcon */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow={t("whyFalcon.eyebrow")}
            title={t("whyFalcon.title")}
            subtitle={t("whyFalcon.subtitle")}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_KEYS.map((key, i) => (
              <Card key={key} className="text-start">
                <span className="mb-4 inline-block text-3xl">
                  {VALUE_ICONS[i]}
                </span>
                <h3 className="mb-2 text-lg font-bold text-text-primary">
                  {t(`values.${key}.title`)}
                </h3>
                <p className="text-sm text-text-secondary">
                  {t(`values.${key}.description`)}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-dark py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
              {t("ctaHeading")}
            </h2>
            <p className="mb-8 text-lg text-gray-300">
              {t("ctaSubtitle")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="cta" size="lg" href="/demo">
                {tc("bookDemo")}
              </Button>
              <Button variant="dark-outline" size="lg" href="/contact">
                {tc("contactUs")}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
