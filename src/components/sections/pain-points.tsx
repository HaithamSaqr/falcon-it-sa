import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";

const PAIN_POINTS = [
  { key: "overpriced", icon: "\uD83D\uDCB0" },
  { key: "compliance", icon: "\u26A0\uFE0F" },
  { key: "dataSovereignty", icon: "\uD83D\uDD12" },
] as const;

export default function PainPoints() {
  const t = useTranslations("painPoints");

  return (
    <section className="bg-white section-padding">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="text-text-primary">{t("heading")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            {t("subheading")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PAIN_POINTS.map((point) => (
            <div
              key={point.key}
              className="rounded-2xl bg-white p-8 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface text-2xl">
                {point.icon}
              </div>
              <h4 className="mb-3 font-bold text-text-primary">
                {t(`${point.key}.title`)}
              </h4>
              <p className="text-text-secondary">
                {t(`${point.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
