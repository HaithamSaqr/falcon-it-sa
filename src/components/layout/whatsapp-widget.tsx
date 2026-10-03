"use client";

import { useTranslations } from "next-intl";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { useSettings } from "@/components/providers/settings-provider";
import { useWhatsAppMessage } from "@/hooks/use-whatsapp-message";
import { fireAdsConversion, adsSendTo } from "@/lib/gtag";

/** `wa.me` link with the page-aware greeting; shared by the pill and the mobile bar. */
export function useWhatsAppHref(): string {
  const { company } = useSettings();
  const message = encodeURIComponent(useWhatsAppMessage());
  return `https://wa.me/${company.whatsapp}?text=${message}`;
}

/**
 * Desktop WhatsApp pill (lg and up), in the island style of the navbar.
 * Below lg the mobile bottom bar carries WhatsApp instead.
 */
export default function WhatsAppWidget() {
  const t = useTranslations("chrome");
  const { googleAds } = useSettings();
  const href = useWhatsAppHref();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-widget"
      onClick={() => fireAdsConversion(adsSendTo(googleAds?.adsId, googleAds?.whatsappLabel))}
      aria-label={t("whatsappChat")}
      className="v2-press fixed bottom-6 end-6 z-40 hidden h-[52px] items-center gap-2.5 rounded-full bg-white/90 ps-1.5 pe-5 text-[15px] font-bold leading-none text-ink no-underline shadow-[0_0_0_1px_rgba(11,26,51,0.07),0_20px_40px_-18px_rgba(12,60,120,0.45)] backdrop-blur-[16px] hover:bg-white outline-brand focus-visible:outline-3 focus-visible:outline-offset-3 lg:inline-flex"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-[#EEF2F7]">
        <WhatsappLogoIcon size={20} weight="light" aria-hidden />
      </span>
      {t("whatsapp")}
    </a>
  );
}
