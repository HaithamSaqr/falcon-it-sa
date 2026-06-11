import { setRequestLocale, getLocale } from "next-intl/server";
import { getClients, getClientTags } from "@/lib/data-store";
import Container from "@/components/ui/container";
import ClientsGrid from "@/components/sections/clients-grid";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return { title: locale === "ar" ? "عملاؤنا — Falcon" : "Our Clients — Falcon" };
}

export default async function ClientsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [clients, tags] = await Promise.all([getClients(), getClientTags()]);
  const isAr = (await getLocale()) === "ar";

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <h1 className="mb-12 text-center text-3xl font-extrabold text-text-primary sm:text-4xl">
          {isAr ? "عملاؤنا" : "Our Clients"}
        </h1>
        {clients.length === 0 ? (
          <p className="text-center text-text-secondary">{isAr ? "لا يوجد عملاء بعد." : "No clients yet."}</p>
        ) : (
          <ClientsGrid clients={clients} tags={tags} />
        )}
      </Container>
    </section>
  );
}
