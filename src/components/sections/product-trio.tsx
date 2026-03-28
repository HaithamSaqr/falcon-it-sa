import { useTranslations } from "next-intl";
import Card from "@/components/ui/card";
import Container from "@/components/ui/container";
import { Link } from "@/i18n/navigation";

const PRODUCTS = [
  {
    key: "desktopErp",
    color: "bg-primary-500",
    image: "/images/products/falcon-erp-logo.png",
    href: "/products/falcon-erp-desktop",
  },
  {
    key: "cloudErp",
    color: "bg-cta",
    image: "/images/screens/web-modules-dark.png",
    href: "/products/falcon-cloud",
  },
  {
    key: "odooServices",
    color: "bg-gold",
    image: "/images/logos/odoo-logo.png",
    href: "/products/odoo-services",
  },
] as const;

export default function ProductTrio() {
  const t = useTranslations("products");

  return (
    <section className="bg-surface section-padding">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="text-text-primary">{t("heading")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            {t("subheading")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PRODUCTS.map((product) => (
            <Card key={product.key} className="flex flex-col">
              {/* Product screenshot */}
              <div className="mb-5 flex h-48 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={t(`${product.key}.name`)}
                  className="h-full w-full object-contain p-2"
                />
              </div>

              <h3 className="mb-2 text-text-primary">
                {t(`${product.key}.name`)}
              </h3>

              <p className="mb-3 text-lg font-semibold text-primary-500">
                {t(`${product.key}.price`)}
              </p>

              <p className="mb-6 flex-1 text-text-secondary">
                {t(`${product.key}.description`)}
              </p>

              <Link
                href={product.href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary-500 transition-colors hover:text-primary-400"
              >
                {t("learnMore")}
                <span aria-hidden="true" className="rtl:rotate-180">
                  &rarr;
                </span>
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
