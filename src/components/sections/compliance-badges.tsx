import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";

interface BadgeConfig {
  key: string;
  logo?: string;
  icon?: boolean;
}

const BADGES: BadgeConfig[] = [
  { key: "zatca", icon: true },
  { key: "saudiMade", logo: "/images/logos/falcon-logo.png" },
  { key: "odooPartner", logo: "/images/logos/odoo-partner.png" },
];

export default function ComplianceBadges() {
  const t = useTranslations("compliance");

  return (
    <section className="bg-surface section-padding">
      <Container>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {BADGES.map((badge) => (
            <div
              key={badge.key}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/10"
            >
              {/* Unified brand accent bar */}
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600" />

              {/* Icon / logo */}
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 ring-1 ring-primary-100/70 transition-transform duration-300 group-hover:scale-105">
                {badge.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={badge.logo}
                    alt={t(`${badge.key}.title`)}
                    className="h-12 w-12 object-contain"
                  />
                ) : (
                  <svg className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                )}
              </div>

              <h3 className="mb-2 text-lg font-bold text-text-primary">{t(`${badge.key}.title`)}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{t(`${badge.key}.description`)}</p>

              {/* Verified pill */}
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                {t("verified")}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
