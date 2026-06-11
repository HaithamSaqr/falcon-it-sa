import Container from "@/components/ui/container";
import SectionHeader from "@/components/shared/section-header";
import AnimatedCounter from "@/components/shared/animated-counter";
import type { SiteContent } from "@/types/admin";

export default function StatsCounter({
  heading,
  stats,
  isAr,
}: {
  heading: string;
  stats: SiteContent["stats"];
  isAr: boolean;
}) {
  if (!stats.length) return null;

  return (
    <section className="bg-surface py-20 lg:py-28">
      <Container>
        {heading.trim() && <SectionHeader title={heading} />}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <AnimatedCounter
              key={i}
              value={stat.value}
              suffix={stat.suffix}
              label={isAr ? stat.label.ar : stat.label.en}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
