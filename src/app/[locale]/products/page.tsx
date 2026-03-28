import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

type Props = {
  params: Promise<{ locale: string }>;
};

const productPages = [
  {
    key: "desktopErp",
    href: "/products/falcon-erp-desktop",
    icon: "🖥️",
    color: "bg-primary-900",
  },
  {
    key: "cloudErp",
    href: "/products/falcon-cloud",
    icon: "☁️",
    color: "bg-primary-500",
  },
  {
    key: "odooServices",
    href: "/products/odoo-services",
    icon: "⚙️",
    color: "bg-cta",
  },
];

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProductsContent />;
}

function ProductsContent() {
  const t = useTranslations("products");

  return (
    <>
      <section className="bg-dark py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              {t("heading")}
            </h1>
            <p className="mt-4 text-lg text-text-on-dark/70">
              {t("subheading")}
            </p>
          </div>
        </Container>
      </section>

      <section className="section-padding">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {productPages.map((product) => (
              <Card key={product.key} className="flex flex-col">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${product.color} text-3xl`}
                >
                  {product.icon}
                </div>
                <h2 className="mt-6 text-center text-xl font-bold text-text-primary">
                  {t(`${product.key}.name`)}
                </h2>
                <p className="mt-2 text-center text-sm font-semibold text-primary-500">
                  {t(`${product.key}.price`)}
                </p>
                <p className="mt-3 flex-1 text-center text-text-secondary">
                  {t(`${product.key}.description`)}
                </p>
                <div className="mt-6 text-center">
                  <Button href={product.href} variant="primary" size="md">
                    {t("learnMore")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
