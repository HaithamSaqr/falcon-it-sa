"use client";

import { useMemo, useState } from "react";
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
  /** Show a search box above the grid (used on the full /sectors list). */
  showSearch?: boolean;
  /** When set, sector links preselect this system on the landing page. */
  system?: string;
  heading?: string;
  subheading?: string;
}

export default function SectorsGrid({ sectors, hasMore = false, showHeader = true, showSearch = false, system, heading, subheading }: Props) {
  const t = useTranslations("sectors");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sectors;
    return sectors.filter((s) =>
      `${s.name.en} ${s.name.ar} ${s.description.en} ${s.description.ar}`.toLowerCase().includes(q)
    );
  }, [sectors, query]);

  return (
    <section id="sectors" className="bg-surface py-20 lg:py-28">
      <Container>
        {showHeader && <SectionHeader title={heading ?? t("heading")} subtitle={subheading ?? t("subheading")} />}

        {showSearch && (
          <div className="mx-auto mb-10 max-w-md">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-text-secondary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.34-4.34M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAr ? "ابحث عن قطاع…" : "Search sectors…"}
                className="w-full rounded-[var(--radius-button)] border border-gray-300 bg-white py-3 ps-12 pe-4 text-sm text-text-primary shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sector) => (
            <Link
              key={sector.id}
              href={system ? `/sectors/${sector.id}?system=${system}` : `/sectors/${sector.id}`}
              className={cn(
                "group relative flex min-h-[180px] flex-col justify-end overflow-hidden rounded-2xl p-6",
                "transition-transform duration-300 hover:scale-[1.03]",
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

        {showSearch && filtered.length === 0 && (
          <p className="py-10 text-center text-text-secondary">
            {isAr ? "لا توجد قطاعات مطابقة لبحثك." : "No sectors match your search."}
          </p>
        )}

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
