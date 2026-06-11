import Button from "@/components/ui/button";
import Container from "@/components/ui/container";
import type { HomeContent } from "@/types/admin";

export default function CtaBanner({
  data,
  isAr,
}: {
  data: HomeContent["cta"];
  isAr: boolean;
}) {
  const L = (b: { en: string; ar: string }) => (isAr ? b.ar : b.en);

  return (
    <section className="bg-dark py-20 lg:py-28">
      <Container>
        <div className="text-center">
          <h2 className="text-white">{L(data.headline)}</h2>
          {L(data.subtitle).trim() && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-on-dark/70">{L(data.subtitle)}</p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {L(data.cta1.label).trim() && (
              <Button variant="cta" size="lg" href={data.cta1.url || "/contact"}>
                {L(data.cta1.label)}
              </Button>
            )}
            {L(data.cta2.label).trim() && (
              <Button variant="dark-outline" size="lg" href={data.cta2.url || "/demo"}>
                {L(data.cta2.label)}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
