import { setRequestLocale } from "next-intl/server";
import { getHome, getContent } from "@/lib/data-store";
import Hero from "@/components/sections/hero";
import ClientsStrip from "@/components/sections/clients-strip";
import WhyErpFails from "@/components/sections/why-erp-fails";
import ProductTrio from "@/components/sections/product-trio";
import WhyChooseFalcon from "@/components/sections/why-choose-falcon";
import CtaBanner from "@/components/sections/cta-banner";
import SectorsHome from "@/components/sections/sectors-home";
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

  const isAr = locale === "ar";
  const [home, content] = await Promise.all([getHome(), getContent()]);
  const L = (b: { en: string; ar: string }) => (isAr ? b.ar : b.en);

  return (
    <>
      <Hero data={home.hero} isAr={isAr} />
      <ClientsStrip />
      <WhyErpFails data={home.whyErpFails} isAr={isAr} />
      <ProductTrio />
      <WhyChooseFalcon data={home.whyChoose} isAr={isAr} />
      <CtaBanner data={home.cta} isAr={isAr} />
      {/* Sectors we serve — kept from the existing design */}
      <SectorsHome />
      <StatsCounter heading={L(home.stats.heading)} stats={home.stats.items} isAr={isAr} />
      <Testimonials items={content.testimonials} isAr={isAr} />
      <Faq items={content.faqs} isAr={isAr} />
      <Newsletter heading={L(home.newsletter.heading)} subtitle={L(home.newsletter.subtitle)} />
    </>
  );
}
