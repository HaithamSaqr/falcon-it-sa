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
  const book = { en: "Book an Appointment", ar: "احجز موعدًا" };
  const appointmentHome = {
    ...home,
    hero: {
      ...home.hero,
      title: { en: "ERP built for your business.", ar: "نظام ERP مصمم لعملك." },
      subtitle: { en: "Explore a solution tailored to your workflows, Arabic support, and compliance needs.", ar: "اكتشف حلًا يناسب سير عملك ويدعم العربية ومتطلبات الامتثال." },
      cta1: { label: book, url: "/demo" },
      cta2: { label: { en: "Talk to an ERP Specialist", ar: "تحدث مع متخصص في ERP" }, url: "/demo" },
      trust1: { en: "A conversation tailored to your team", ar: "محادثة تناسب احتياجات فريقك" },
      trust2: { en: "Explore your options together", ar: "استكشف الخيارات المناسبة لعملك" },
    },
    whyErpFails: {
      ...home.whyErpFails,
      label: { en: "ERP challenges", ar: "تحديات أنظمة ERP" },
      heading: { en: "Choose an ERP that fits how you work", ar: "اختر نظام ERP يناسب طريقة عملك" },
      subheading: { en: "Start with your workflows, compliance needs, and data requirements.", ar: "ابدأ بسير عملك ومتطلبات الامتثال والبيانات." },
      cards: home.whyErpFails.cards.map((card) => card.id === "wef-overpay" ? {
        ...card,
        icon: "🧩",
        title: { en: "Implementation that fits", ar: "تنفيذ يناسب عملك" },
        desc: { en: "A clear rollout starts with understanding your team and current processes.", ar: "تبدأ خطة التنفيذ الواضحة بفهم فريقك وعملياته الحالية." },
      } : card.id === "wef-zatca" ? {
        ...card,
        desc: { en: "Plan for ZATCA e-invoicing requirements from the start of implementation.", ar: "خطط لمتطلبات الفوترة الإلكترونية لهيئة الزكاة من بداية التنفيذ." },
      } : card),
    },
    whyChoose: {
      ...home.whyChoose,
      subheading: { en: "Enterprise-grade ERP built around Saudi businesses and compliance needs.", ar: "نظام ERP بمستوى المؤسسات مصمم للشركات السعودية ومتطلبات الامتثال." },
      cards: home.whyChoose.cards.map((card) => card.id === "wc-value" ? {
        ...card,
        icon: "🧩",
        title: { en: "Right-fit implementation", ar: "تنفيذ يناسب عملك" },
        desc: { en: "Bring accounting, inventory, sales, and HR together around the way your team works.", ar: "اجمع المحاسبة والمخزون والمبيعات والموارد البشرية بطريقة تناسب فريقك." },
      } : card),
    },
    cta: {
      ...home.cta,
      headline: { en: "Let's plan the right ERP for your business.", ar: "لنخطط لنظام ERP المناسب لعملك." },
      subtitle: { en: "Book a conversation about your workflows, deployment, and compliance needs.", ar: "احجز محادثة حول سير عملك وخيارات النشر ومتطلبات الامتثال." },
      cta1: { label: book, url: "/demo" },
      cta2: { label: { en: "Discuss Your Requirements", ar: "ناقش متطلباتك" }, url: "/demo" },
    },
  };
  const testimonials = content.testimonials.filter((item) => item.enabled !== false &&
    !/\$|\bprice\b|\bcosts?\b|\bsav(?:ed|ings)\b|سعر|تكلفة|التكاليف|وفرنا/i.test(`${item.quote.en} ${item.quote.ar}`),
  );
  const faqs = content.faqs.filter((item) =>
    !/free trial|تجربة مجانية|التجربة المجانية/i.test(`${item.question.en} ${item.question.ar}`),
  );

  return (
    <>
      <Hero data={appointmentHome.hero} isAr={isAr} />
      <ClientsStrip />
      <WhyErpFails data={appointmentHome.whyErpFails} isAr={isAr} />
      <ProductTrio />
      <WhyChooseFalcon data={appointmentHome.whyChoose} isAr={isAr} />
      <CtaBanner data={appointmentHome.cta} isAr={isAr} />
      {/* Sectors we serve — kept from the existing design */}
      <SectorsHome />
      <StatsCounter heading={L(home.stats.heading)} stats={home.stats.items} isAr={isAr} />
      <Testimonials items={testimonials} isAr={isAr} />
      <Faq items={faqs} isAr={isAr} />
      <Newsletter heading={L(home.newsletter.heading)} subtitle={L(home.newsletter.subtitle)} />
    </>
  );
}
