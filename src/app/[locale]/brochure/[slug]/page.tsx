import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getBrochure } from "@/lib/data-store";
import { ERP_PRODUCT_PAGE } from "@/lib/public-chrome";
import { Link } from "@/i18n/navigation";
import Container from "@/components/v2/ui/container";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const b = await getBrochure(slug);
  if (!b || !b.enabled) return {};
  return { title: `${locale === "ar" ? b.title.ar : b.title.en} | Falcon` };
}

export default async function BrochurePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const b = await getBrochure(slug);
  if (!b || !b.enabled) notFound();

  const isAr = locale === "ar";
  const title = isAr ? b.title.ar : b.title.en;
  const content = isAr ? b.content.ar : b.content.en;

  return (
    <article className="pb-16">
      {/* Back link + title stay in a readable container */}
      <Container className="max-w-5xl pt-8">
        <Link href={ERP_PRODUCT_PAGE[slug] ?? `/products/${slug}`} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand">
          <span className="rtl:rotate-180">←</span>
          {isAr ? "العودة للمنتج" : "Back to product"}
        </Link>
        {title && <h1 className="mb-8 text-3xl font-extrabold text-ink sm:text-4xl">{title}</h1>}
      </Container>

      {/* Pasted HTML renders full-width; plain text children stay in a readable column. */}
      <div
        className="brochure-content prose prose-lg w-full max-w-none prose-headings:text-ink prose-p:text-body prose-a:text-brand prose-img:rounded-xl"
        dir={isAr ? "rtl" : "ltr"}
        dangerouslySetInnerHTML={{ __html: content || "" }}
      />
    </article>
  );
}
