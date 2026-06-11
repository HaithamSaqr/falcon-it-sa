import Container from "@/components/ui/container";
import type { HomeContent } from "@/types/admin";

const ACCENTS = [
  { iconBg: "bg-cta/10" },
  { iconBg: "bg-saudi-green/10" },
  { iconBg: "bg-primary-500/10" },
];

export default function WhyErpFails({
  data,
  isAr,
}: {
  data: HomeContent["whyErpFails"];
  isAr: boolean;
}) {
  const L = (b: { en: string; ar: string }) => (isAr ? b.ar : b.en);
  if (!data.cards.length) return null;

  return (
    <section className="bg-white pt-16 pb-[50px] lg:pt-20">
      <Container>
        <div className="mb-12 text-center">
          {L(data.label).trim() && (
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary-500">
              {L(data.label)}
            </p>
          )}
          <h2 className="mx-auto max-w-3xl text-text-primary">{L(data.heading)}</h2>
          {L(data.subheading).trim() && (
            <p className="mx-auto mt-4 max-w-2xl text-text-secondary">{L(data.subheading)}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch">
          {data.cards.map((card, i) => (
            <div
              key={card.id}
              className="flex h-full flex-col items-center rounded-[var(--radius-card)] bg-white p-8 text-center shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              <div
                className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                  ACCENTS[i % ACCENTS.length].iconBg
                }`}
              >
                <span aria-hidden>{card.icon}</span>
              </div>
              <h4 className="mb-3 font-bold text-text-primary">{L(card.title)}</h4>
              <p className="text-text-secondary">{L(card.desc)}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
