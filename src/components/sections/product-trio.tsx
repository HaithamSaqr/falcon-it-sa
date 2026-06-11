import { getTranslations, getLocale } from "next-intl/server";
import Card from "@/components/ui/card";
import Container from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { getProducts } from "@/lib/data-store";

/** Home "Product Trio" — the first three products, pulled from the admin DB. */
export default async function ProductTrio() {
  const [products, t, locale] = await Promise.all([
    getProducts(true), // enabled only, ordered by sort_order
    getTranslations("products"),
    getLocale(),
  ]);
  const isAr = locale === "ar";
  const trio = products.slice(0, 3);
  if (trio.length === 0) return null;

  return (
    <section className="bg-surface section-padding">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="text-text-primary">{t("heading")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">{t("subheading")}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {trio.map((product) => {
            const name = isAr ? product.name.ar : product.name.en;
            const description = isAr ? product.description.ar : product.description.en;
            return (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                <Card className="flex flex-col h-full transition-all duration-300 hover:scale-[1.03] hover:shadow-lg cursor-pointer text-start border border-gray-100">
                  {/* Product card image (editable in admin → Products → Card image) */}
                  <div className="mb-5 flex h-48 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                    {product.cardImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.cardImage} alt={name} className="h-full w-full object-contain p-2" />
                    ) : (
                      <span className="text-sm font-medium text-text-secondary">{name}</span>
                    )}
                  </div>

                  <h3 className="mb-3 text-text-primary text-xl font-bold transition-colors group-hover:text-primary-500">
                    {name}
                  </h3>

                  <p className="flex-1 text-text-secondary text-sm leading-relaxed line-clamp-4">
                    {description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
