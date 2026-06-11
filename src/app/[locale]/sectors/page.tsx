import { setRequestLocale, getTranslations } from "next-intl/server";
import { getSectors } from "@/lib/data-store";
import SectorsGrid from "@/components/sections/sectors-grid";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sectors" });
  return { title: `${t("heading")} — Falcon` };
}

export default async function AllSectorsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sectors = await getSectors(true);
  const sorted = [...sectors].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
  return (
    <div className="py-8">
      <SectorsGrid sectors={sorted} hasMore={false} />
    </div>
  );
}
