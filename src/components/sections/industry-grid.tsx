import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import SectionHeader from "@/components/shared/section-header";
import { SECTORS } from "@/lib/sectors";
import { cn } from "@/lib/utils";

export default function IndustryGrid() {
  const t = useTranslations("sectors");

  return (
    <section id="sectors" className="bg-surface py-20 lg:py-28">
      <Container>
        <SectionHeader title={t("heading")} subtitle={t("subheading")} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SECTORS.map((sector) => (
            <Link
              key={sector.slug}
              href={`/sectors/${sector.slug}`}
              className={cn(
                "group relative flex flex-col justify-end overflow-hidden rounded-2xl p-6",
                "aspect-[4/3] transition-transform duration-300 hover:scale-[1.03]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
                sector.gradient
              )}
            >
              {/* Dark overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

              <div className="relative z-10">
                <span className="mb-3 inline-block text-4xl">{sector.icon}</span>
                <h3 className="text-lg font-bold text-white sm:text-xl">
                  {t(`items.${sector.slug}.name`)}
                </h3>
                <p className="mt-1.5 text-sm text-white/80 line-clamp-2">
                  {t(`items.${sector.slug}.desc`)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  {t("learnMore")}
                  <span className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
