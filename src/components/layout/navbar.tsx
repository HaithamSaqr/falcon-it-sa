import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { pickBi } from "@/lib/blocks/bi";
import type { PublicSettings } from "@/lib/public-chrome";
import Button from "@/components/v2/ui/button";
import Container from "@/components/v2/ui/container";
import Icon from "@/components/v2/ui/icon";
import LanguageToggle from "@/components/layout/language-toggle";
import MobileMenu from "@/components/layout/mobile-menu";
import NavLink from "@/components/layout/nav-link";
import SectorsMenu from "@/components/layout/sectors-menu";

const LINK =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full text-[15px] leading-none text-ink no-underline transition-colors duration-200 hover:text-brand outline-brand focus-visible:outline-3 focus-visible:outline-offset-3";
const ACTIVE = "font-semibold text-brand";

function Logo({ name, short, className }: { name: string; short: string; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-full text-ink no-underline outline-brand focus-visible:outline-3 focus-visible:outline-offset-3 lg:gap-2.5",
        className,
      )}
    >
      <Image
        src="/images/v2/falcon-mark.png"
        alt={name}
        width={43}
        height={30}
        priority
        unoptimized
        className="h-[26px] w-auto lg:h-[30px]"
      />
      <span className="text-base font-extrabold leading-none tracking-[-0.02em] rtl:font-bold rtl:tracking-normal lg:text-lg">
        {short}
      </span>
    </Link>
  );
}

/**
 * Floating island navbar (server-rendered). Desktop: one line with the
 * sectors menu (hover, keyboard focus, Escape; see SectorsMenu),
 * the two ERPs, About, Contact, the language link and the primary CTA.
 * Below `lg`: logo, language link and a menu button that opens a sheet.
 */
export default async function Navbar({ settings }: { settings: PublicSettings }) {
  const locale = await getLocale();
  const lang = locale === "ar" ? "ar" : "en";
  const t = await getTranslations("chrome");

  const companyName = pickBi(settings.company.name, lang) || "Falcon Smart Solutions";
  const ctaLabel = pickBi(settings.primaryCta.label, lang);
  const sectors = settings.sectors
    .map((s) => ({ href: `/sectors/${s.slug}`, label: pickBi(s.name, lang) }))
    .filter((s) => s.label !== "");
  const links = [
    { href: "/erp/odoo", label: t("odoo") },
    { href: "/erp/falcon", label: t("falconErp") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="pointer-events-none sticky top-0 z-50 pt-3 lg:pt-5">
      <Container className="px-3">
        <nav
          aria-label={t("mainNav")}
          className={cn(
            "pointer-events-auto flex h-14 items-center gap-1.5 rounded-full bg-white/[0.88] ps-4 pe-1.5 backdrop-blur-[16px]",
            "shadow-[0_0_0_1px_rgba(11,26,51,0.06),0_16px_32px_-24px_rgba(12,60,120,0.4)]",
            "lg:h-16 lg:gap-6 lg:bg-white/[0.86] lg:ps-[22px] lg:pe-2.5 lg:shadow-[0_0_0_1px_rgba(11,26,51,0.06),0_20px_40px_-28px_rgba(12,60,120,0.35)] xl:gap-9",
          )}
        >
          <Logo name={companyName} short={t("brandShort")} />

          {/* Desktop links */}
          <ul className="hidden items-center gap-5 lg:flex xl:gap-7">
            <SectorsMenu
              href="/sectors"
              linkClassName={LINK}
              activeClassName={ACTIVE}
              label={
                <>
                  {t("sectors")}
                  <Icon name="CaretDown" size={14} className="nav-sectors-caret" />
                </>
              }
            >
              <ul className="w-[320px] rounded-[22px] bg-surface p-2 shadow-[0_0_0_1px_rgba(11,26,51,0.06),0_30px_60px_-30px_rgba(12,60,120,0.4)]">
                {sectors.map((s) => (
                  <li key={s.href}>
                    <NavLink
                      href={s.href}
                      className="flex min-h-11 items-center rounded-[14px] px-3.5 text-[15px] leading-snug text-ink no-underline transition-colors duration-200 hover:bg-page hover:text-brand outline-brand focus-visible:outline-3 focus-visible:-outline-offset-3"
                      activeClassName="bg-sky font-semibold text-brand"
                    >
                      {s.label}
                    </NavLink>
                  </li>
                ))}
                <li className="mt-1 pt-1 shadow-[inset_0_1px_0_rgba(11,26,51,0.08)]">
                  <Link
                    href="/sectors"
                    className="group flex min-h-11 items-center justify-between rounded-[14px] px-3.5 text-[15px] font-semibold text-brand no-underline transition-colors duration-200 hover:bg-page outline-brand focus-visible:outline-3 focus-visible:-outline-offset-3"
                  >
                    {t("allSectors")}
                    <span className="v2-icon-nudge inline-flex">
                      <Icon name="ArrowUpRight" size={16} />
                    </span>
                  </Link>
                </li>
              </ul>
            </SectorsMenu>
            {links.map((l) => (
              <li key={l.href}>
                <NavLink href={l.href} className={LINK} activeClassName={ACTIVE}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <LanguageToggle className="ms-auto min-h-11 px-2.5 text-sm lg:min-h-0 lg:px-0 lg:text-[15px]" />

          <Button href={settings.primaryCta.demoUrl} className="hidden shrink-0 lg:inline-flex rtl:font-semibold">
            {ctaLabel}
          </Button>

          <div className="lg:hidden">
            <MobileMenu
              links={[{ href: "/sectors", label: t("sectors") }, ...links]}
              sectors={sectors}
              labels={{ open: t("openMenu"), close: t("closeMenu"), title: t("menuTitle") }}
              logo={<Logo name={companyName} short={t("brandShort")} />}
              cta={
                <Button href={settings.primaryCta.demoUrl} size="lg">
                  {ctaLabel}
                </Button>
              }
            />
          </div>
        </nav>
      </Container>
    </header>
  );
}
