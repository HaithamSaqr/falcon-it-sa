import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import SectionHeader from "@/components/shared/section-header";
import { INDUSTRIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const INDUSTRY_IMAGES: Record<string, string> = {
  retail: "/images/industries/retail.jpg",
  manufacturing: "/images/industries/manufacturing.jpg",
  construction: "/images/industries/construction.jpg",
  hospitality: "/images/industries/hospitality.jpg",
  healthcare: "/images/industries/healthcare.jpg",
  logistics: "/images/industries/logistics.jpg",
};

const GRADIENTS: Record<string, string> = {
  retail: "bg-gradient-to-br from-primary-800 to-primary-600",
  manufacturing: "bg-gradient-to-tr from-primary-900 to-primary-700",
  construction: "bg-gradient-to-bl from-primary-700 to-dark-lighter",
  realEstate: "bg-gradient-to-r from-dark to-primary-800",
  hospitality: "bg-gradient-to-tl from-primary-600 to-dark",
  healthcare: "bg-gradient-to-b from-primary-800 to-primary-500/60",
  education: "bg-gradient-to-t from-dark-lighter to-primary-700",
  logistics: "bg-gradient-to-br from-dark to-primary-600",
  trading: "bg-gradient-to-l from-primary-900 to-primary-700",
};

export default function IndustryGrid() {
  const t = useTranslations("industries");

  return (
    <section className="bg-surface py-20 lg:py-28">
      <Container>
        <SectionHeader title={t("heading")} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((industry) => {
            const hasImage = industry in INDUSTRY_IMAGES;
            return (
              <div
                key={industry}
                className={cn(
                  "group relative flex items-end overflow-hidden rounded-2xl aspect-[4/3]",
                  "transition-transform duration-300 hover:scale-[1.03]",
                  !hasImage && (GRADIENTS[industry] ?? "bg-gradient-to-br from-dark to-primary-800")
                )}
              >
                {/* Real image background */}
                {hasImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={INDUSTRY_IMAGES[industry]}
                    alt={t(industry)}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}

                {/* Dark overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Industry name */}
                <div className="relative z-10 w-full p-6">
                  <h3 className="text-lg font-bold text-white sm:text-xl">
                    {t(industry)}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
