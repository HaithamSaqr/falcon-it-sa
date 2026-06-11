import { getLocale } from "next-intl/server";
import { getProduct } from "@/lib/data-store";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import type { Product } from "@/types/admin";

/** Editable product hero (eyebrow, title, description, image, 2 CTAs). */
export default async function ProductHero({ slug, product }: { slug?: string; product?: Product }) {
  const p = product ?? (slug ? await getProduct(slug) : null);
  if (!p) return null;
  const isAr = (await getLocale()) === "ar";

  const eyebrow = isAr ? p.eyebrow.ar : p.eyebrow.en;
  const title = isAr ? p.title.ar : p.title.en;
  const description = isAr ? p.description.ar : p.description.en;
  const cta1 = isAr ? p.cta1.label.ar : p.cta1.label.en;
  const cta2 = isAr ? p.cta2.label.ar : p.cta2.label.en;

  return (
    <section className="bg-dark py-20 lg:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            {eyebrow && (
              <span className="mb-4 inline-block rounded-full bg-primary-500/10 px-4 py-1.5 text-sm font-semibold text-primary-500">
                {eyebrow}
              </span>
            )}
            <h1 className="mb-6 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mb-8 text-xl text-gray-300">{description}</p>
            <div className="flex flex-wrap items-center gap-4">
              {cta1 && (
                <Button variant="cta" size="lg" href={p.cta1.url || "/contact"}>
                  {cta1}
                </Button>
              )}
              {cta2 && (
                <Button variant="dark-outline" size="lg" href={p.cta2.url || "/demo"}>
                  {cta2}
                </Button>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-900/40">
              {p.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.heroImage} alt={isAr ? p.name.ar : p.name.en} className="h-full w-full object-cover" />
              ) : (
                <span className="p-8 text-center text-lg font-medium text-primary-500/80">
                  {isAr ? p.name.ar : p.name.en}
                </span>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
