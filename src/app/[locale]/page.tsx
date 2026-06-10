import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/hero";
import TrustLogos from "@/components/sections/trust-logos";
import ComplianceBadges from "@/components/sections/compliance-badges";
import PainPoints from "@/components/sections/pain-points";
import FeatureShowcase from "@/components/sections/feature-showcase";
import ProductTrio from "@/components/sections/product-trio";
import CtaBanner from "@/components/sections/cta-banner";
import IndustryGrid from "@/components/sections/industry-grid";
import StatsCounter from "@/components/sections/stats-counter";
import Testimonials from "@/components/sections/testimonials";
import Faq from "@/components/sections/faq";
import Newsletter from "@/components/sections/newsletter";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <TrustLogos />
      <ComplianceBadges />
      <PainPoints />
      <FeatureShowcase />
      <ProductTrio />
      <CtaBanner />
      <IndustryGrid />
      <StatsCounter />
      <Testimonials />
      <Faq />
      <Newsletter />
    </>
  );
}
