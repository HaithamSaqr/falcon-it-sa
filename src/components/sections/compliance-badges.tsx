import { useTranslations } from "next-intl";
import Card from "@/components/ui/card";
import Container from "@/components/ui/container";

interface BadgeConfig {
  key: string;
  accentColor: string;
  borderColor: string;
  iconBg: string;
  logo?: string;
  icon?: string;
}

const BADGES: BadgeConfig[] = [
  {
    key: "zatca",
    accentColor: "text-saudi-green",
    borderColor: "border-t-saudi-green",
    iconBg: "bg-saudi-green/10",
    icon: "zatca",
  },
  {
    key: "saudiMade",
    accentColor: "text-gold",
    borderColor: "border-t-gold",
    iconBg: "bg-gold/10",
    logo: "/images/logos/falcon-logo.png",
  },
  {
    key: "odooPartner",
    accentColor: "text-primary-500",
    borderColor: "border-t-primary-500",
    iconBg: "bg-primary-500/10",
    logo: "/images/logos/odoo-partner.png",
  },
];

export default function ComplianceBadges() {
  const t = useTranslations("compliance");

  return (
    <section className="bg-surface section-padding">
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {BADGES.map((badge) => (
            <Card
              key={badge.key}
              className={`border-t-4 ${badge.borderColor} text-center`}
            >
              {/* Badge icon */}
              <div
                className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl ${badge.iconBg}`}
              >
                {badge.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={badge.logo}
                    alt={t(`${badge.key}.title`)}
                    className="h-14 w-14 object-contain"
                  />
                ) : (
                  /* ZATCA invoice icon */
                  <svg className="h-10 w-10 text-saudi-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                )}
              </div>

              <h3 className={`mb-2 text-lg font-bold ${badge.accentColor}`}>
                {t(`${badge.key}.title`)}
              </h3>
              <p className="text-sm text-text-secondary">
                {t(`${badge.key}.description`)}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
