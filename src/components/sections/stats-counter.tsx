import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import SectionHeader from "@/components/shared/section-header";
import AnimatedCounter from "@/components/shared/animated-counter";
import { STATS } from "@/lib/constants";

export default function StatsCounter() {
  const t = useTranslations("stats");

  return (
    <section className="bg-surface py-20 lg:py-28">
      <Container>
        <SectionHeader title={t("heading")} />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STATS.map((stat) => (
            <AnimatedCounter
              key={stat.key}
              value={stat.value}
              suffix={stat.suffix}
              label={t(stat.key)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
