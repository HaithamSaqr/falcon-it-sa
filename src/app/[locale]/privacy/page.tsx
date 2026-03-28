import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";

export default function PrivacyPage() {
  const t = useTranslations("legal");

  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-3xl font-extrabold text-text-primary sm:text-4xl">
            {t("privacyTitle")}
          </h1>
          <div className="prose prose-slate max-w-none text-text-secondary">
            <p className="text-lg leading-relaxed">{t("privacyIntro")}</p>

            <h2 className="mt-8 text-xl font-bold text-text-primary">{t("dataCollection")}</h2>
            <p>{t("dataCollectionText")}</p>

            <h2 className="mt-8 text-xl font-bold text-text-primary">{t("dataUsage")}</h2>
            <p>{t("dataUsageText")}</p>

            <h2 className="mt-8 text-xl font-bold text-text-primary">{t("dataSecurity")}</h2>
            <p>{t("dataSecurityText")}</p>

            <h2 className="mt-8 text-xl font-bold text-text-primary">{t("contact")}</h2>
            <p>{t("contactText")}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
