"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import SectionHeader from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import type { Sector } from "@/types/admin";

interface Props {
  sectors: Sector[];
  hasMore?: boolean;
  showHeader?: boolean;
  /** When set, sector links preselect this system on the landing page. */
  system?: string;
  heading?: string;
  subheading?: string;
}

export default function SectorsGrid({ sectors, hasMore = false, showHeader = true, system, heading, subheading }: Props) {
  const t = useTranslations("sectors");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section id="sectors" className="bg-surface py-20 lg:py-28">
      <Container>
        {showHeader && <SectionHeader title={heading ?? t("heading")} subtitle={subheading ?? t("subheading")} />}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector) => (
            <Link
              key={sector.id}
              href={system ? `/sectors/${sector.id}?system=${system}` : `/sectors/${sector.id}`}
              className={cn(
                "group relative flex flex-col justify-end overflow-hidden rounded-2xl p-6",
                "aspect-[4/3] transition-transform duration-300 hover:scale-[1.03]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
                sector.gradient || "bg-gradient-to-br from-dark to-primary-800"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

              {sector.featured && (
                <span className="absolute end-4 top-4 z-10 rounded-full bg-cta px-3 py-1 text-xs font-bold text-white shadow-lg">
                  ⭐ {isAr ? "الأكثر طلباً" : "Featured"}
                </span>
              )}

              <div className="relative z-10">
                <span className="mb-3 inline-block text-4xl">{sector.icon}</span>
                <h3 className="text-lg font-bold text-white sm:text-xl">
                  {isAr ? sector.name.ar : sector.name.en}
                </h3>
                <p className="mt-1.5 text-sm text-white/80 line-clamp-2">
                  {isAr ? sector.description.ar : sector.description.en}
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

        {hasMore && (
          <div className="mt-10 text-center">
            <Link
              href="/sectors"
              className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border-2 border-primary-500 px-8 py-3 text-base font-semibold text-primary-500 transition-colors hover:bg-primary-500 hover:text-white"
            >
              {isAr ? "عرض كل القطاعات" : "View all sectors"}
              <span className="rtl:rotate-180">→</span>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
