import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSettings } from "@/lib/data-store";
import { pageMetadata } from "@/lib/page-meta";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import Button from "@/components/v2/ui/button";
import { SectionHead } from "@/components/v2/blocks/parts";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Images live in public/images/sections and public/images/industries. */
const BLOG_POSTS = [
  { slug: "zatca-phase-2-guide", image: "/images/sections/full-section-1.jpg", category: "compliance", date: "2025-12-15" },
  { slug: "erp-vs-spreadsheets", image: "/images/sections/full-section-2.jpg", category: "insights", date: "2025-11-20" },
  { slug: "cloud-vs-desktop-erp", image: "/images/sections/full-section-3.jpg", category: "products", date: "2025-10-08" },
  { slug: "hr-payroll-automation", image: "/images/industries/manufacturing.jpg", category: "features", date: "2025-09-25" },
  { slug: "inventory-best-practices", image: "/images/industries/retail.jpg", category: "insights", date: "2025-08-14" },
  { slug: "construction-erp-guide", image: "/images/industries/construction.jpg", category: "industries", date: "2025-07-30" },
] as const;

/** Gregorian dates in the page language (Latin digits in Arabic, as elsewhere on the site). */
function formatDate(iso: string, lang: "en" | "ar"): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** The blog is off (404, and hidden from nav, footer and sitemap) until site_settings.blog_enabled is on. */
async function blogEnabled(): Promise<boolean> {
  try {
    return (await getSettings()).blogEnabled === true;
  } catch {
    return false;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!(await blogEnabled())) return {};
  return pageMetadata("blog", locale);
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  if (!(await blogEnabled())) notFound();
  setRequestLocale(locale);
  const lang = locale === "ar" ? "ar" : "en";
  const t = await getTranslations({ locale: lang, namespace: "blog" });

  return (
    <>
      <Section tone="page" className="pt-10 md:pt-14 lg:pt-[72px]">
        <Container className="flex flex-col gap-10 lg:gap-14">
          <SectionHead as="h1" heading={t("heading")} intro={t("subtitle")} />
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {BLOG_POSTS.map((post) => (
              <li
                key={post.slug}
                className="flex flex-col overflow-hidden rounded-[24px] bg-surface shadow-[inset_0_0_0_1px_rgba(11,26,51,0.06)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute start-4 top-4 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink">
                    {t(`categories.${post.category}`)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-6">
                  <time dateTime={post.date} className="text-sm text-muted">
                    {formatDate(post.date, lang)}
                  </time>
                  <h2 className="text-lg font-bold leading-snug text-ink [overflow-wrap:anywhere] rtl:font-semibold">
                    {t(`posts.${post.slug}.title`)}
                  </h2>
                  <p className="v2-copy line-clamp-3 text-[15px] text-body">{t(`posts.${post.slug}.excerpt`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="brand">
        <Container className="flex flex-col items-start gap-6">
          <h2 className="v2-h2-xl max-w-[760px]">{t("ctaHeading")}</h2>
          <p className="v2-copy max-w-[600px] text-base text-[#E3EFFB] lg:text-lg">{t("ctaSubtitle")}</p>
          <Button href="/demo" variant="ghost" size="lg" withArrow>
            {t("ctaButton")}
          </Button>
        </Container>
      </Section>
    </>
  );
}
