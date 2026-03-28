import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import { cn } from "@/lib/utils";

const FEATURES = [
  { key: "feature1", imageStart: true, image: "/images/screens/desktop-invoice.png" },
  { key: "feature2", imageStart: false, image: "/images/screens/web-modules.png" },
  { key: "feature3", imageStart: true, image: "/images/screens/web-inventory.png" },
] as const;

export default function FeatureShowcase() {
  const t = useTranslations("features");

  return (
    <section>
      {FEATURES.map((feature, index) => (
        <div
          key={feature.key}
          className={cn(
            "py-16 lg:py-24",
            index % 2 === 0 ? "bg-white" : "bg-surface"
          )}
        >
          <Container>
            <div
              className={cn(
                "flex flex-col items-center gap-12 lg:flex-row lg:gap-16",
                feature.imageStart ? "lg:flex-row" : "lg:flex-row-reverse"
              )}
            >
              {/* Real product screenshot */}
              <div className="w-full lg:w-1/2">
                <div className="relative overflow-hidden rounded-2xl shadow-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={feature.image}
                    alt={t(`${feature.key}.title`)}
                    className="w-full object-cover"
                  />
                </div>
              </div>

              {/* Text block */}
              <div className="w-full lg:w-1/2">
                <h2 className="text-text-primary">
                  {t(`${feature.key}.title`)}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-text-secondary">
                  {t(`${feature.key}.description`)}
                </p>
              </div>
            </div>
          </Container>
        </div>
      ))}
    </section>
  );
}
