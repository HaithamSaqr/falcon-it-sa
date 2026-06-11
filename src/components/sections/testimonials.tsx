"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import Card from "@/components/ui/card";
import SectionHeader from "@/components/shared/section-header";
import type { SiteContent } from "@/types/admin";

function ChevronIcon({ direction }: { direction: "start" | "end" }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {direction === "start" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      )}
    </svg>
  );
}

export default function Testimonials({
  items,
  isAr,
}: {
  items: SiteContent["testimonials"];
  isAr: boolean;
}) {
  const t = useTranslations("testimonials");
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "start" | "end") {
    if (!scrollRef.current) return;
    const amount = 380;
    scrollRef.current.scrollBy({
      left: direction === "end" ? amount : -amount,
      behavior: "smooth",
    });
  }

  if (!items.length) return null;

  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <SectionHeader title={t("heading")} />

        <div className="relative">
          {/* Scroll indicators */}
          <button
            type="button"
            onClick={() => scroll("start")}
            aria-label="Scroll start"
            className="absolute -start-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-card transition-shadow hover:shadow-card-hover lg:flex"
          >
            <ChevronIcon direction="start" />
          </button>
          <button
            type="button"
            onClick={() => scroll("end")}
            aria-label="Scroll end"
            className="absolute -end-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-card transition-shadow hover:shadow-card-hover lg:flex"
          >
            <ChevronIcon direction="end" />
          </button>

          {/* Scrollable container */}
          <div ref={scrollRef} className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
            {items.map((item) => {
              const meta = [item.role, item.company].filter(Boolean).join(" · ");
              return (
                <Card key={item.id} className="min-w-[320px] shrink-0 snap-start p-8 sm:w-[350px]">
                  {/* Decorative quote mark */}
                  <span className="mb-4 block text-6xl leading-none text-primary-100 select-none" aria-hidden="true">
                    &ldquo;
                  </span>

                  <blockquote className="-mt-6 text-text-primary">
                    {isAr ? item.quote.ar : item.quote.en}
                  </blockquote>

                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <p className="font-semibold text-text-primary">{item.name}</p>
                    {meta && <p className="text-sm text-text-secondary">{meta}</p>}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
