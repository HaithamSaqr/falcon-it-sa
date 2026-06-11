import Container from "@/components/ui/container";
import type { HomeContent } from "@/types/admin";

export default function WhyChooseFalcon({
  data,
  isAr,
}: {
  data: HomeContent["whyChoose"];
  isAr: boolean;
}) {
  const L = (b: { en: string; ar: string }) => (isAr ? b.ar : b.en);
  if (!data.cards.length) return null;

  return (
    <section className="bg-surface section-padding">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="text-text-primary">{L(data.heading)}</h2>
          {L(data.subheading).trim() && (
            <p className="mx-auto mt-4 max-w-2xl text-text-secondary">{L(data.subheading)}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {data.cards.map((card) => (
            <div
              key={card.id}
              className="flex h-full flex-col items-center rounded-[var(--radius-card)] bg-white px-8 py-7 text-center shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-3xl">
                <span aria-hidden>{card.icon}</span>
              </div>
              <h4 className="mb-3 font-bold text-text-primary">{L(card.title)}</h4>
              <p className="text-sm leading-relaxed text-text-secondary">{L(card.desc)}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
