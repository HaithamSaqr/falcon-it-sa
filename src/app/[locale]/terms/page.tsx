import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";

export default function TermsPage() {
  const t = useTranslations("legal");

  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-3xl font-extrabold text-text-primary sm:text-4xl">
            {t("termsTitle")}
          </h1>
          <div className="prose prose-slate max-w-none text-text-secondary">
            <p className="text-lg leading-relaxed">{t("termsIntro")}</p>

            <h2 className="mt-8 text-xl font-bold text-text-primary">{t("useOfService")}</h2>
            <p>{t("useOfServiceText")}</p>

            <h2 className="mt-8 text-xl font-bold text-text-primary">{t("intellectualProperty")}</h2>
            <p>{t("intellectualPropertyText")}</p>

            <h2 className="mt-8 text-xl font-bold text-text-primary">{t("limitation")}</h2>
            <p>{t("limitationText")}</p>

            <h2 className="mt-8 text-xl font-bold text-text-primary">{t("contact")}</h2>
            <p>{t("contactText")}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
