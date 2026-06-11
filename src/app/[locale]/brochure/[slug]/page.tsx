import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getBrochure } from "@/lib/data-store";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const b = await getBrochure(slug);
  if (!b || !b.enabled) return {};
  return { title: `${locale === "ar" ? b.title.ar : b.title.en} — Falcon` };
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
    <article className="py-12 lg:py-20">
      <Container className="max-w-3xl">
        <Link href={`/products/${slug}`} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary-500">
          <span className="rtl:rotate-180">←</span>
          {isAr ? "العودة للمنتج" : "Back to product"}
        </Link>
        {title && <h1 className="mb-8 text-3xl font-extrabold text-text-primary sm:text-4xl">{title}</h1>}
        <div
          className="prose prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-primary-600 prose-img:rounded-xl"
          dir={isAr ? "rtl" : "ltr"}
          dangerouslySetInnerHTML={{ __html: content || "" }}
        />
      </Container>
    </article>
  );
}
