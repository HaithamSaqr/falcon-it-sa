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
            <Link
              key={product.key}
              href={product.href}
              className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <Card className="flex flex-col h-full transition-all duration-300 hover:scale-[1.03] hover:shadow-lg cursor-pointer text-start border border-gray-100">
                {/* Product screenshot */}
                <div className="mb-5 flex h-48 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={t(`${product.key}.name`)}
                    className="h-full w-full object-contain p-2"
                  />
                </div>

                <h3 className="mb-3 text-text-primary text-xl font-bold transition-colors group-hover:text-primary-500">
                  {t(`${product.key}.name`)}
                </h3>

                <p className="flex-1 text-text-secondary text-sm leading-relaxed">
                  {t(`${product.key}.description`)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
