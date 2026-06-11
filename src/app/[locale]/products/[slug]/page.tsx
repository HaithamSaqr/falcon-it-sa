import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getProduct, getBrochure } from "@/lib/data-store";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import ProductHero from "@/components/sections/product-hero";
import BrochureButton from "@/components/sections/brochure-button";
import CtaBanner from "@/components/sections/cta-banner";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";

type Props = { params: Promise<{ locale: string; slug: string }> };

const FALLBACK_BENEFITS = [
  { icon: "🎯", en: { t: "Tailored to you", d: "Designed around your exact goals." }, ar: { t: "مصمّم لك", d: "مصمّم حول أهدافك بدقة." } },
  { icon: "🛡️", en: { t: "Secure & reliable", d: "Enterprise-grade security." }, ar: { t: "آمن وموثوق", d: "أمان بمستوى المؤسسات." } },
  { icon: "🕑", en: { t: "24/7 support", d: "A dedicated team for you." }, ar: { t: "دعم على مدار الساعة", d: "فريق مخصص لك." } },
  { icon: "📈", en: { t: "Built to scale", d: "Grows with your business." }, ar: { t: "قابل للتوسّع", d: "ينمو مع أعمالك." } },
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
  const content = PRODUCT_CONTENT[slug];
  const brochure = await getBrochure(slug);

  const features = content
    ? content.features
    : FALLBACK_BENEFITS.map((b) => ({ icon: b.icon, title: { en: b.en.t, ar: b.ar.t }, desc: { en: b.en.d, ar: b.ar.d } }));

  return (
    <>
      <ProductHero product={product} />

      {/* Intro + Features grid */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-primary-500">
              {isAr ? product.eyebrow.ar || "ماذا نقدّم" : product.eyebrow.en || "What we offer"}
            </span>
            <h2 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
              {isAr ? product.name.ar : product.name.en}
            </h2>
            {content && (
              <p className="mt-4 text-lg text-text-secondary">{isAr ? content.intro.ar : content.intro.en}</p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/10"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-2xl ring-1 ring-primary-100 transition-transform group-hover:scale-105">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-text-primary">{isAr ? f.title.ar : f.title.en}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{isAr ? f.desc.ar : f.desc.en}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Capabilities highlight panel */}
      {content && (
        <section className="bg-surface py-20 lg:py-28">
          <Container>
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-dark to-primary-900 p-8 lg:p-14">
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <h2 className="mb-6 text-3xl font-extrabold text-white sm:text-4xl">
                    {isAr ? content.capabilitiesTitle.ar : content.capabilitiesTitle.en}
                  </h2>
                  <ul className="space-y-4">
                    {content.capabilities.map((c, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/90">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cta text-white">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" /></svg>
                        </span>
                        <span className="text-base">{isAr ? c.ar : c.en}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button variant="cta" size="lg" href="/contact">{isAr ? "اطلب عرض سعر" : "Request a quote"}</Button>
                  </div>
                </div>

                {/* Visual block */}
                <div className="relative hidden lg:block">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                    {product.heroImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.heroImage} alt={isAr ? product.name.ar : product.name.en} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid grid-cols-3 gap-4 p-8 opacity-90">
                        {features.slice(0, 6).map((f, i) => (
                          <div key={i} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">{f.icon}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Process steps */}
      {content && content.process.length > 0 && (
        <section className="py-20 lg:py-28">
          <Container>
            <h2 className="mb-14 text-center text-3xl font-extrabold text-text-primary sm:text-4xl">
              {isAr ? "كيف نعمل" : "How it works"}
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {content.process.map((s, i) => (
                <div key={i} className="relative text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-xl font-extrabold text-white shadow-lg shadow-primary-500/30">
                    {i + 1}
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-text-primary">{isAr ? s.title.ar : s.title.en}</h3>
                  <p className="text-sm text-text-secondary">{isAr ? s.desc.ar : s.desc.en}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Full brochure (if enabled) */}
      <BrochureButton slug={slug} />

      <CtaBanner />
    </>
  );
}
