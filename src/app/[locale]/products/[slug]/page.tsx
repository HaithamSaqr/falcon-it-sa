import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getProduct, getBrochure } from "@/lib/data-store";
import ProductHero from "@/components/sections/product-hero";
import CtaBanner from "@/components/sections/cta-banner";
import Container from "@/components/ui/container";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

type Props = { params: Promise<{ locale: string; slug: string }> };

const BENEFITS = [
  { icon: "🎯", en: { t: "Tailored to you", d: "Solutions designed around your exact workflows and goals." }, ar: { t: "مصمّم لك", d: "حلول مصممة حول سير عملك وأهدافك بدقة." } },
  { icon: "🛡️", en: { t: "Secure & reliable", d: "Enterprise-grade security and dependable performance." }, ar: { t: "آمن وموثوق", d: "أمان بمستوى المؤسسات وأداء يُعتمد عليه." } },
  { icon: "🕑", en: { t: "24/7 support", d: "A dedicated team ready whenever you need us." }, ar: { t: "دعم على مدار الساعة", d: "فريق مخصص جاهز وقتما تحتاجنا." } },
  { icon: "📈", en: { t: "Built to scale", d: "Grows with your business — no painful migrations." }, ar: { t: "قابل للتوسّع", d: "ينمو مع أعمالك دون عمليات ترحيل مؤلمة." } },
];

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  const isAr = locale === "ar";
  return {
    title: `${isAr ? p.name.ar : p.name.en} — Falcon`,
    description: isAr ? p.description.ar : p.description.en,
  };
}

export default async function DynamicProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProduct(slug);
  if (!product || !product.enabled) notFound();

  const isAr = locale === "ar";
  const brochure = await getBrochure(slug);
  const hasBrochure = brochure?.enabled && (isAr ? brochure.content.ar : brochure.content.en);

  return (
    <>
      <ProductHero product={product} />

      {/* Benefits */}
      <section className="py-20 lg:py-28">
        <Container>
          <h2 className="mb-12 text-center text-3xl font-extrabold text-text-primary sm:text-4xl">
            {isAr ? "لماذا تختارنا" : "Why choose us"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <Card key={i} className="text-start">
                <span className="mb-4 inline-block text-3xl">{b.icon}</span>
                <h3 className="mb-2 text-lg font-bold text-text-primary">{isAr ? b.ar.t : b.en.t}</h3>
                <p className="text-sm text-text-secondary">{isAr ? b.ar.d : b.en.d}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Brochure content (inline if present) */}
      {hasBrochure && (
        <section className="border-t border-gray-100 bg-surface py-20 lg:py-28">
          <Container className="max-w-3xl">
            {brochure!.title && (isAr ? brochure!.title.ar : brochure!.title.en) && (
              <h2 className="mb-8 text-3xl font-extrabold text-text-primary">
                {isAr ? brochure!.title.ar : brochure!.title.en}
              </h2>
            )}
            <div
              className="prose prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-primary-600 prose-img:rounded-xl"
              dir={isAr ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{ __html: (isAr ? brochure!.content.ar : brochure!.content.en) || "" }}
            />
          </Container>
        </section>
      )}

      {/* Mid CTA */}
      <section className="bg-dark py-16">
        <Container className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
            {isAr ? "جاهز للبدء؟" : "Ready to get started?"}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-gray-300">
            {isAr ? "تواصل معنا اليوم واحصل على استشارة مجانية." : "Talk to us today and get a free consultation."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="cta" size="lg" href="/contact">{isAr ? "تواصل معنا" : "Contact us"}</Button>
            <Button variant="dark-outline" size="lg" href="/demo">{isAr ? "احجز عرضاً" : "Book a demo"}</Button>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
