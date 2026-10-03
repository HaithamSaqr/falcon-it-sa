"use client";

import { useLocale, useTranslations } from "next-intl";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { pickBi } from "@/lib/blocks/bi";
import { isLocaleRoute } from "@/lib/href";
import { useSettings } from "@/components/providers/settings-provider";
import { useWhatsAppHref } from "@/components/layout/whatsapp-widget";
import { fireAdsConversion, adsSendTo } from "@/lib/gtag";

const PILL =
  "v2-press flex min-w-0 items-center justify-center gap-1.5 rounded-full px-3 text-[15px] font-bold leading-none no-underline outline-brand focus-visible:outline-3 focus-visible:outline-offset-2";

/** Floating pill bar below lg: WhatsApp and the primary CTA, as in the sector mobile mockup. */
export default function MobileBottomBar() {
  const t = useTranslations("chrome");
  const locale = useLocale();
  const { googleAds, primaryCta } = useSettings();
  const whatsappHref = useWhatsAppHref();
  const ctaLabel = pickBi(primaryCta.label, locale === "ar" ? "ar" : "en");
  const ctaClass = `${PILL} bg-brand text-white hover:bg-brand-deep`;

  return (
    <div
      data-testid="mobile-bottom-bar"
      className="fixed inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom,0px))] z-40 grid h-16 grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-1.5 rounded-full bg-white/90 p-1.5 shadow-[0_0_0_1px_rgba(11,26,51,0.07),0_20px_40px_-18px_rgba(12,60,120,0.45)] backdrop-blur-[16px] lg:hidden"
    >
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => fireAdsConversion(adsSendTo(googleAds?.adsId, googleAds?.whatsappLabel))}
        className={`${PILL} bg-[#EEF2F7] text-ink hover:bg-sky`}
      >
        <WhatsappLogoIcon size={18} weight="light" aria-hidden className="shrink-0" />
        <span className="truncate">{t("whatsapp")}</span>
      </a>
      {ctaLabel &&
        (isLocaleRoute(primaryCta.demoUrl) ? (
          <Link href={primaryCta.demoUrl} className={ctaClass}>
            <span className="truncate">{ctaLabel}</span>
          </Link>
        ) : (
          <a href={primaryCta.demoUrl} className={ctaClass}>
            <span className="truncate">{ctaLabel}</span>
          </a>
        ))}
    </div>
  );
}
