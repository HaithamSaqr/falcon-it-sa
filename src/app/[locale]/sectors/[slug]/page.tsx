import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSector } from "@/lib/data-store";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const sector = await getSector(slug);
  if (!sector) return {};
  const isAr = locale === "ar";
  return {
    title: `${isAr ? sector.title.ar : sector.title.en} — Falcon ERP`,
    description: isAr ? sector.description.ar : sector.description.en,
  };
}

export default async function SectorPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const sector = await getSector(slug);
  if (!sector || !sector.enabled) notFound();

  const isAr = locale === "ar";

  return (
    <section className="bg-surface py-20 lg:py-28">
      <Container className="max-w-3xl text-center">
        <span className="text-5xl" aria-hidden>{sector.icon}</span>
        <h1 className="mt-5 text-4xl font-extrabold text-text-primary">
          {isAr ? sector.title.ar : sector.title.en}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-text-secondary">
          {isAr ? sector.description.ar : sector.description.en}
        </p>
        <p className="mt-8 text-text-secondary">
          {isAr ? "تحدث مع فريقنا عن متطلبات قطاعك والحل الأنسب لعملك." : "Talk with our team about your sector and the right solution for your business."}
        </p>
        <div className="mt-8">
          <Button variant="cta" size="lg" href="/demo">
            {isAr ? "احجز موعدًا" : "Book an Appointment"}
          </Button>
        </div>
      </Container>
    </section>
  );
}
