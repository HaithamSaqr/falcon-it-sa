import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

type Props = {
  params: Promise<{ locale: string }>;
};

const BLOG_POSTS = [
  {
    slug: "zatca-phase-2-guide",
    image: "/images/sections/full-section-1.jpg",
    category: "compliance",
    date: "2025-12-15",
  },
  {
    slug: "erp-vs-spreadsheets",
    image: "/images/sections/full-section-2.jpg",
    category: "insights",
    date: "2025-11-20",
  },
  {
    slug: "cloud-vs-desktop-erp",
    image: "/images/sections/full-section-3.jpg",
    category: "products",
    date: "2025-10-08",
  },
  {
    slug: "hr-payroll-automation",
    image: "/images/industry/manufacturing.jpg",
    category: "features",
    date: "2025-09-25",
  },
  {
    slug: "inventory-best-practices",
    image: "/images/industry/retail.jpg",
    category: "insights",
    date: "2025-08-14",
  },
  {
    slug: "construction-erp-guide",
    image: "/images/industry/construction.jpg",
    category: "industries",
    date: "2025-07-30",
  },
] as const;

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BlogContent />;
}

function BlogContent() {
  const t = useTranslations("blog");

  return (
    <>
      {/* Hero */}
      <section className="bg-dark py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-primary-500">
              {t("label")}
            </span>
            <h1 className="mb-6 text-4xl font-extrabold text-white sm:text-5xl">
              {t("heading")}
            </h1>
            <p className="text-lg text-gray-300">{t("subtitle")}</p>
          </div>
        </Container>
      </section>

      {/* Blog Grid */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <Card key={post.slug} className="overflow-hidden p-0">
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={t(`posts.${post.slug}.title`)}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <span className="absolute start-4 top-4 rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-white">
                    {t(`categories.${post.category}`)}
                  </span>
                </div>
                <div className="p-6">
                  <time className="text-xs text-text-secondary">
                    {new Date(post.date).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h3 className="mt-2 mb-3 text-lg font-bold text-text-primary">
                    {t(`posts.${post.slug}.title`)}
                  </h3>
                  <p className="mb-4 text-sm text-text-secondary line-clamp-3">
                    {t(`posts.${post.slug}.excerpt`)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-500">
                    {t("readMore")}
                    <span aria-hidden="true" className="rtl:rotate-180">
                      &rarr;
                    </span>
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-dark py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-white">
              {t("ctaHeading")}
            </h2>
            <p className="mb-8 text-gray-300">{t("ctaSubtitle")}</p>
            <Button variant="cta" size="lg" href="/demo">
              {t("ctaButton")}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
