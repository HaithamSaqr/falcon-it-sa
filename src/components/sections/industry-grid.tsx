import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import SectionHeader from "@/components/shared/section-header";
import Button from "@/components/ui/button";
import { SECTORS } from "@/lib/sectors";
import { cn } from "@/lib/utils";

interface IndustryGridProps {
  variant?: "default" | "compact";
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  linkable?: boolean;
}

export default function IndustryGrid({
  variant = "default",
  title,
  eyebrow,
  subtitle,
  ctaText,
  ctaHref,
  linkable = false,
}: IndustryGridProps) {
  const t = useTranslations("sectors");

  const isCompact = variant === "compact";

  return (
    <section
      id="sectors"
      className={cn(
        isCompact 
          ? "pt-8 pb-20 lg:pt-10 lg:pb-28 bg-white" 
          : "bg-surface py-20 lg:py-28"
      )}
    >
      <Container>
        <SectionHeader
          eyebrow={eyebrow}
          title={title || t("heading")}
          subtitle={subtitle || (isCompact ? undefined : t("subheading"))}
        />

        {isCompact ? (
          // Compact rectangular grid for product pages
          <div className="mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECTORS.map((sector) => {
              const cardClassName = cn(
                "group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 sm:p-5",
                "transition-transform duration-300 hover:scale-[1.02] text-start",
                sector.gradient
              );

              const cardContent = (
                <>
                  {/* Dark overlay for text legibility */}
                  <div className="absolute inset-0 bg-black/30" />

                  <div className="relative z-10 flex items-center gap-4 w-full">
                    <span className="text-3xl sm:text-4xl shrink-0" role="img" aria-label={t(`items.${sector.slug}.name`)}>
                      {sector.icon}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-base font-bold text-white leading-snug truncate">
                        {t(`items.${sector.slug}.name`)}
                      </h3>
                      <p className="mt-1 text-xs text-white/80 line-clamp-2">
                        {t(`items.${sector.slug}.desc`)}
                      </p>
                    </div>
                  </div>
                </>
              );

              return linkable ? (
                <Link
                  key={sector.slug}
                  href={`/sectors/${sector.slug}`}
                  className={cardClassName}
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={sector.slug}
                  className={cardClassName}
                >
                  {cardContent}
                </div>
              );
            })}
          </div>
        ) : (
          // Default grid for homepage (without Links as requested)
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SECTORS.map((sector) => (
              <div
                key={sector.slug}
                className={cn(
                  "group relative flex flex-col justify-end overflow-hidden rounded-2xl p-6",
                  "aspect-[4/3] text-start",
                  sector.gradient
                )}
              >
                {/* Dark overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

                <div className="relative z-10">
                  <span className="mb-3 inline-block text-4xl" role="img" aria-label={t(`items.${sector.slug}.name`)}>
                    {sector.icon}
                  </span>
                  <h3 className="text-lg font-bold text-white sm:text-xl">
                    {t(`items.${sector.slug}.name`)}
                  </h3>
                  <p className="mt-1.5 text-sm text-white/80 line-clamp-2">
                    {t(`items.${sector.slug}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button at the bottom */}
        {ctaText && (
          <div className="mt-10 text-center">
            <Button variant="outline" size="md" href={ctaHref || "/contact"}>
              {ctaText}
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
