import { getBrochure } from "@/lib/data-store";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";

/** Professional brochure CTA band — only renders when a brochure is enabled. */
export default async function BrochureButton({ slug }: { slug: string }) {
  const b = await getBrochure(slug);
  if (!b || !b.enabled) return null;
  const isAr = (await getLocale()) === "ar";

  return (
    <section className="bg-gradient-to-r from-primary-900 to-primary-700 py-10">
      <Container className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start">
        <div className="text-white">
          <p className="text-lg font-bold">{isAr ? "هل تريد كل التفاصيل الدقيقة؟" : "Want every detail?"}</p>
          <p className="text-sm text-white/80">{isAr ? "اطّلع على البروشور الكامل لهذا المنتج." : "Read the full product brochure."}</p>
        </div>
        <Link
          href={`/brochure/${slug}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-button)] bg-white px-7 py-3 text-base font-bold text-primary-700 shadow-lg transition-transform hover:scale-[1.03]"
        >
          📄 {isAr ? "عرض البروشور الكامل" : "View full brochure"}
        </Link>
      </Container>
    </section>
  );
}
