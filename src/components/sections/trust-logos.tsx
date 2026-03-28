"use client";

import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";

const LOGOS = [
  { name: "Haddad Group", src: "/images/clients/haddad-group.svg" },
  { name: "Tamimi", src: "/images/clients/tamimi.png" },
  { name: "Saudi Emar", src: "/images/clients/saudi-emar.webp" },
  { name: "Capital Safety", src: "/images/clients/capital-safety.png" },
  { name: "Business Capital", src: "/images/clients/business-capital.png" },
  { name: "Diamond Home", src: "/images/clients/diamond-home.jpg" },
  { name: "Elite Construction", src: "/images/clients/elite-construction.png" },
  { name: "Global Conveyor", src: "/images/clients/global-conveyor.png" },
  { name: "Geodesy", src: "/images/clients/geodesy.png" },
  { name: "Zamil Group", src: "/images/clients/zamil-group.webp" },
  { name: "Benchmark", src: "/images/clients/benchmark.png" },
  { name: "Smart Care", src: "/images/clients/smart-care.png" },
  { name: "Echo Art", src: "/images/clients/echo-art.png" },
  { name: "Diar", src: "/images/clients/diar.webp" },
  { name: "Almada", src: "/images/clients/almada.png" },
  { name: "Habib Trading", src: "/images/clients/habib-trading.png" },
  { name: "La Verde", src: "/images/clients/la-verde.png" },
  { name: "Mahara", src: "/images/clients/mahara.png" },
  { name: "Lozom", src: "/images/clients/lozom.png" },
  { name: "Taqnyat", src: "/images/clients/taqnyat.svg" },
] as const;

function LogoItem({ name, src }: { name: string; src: string }) {
  return (
    <div className="flex h-32 w-[220px] shrink-0 items-center justify-center rounded-xl border border-slate-700/40 bg-slate-800 p-4 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className="max-h-20 max-w-[170px] object-contain opacity-85 transition-all hover:opacity-100"
      />
    </div>
  );
}

export default function TrustLogos() {
  const t = useTranslations("trust");

  return (
    <section className="bg-surface py-16 lg:py-24">
      <Container>
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-primary-500">
          {t("label")}
        </p>
        <h2 className="mb-12 text-center text-2xl font-bold text-text-primary sm:text-3xl">
          {t("heading")}
        </h2>
      </Container>

      {/* Marquee wrapper */}
      <div className="group relative overflow-hidden" dir="ltr">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-surface to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-surface to-transparent" />

        <div className="flex w-max animate-marquee items-center gap-6 group-hover:[animation-play-state:paused]">
          {LOGOS.map((logo) => (
            <LogoItem key={logo.name} name={logo.name} src={logo.src} />
          ))}
          {LOGOS.map((logo) => (
            <LogoItem key={`dup-${logo.name}`} name={logo.name} src={logo.src} />
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <Container>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-text-primary">500+</p>
            <p className="mt-1 text-sm text-text-secondary">{t("stat1")}</p>
          </div>
          <div className="hidden h-10 w-px bg-slate-200 sm:block" />
          <div className="text-center">
            <p className="text-3xl font-extrabold text-text-primary">5,000+</p>
            <p className="mt-1 text-sm text-text-secondary">{t("stat2")}</p>
          </div>
          <div className="hidden h-10 w-px bg-slate-200 sm:block" />
          <div className="text-center">
            <p className="text-3xl font-extrabold text-text-primary">8+</p>
            <p className="mt-1 text-sm text-text-secondary">{t("stat3")}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
