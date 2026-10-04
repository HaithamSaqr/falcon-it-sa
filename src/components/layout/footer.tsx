import type { ReactNode } from "react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickBi } from "@/lib/blocks/bi";
import { isExternalHref, isLocaleRoute } from "@/lib/href";
import { displayPhone, safeSocialHref, supportingServices, telHref, type PublicSettings } from "@/lib/public-chrome";
import Container from "@/components/v2/ui/container";
import Icon from "@/components/v2/ui/icon";
import FooterGate from "@/components/layout/footer-gate";

type FooterLinkItem = { href: string; label: string };

const SOCIAL: { key: keyof PublicSettings["social"]; icon: string; network: string }[] = [
  { key: "linkedin", icon: "LinkedinLogo", network: "LinkedIn" },
  { key: "twitter", icon: "XLogo", network: "X" },
  { key: "instagram", icon: "InstagramLogo", network: "Instagram" },
  { key: "facebook", icon: "FacebookLogo", network: "Facebook" },
  { key: "youtube", icon: "YoutubeLogo", network: "YouTube" },
  { key: "tiktok", icon: "TiktokLogo", network: "TikTok" },
];

/** Locale routes use the locale-aware Link; external URLs open in a new tab. */
function SmartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  if (isLocaleRoute(href)) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={className}
      {...(isExternalHref(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

const FOCUS = "outline-brand focus-visible:outline-3 focus-visible:outline-offset-3";
const COLUMN_LINK = `rounded-sm text-[15px] leading-[1.3] rtl:leading-[1.5] text-body no-underline transition-colors duration-200 hover:text-brand ${FOCUS}`;
const STRIP_LINK = `rounded-sm text-muted underline decoration-ink/25 underline-offset-[3px] transition-colors duration-200 hover:text-ink ${FOCUS}`;

function Column({ title, links }: { title: string; links: FooterLinkItem[] }) {
  if (links.length === 0) return null;
  return (
    <div data-footer-column className="flex flex-col gap-2.5 text-[15px] leading-[1.3] rtl:leading-[1.5]">
      <h2 className="text-[15px] font-bold leading-[1.3] tracking-normal text-ink">{title}</h2>
      <ul className="flex flex-col gap-2.5">
        {links.map((l, i) => (
          <li key={`${l.href}-${i}`}>
            <SmartLink href={l.href} className={COLUMN_LINK}>
              {l.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Brand({ name, size = "md" }: { name: string; size?: "md" | "sm" }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/images/v2/falcon-mark.png"
        alt=""
        width={40}
        height={28}
        unoptimized
        className={size === "md" ? "h-7 w-auto" : "h-[26px] w-auto"}
      />
      <span
        className={
          size === "md"
            ? "text-[17px] font-extrabold leading-none tracking-[-0.01em] text-ink rtl:font-bold rtl:tracking-normal"
            : "text-base font-semibold leading-none text-ink"
        }
      >
        {name}
      </span>
    </span>
  );
}

/**
 * v2 footer, rendered on the server from `getPublicSettings()` so every
 * column is in the HTML before any JavaScript runs. Sector landing pages get
 * the compact strip from the approved sector mockup.
 */
export default async function Footer({ settings }: { settings: PublicSettings }) {
  const locale = await getLocale();
  const lang = locale === "ar" ? "ar" : "en";
  const t = await getTranslations("chrome");
  const L = (v: { en: string; ar: string }) => pickBi(v, lang);

  const name = L(settings.company.name) || "Falcon Smart Solutions";
  const linksIn = (...sections: string[]): FooterLinkItem[] =>
    settings.footerLinks
      .filter((l) => sections.includes(l.section))
      .map((l) => ({ href: l.url, label: L(l.label) }))
      .filter((l) => l.label !== "");

  const sectorLinks: FooterLinkItem[] = [
    ...settings.sectors.map((s) => ({ href: `/sectors/${s.slug}`, label: L(s.name) })).filter((l) => l.label),
    { href: "/sectors", label: t("allSectors") },
  ];
  const systemLinks: FooterLinkItem[] = [
    { href: "/erp/falcon", label: t("falconErp") },
    { href: "/erp/odoo", label: t("odooServices") },
    ...supportingServices(settings.products)
      .map((p) => ({ href: `/products/${p.slug}`, label: L(p.name) }))
      .filter((l) => l.label),
    ...linksIn("products"),
  ];
  const companyLinks = linksIn("about", "support");
  const legalLinks = linksIn("legal");

  const ids = [
    settings.company.crNumber ? t("crNumber", { number: settings.company.crNumber }) : "",
    settings.company.vatNumber ? t("vatNumber", { number: settings.company.vatNumber }) : "",
  ].filter(Boolean);
  const copyright = t("copyright", { year: new Date().getFullYear(), name });
  const legalLine = ids.length ? `${copyright} ${ids.join(lang === "ar" ? "، " : ", ")}` : copyright;

  const legalNav =
    legalLinks.length > 0 ? (
      <nav aria-label={t("legal")}>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {legalLinks.map((l, i) => (
            <li key={`${l.href}-${i}`}>
              <SmartLink href={l.href} className={STRIP_LINK}>
                {l.label}
              </SmartLink>
            </li>
          ))}
        </ul>
      </nav>
    ) : null;

  // Only paths and https URLs render as links, as on the contact page.
  const socials = SOCIAL.map((s) => ({ ...s, href: safeSocialHref(settings.social[s.key]) })).filter((s) => s.href !== "");
  const email = settings.company.email?.trim();

  const full = (
    <Container className="flex flex-col gap-10 pb-[104px] pt-14 lg:pb-[88px]">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
        <div className="col-span-2 flex flex-col gap-3.5 sm:col-span-3 lg:col-span-1">
          <Link href="/" className={`w-fit rounded-full no-underline ${FOCUS}`}>
            <Brand name={name} />
          </Link>
          <p className="max-w-[340px] text-[15px] leading-[1.6] text-body">{t("tagline")}</p>
          <address className="flex flex-col gap-1.5 text-[15px] not-italic leading-[1.4] text-body">
            {settings.company.branches.map((b) => (
              <span key={b.id} className="flex flex-wrap gap-x-2">
                <span>{L(b.address)}</span>
                <a href={telHref(b.phone)} dir="ltr" className={COLUMN_LINK}>
                  {displayPhone(b.phone)}
                </a>
              </span>
            ))}
            {email && (
              <a href={`mailto:${email}`} className={`${COLUMN_LINK} w-fit`}>
                {email}
              </a>
            )}
          </address>
          {socials.length > 0 && (
            <ul className="-ms-3 flex flex-wrap">
              {socials.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("social", { network: s.network })}
                    className="inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-surface hover:text-brand outline-brand focus-visible:outline-3 focus-visible:-outline-offset-3"
                  >
                    <Icon name={s.icon} size={20} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Column title={t("colSectors")} links={sectorLinks} />
        <Column title={t("colSystems")} links={systemLinks} />
        <Column title={t("colCompany")} links={companyLinks} />
      </div>

      <div className="flex flex-col gap-3 pt-6 text-[13px] leading-normal text-muted shadow-[inset_0_1px_0_rgba(11,26,51,0.08)] sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <p>{legalLine}</p>
        {legalNav}
      </div>
    </Container>
  );

  const compact = (
    <Container className="flex flex-col gap-4 pb-[104px] pt-9 text-[13px] leading-normal text-muted lg:flex-row lg:items-center lg:justify-between lg:pb-[88px]">
      <Link href="/" className={`w-fit rounded-full no-underline ${FOCUS}`}>
        <Brand name={name} size="sm" />
      </Link>
      <div className="flex flex-col gap-2 lg:items-end">
        <p>{legalLine}</p>
        {legalNav}
      </div>
    </Container>
  );

  return (
    <footer className="bg-page">
      <FooterGate full={full} compact={compact} />
    </footer>
  );
}
