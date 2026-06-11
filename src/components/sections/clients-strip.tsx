import { getClients } from "@/lib/data-store";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";

/** Home "Our Clients" strip — logos + a "view all" link. Hidden when empty. */
export default async function ClientsStrip() {
  const clients = await getClients();
  if (clients.length === 0) return null;

  const locale = await getLocale();
  const isAr = locale === "ar";
  const strip = clients.slice(0, 12);

  return (
    <section className="border-y border-gray-100 bg-white py-16">
      <Container>
        <h2 className="mb-10 text-center text-2xl font-bold text-text-primary sm:text-3xl">
          {isAr ? "عملاؤنا" : "Our Clients"}
        </h2>

        <div className="grid grid-cols-3 items-center gap-6 sm:grid-cols-4 lg:grid-cols-6">
          {strip.map((c) => (
            <div key={c.id} className="flex items-center justify-center grayscale opacity-70 transition hover:opacity-100 hover:grayscale-0" title={isAr ? c.name.ar : c.name.en}>
              {c.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo} alt={isAr ? c.name.ar : c.name.en} className="max-h-12 max-w-full object-contain" />
              ) : (
                <span className="text-sm font-semibold text-text-secondary">{isAr ? c.name.ar : c.name.en}</span>
              )}
            </div>
          ))}
        </div>

        {clients.length > 12 && (
          <div className="mt-10 text-center">
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border-2 border-primary-500 px-8 py-3 text-base font-semibold text-primary-500 transition-colors hover:bg-primary-500 hover:text-white"
            >
              {isAr ? "عرض كل العملاء" : "View all clients"}
              <span className="rtl:rotate-180">→</span>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
