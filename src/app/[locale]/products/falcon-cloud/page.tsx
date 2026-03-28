import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import SectionHeader from "@/components/shared/section-header";

type Props = {
  params: Promise<{ locale: string }>;
};

const FEATURES = [
  { icon: "\uD83D\uDCF1", key: "f1" },
  { icon: "\uD83D\uDD04", key: "f2" },
  { icon: "\u2B06\uFE0F", key: "f3" },
  { icon: "\uD83C\uDFE2", key: "f4" },
  { icon: "\uD83D\uDD12", key: "f5" },
  { icon: "\u2705", key: "f6" },
] as const;

const PAIN_POINTS = [
  { icon: "\uD83D\uDDA5\uFE0F", key: "problem1" },
  { icon: "\uD83D\uDD0D", key: "problem2" },
  { icon: "\uD83D\uDCB8", key: "problem3" },
] as const;

const INDUSTRIES = [
  { key: "industry1", icon: "\uD83C\uDFEA" },
  { key: "industry2", icon: "\uD83C\uDFE0" },
  { key: "industry3", icon: "\uD83D\uDE80" },
  { key: "industry4", icon: "\uD83D\uDCC8" },
  { key: "industry5", icon: "\uD83C\uDF54" },
  { key: "industry6", icon: "\uD83D\uDED2" },
] as const;

const TRUST_BADGES = ["trustBadge1", "trustBadge2", "trustBadge3", "trustBadge4"] as const;

export default async function FalconCloudPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FalconCloudContent />;
}

function FalconCloudContent() {
  const t = useTranslations("products");
  const tp = useTranslations("cloudPage");
  const tc = useTranslations("common");

  return (
    <>
      {/* Section 1: Hero */}
      <section className="bg-dark py-20 lg:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="mb-4 inline-block rounded-full bg-primary-500/10 px-4 py-1.5 text-sm font-semibold text-primary-500">
                {tp("badge")}
              </span>
              <h1 className="mb-6 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
                {tp("heroTitle")}
              </h1>
              <p className="mb-4 text-xl text-gray-300">
                {tp("heroSubtitle")}
              </p>
              <p className="mb-8 text-2xl font-bold text-primary-500">
                {t("cloudErp.price")}
              </p>
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <Button variant="cta" size="lg" href="/demo">
                  {tp("heroCtaPrimary")}
                </Button>
                <Button variant="dark-outline" size="lg" href="/demo">
                  {tp("heroCtaSecondary")}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="text-cta">&#10003;</span> {tp("heroTrust1")}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-cta">&#10003;</span> {tp("heroTrust2")}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-cta">&#10003;</span> {tp("heroTrust3")}
                </span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-900/40 p-8">
                <span className="text-lg font-medium text-primary-500/80">
                  {tp("screenshotAlt")}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Section 2: Problem / Pain Agitation */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow={tp("problemEyebrow")}
            title={tp("problemTitle")}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PAIN_POINTS.map((pain) => (
              <Card key={pain.key} className="text-start">
                <span className="mb-4 inline-block text-3xl">{pain.icon}</span>
                <h3 className="mb-2 text-lg font-bold text-text-primary">
                  {tp(`${pain.key}Title`)}
                </h3>
                <p className="text-sm text-text-secondary">
                  {tp(`${pain.key}Desc`)}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="primary" size="md" href="#how-it-works">
              {tp("problemCtaText")}
            </Button>
          </div>
        </Container>
      </section>

      {/* Section 3: Key Benefits (6 cards) */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow={tp("featuresEyebrow")}
            title={tp("featuresTitle")}
            subtitle={tp("featuresSubtitle")}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.key} className="text-start">
                <span className="mb-4 inline-block text-3xl">{feature.icon}</span>
                <h3 className="mb-2 text-lg font-bold text-text-primary">
                  {tp(`${feature.key}Title`)}
                </h3>
                <p className="text-sm text-text-secondary">
                  {tp(`${feature.key}Desc`)}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="primary" size="md" href="/demo">
              {tp("featuresCtaText")}
            </Button>
          </div>
        </Container>
      </section>

      {/* Section 4: How It Works (3 steps) */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow={tp("howItWorksEyebrow")}
            title={tp("howItWorksTitle")}
            subtitle={tp("howItWorksSubtitle")}
          />
          <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-3">
            {(["step1", "step2", "step3"] as const).map((step) => (
              <div key={step} className="text-center">
                <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10 text-2xl font-extrabold text-primary-500">
                  {tp(`${step}Number`)}
                </span>
                <h3 className="mb-3 text-xl font-bold text-text-primary">
                  {tp(`${step}Title`)}
                </h3>
                <p className="text-sm text-text-secondary">
                  {tp(`${step}Desc`)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="cta" size="lg" href="/demo">
              {tp("howItWorksCtaText")}
            </Button>
          </div>
        </Container>
      </section>

      {/* Section 5: Mid-page CTA Banner */}
      <section className="bg-primary-900 py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
              {tp("midCtaTitle")}
            </h2>
            <p className="mb-8 text-lg text-gray-300">
              {tp("midCtaSubtitle")}
            </p>
            <Button variant="cta" size="lg" href="/demo">
              {tp("midCtaButton")}
            </Button>
          </div>
        </Container>
      </section>

      {/* Section 6: Who It's For */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow={tp("whoItsForEyebrow")}
            title={tp("whoItsForTitle")}
          />
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.key}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="text-2xl">{ind.icon}</span>
                <span className="font-semibold text-text-primary">
                  {tp(ind.key)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" size="md" href="/contact">
              {tp("whoItsForCtaText")}
            </Button>
          </div>
        </Container>
      </section>

      {/* Section 7: Testimonial */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-primary-500">
              {tp("testimonialEyebrow")}
            </span>
            <blockquote className="mb-8 text-xl font-medium leading-relaxed text-text-primary sm:text-2xl">
              &ldquo;{tp("testimonialQuote")}&rdquo;
            </blockquote>
            <div className="mb-4 mx-auto h-16 w-16 rounded-full bg-primary-500/10" />
            <p className="text-lg font-bold text-text-primary">
              {tp("testimonialName")}
            </p>
            <p className="text-sm text-text-secondary">
              {tp("testimonialRole")} — {tp("testimonialCompany")}
            </p>
          </div>
        </Container>
      </section>

      {/* Section 8: Final CTA + Lead Form */}
      <section className="bg-dark py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
              {tp("finalCtaTitle")}
            </h2>
            <p className="mb-10 text-lg text-gray-300">
              {tp("finalCtaSubtitle")}
            </p>
            <form className="mx-auto grid max-w-lg gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder={tp("formName")}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none sm:col-span-1"
              />
              <input
                type="email"
                placeholder={tp("formEmail")}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none sm:col-span-1"
              />
              <input
                type="tel"
                placeholder={tp("formPhone")}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none sm:col-span-1"
              />
              <input
                type="text"
                placeholder={tp("formCompany")}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none sm:col-span-1"
              />
              <div className="sm:col-span-2">
                <Button variant="cta" size="lg" className="w-full">
                  {tp("formSubmit")}
                </Button>
              </div>
            </form>
            <p className="mt-4 text-sm text-gray-400">
              {tp("formDisclaimer")}
            </p>
            <p className="mt-6 text-sm text-gray-400">
              {tc("orCallUs")}: <span className="font-semibold text-white" dir="ltr">+966 50 123 4567</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              {TRUST_BADGES.map((badge) => (
                <span key={badge} className="flex items-center gap-2">
                  <span className="text-cta">&#10003;</span> {tp(badge)}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
