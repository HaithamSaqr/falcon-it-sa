import { getClients } from "@/lib/data-store";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";

/** Home "Our Clients" strip — an auto-scrolling marquee of logos only. */
export default async function ClientsStrip() {
  const clients = await getClients();
  // Only logos are shown publicly; clients without a logo are skipped here.
  const logos = clients.filter((c) => c.logo);
  if (logos.length === 0) return null;

  const locale = await getLocale();
  const isAr = locale === "ar";

  // Build one "half" wide enough to fill the viewport (repeat when few logos),
  // then duplicate it so the marquee loops seamlessly (translateX -50%).
  const half: typeof logos = [];
  while (half.length < 8) half.push(...logos);
  const track = [...half, ...half];

  return (
    <section className="border-y border-gray-100 bg-white py-16">
      {/* Full-bleed marquee with fading edges */}
      <div className="marquee-pause relative overflow-hidden">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24" />

        <div className="animate-marquee flex w-max items-center gap-12 sm:gap-16">
          {track.map((c, i) => (
            <div
              key={`${c.id}-${i}`}
              className="flex h-12 shrink-0 items-center justify-center opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
              title={isAr ? c.name.ar : c.name.en}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.logo}
                alt={isAr ? c.name.ar : c.name.en}
                className="max-h-12 w-auto max-w-[160px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <Container>
        <div className="mt-12 text-center">
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border-2 border-primary-500 px-8 py-3 text-base font-semibold text-primary-500 transition-colors hover:bg-primary-500 hover:text-white"
          >
            {isAr ? "عرض كل العملاء" : "View all clients"}
            <span className="rtl:rotate-180">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
