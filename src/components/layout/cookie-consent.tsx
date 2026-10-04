"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SnapPixel from "@/components/layout/snap-pixel";
import { OPEN_CONSENT_EVENT, consentCookie, snapCookieNames, type Consent } from "@/lib/consent";

const BUTTON =
  "v2-press inline-flex min-h-11 items-center justify-center rounded-full px-5 text-[15px] font-bold leading-none text-white outline-brand focus-visible:outline-3 focus-visible:outline-offset-2";

/** Expires the Snap first-party cookies on this host and its parent domains. */
function clearSnapCookies() {
  const names = snapCookieNames(document.cookie);
  if (names.length === 0) return;
  const parts = location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < parts.length - 1; i++) domains.push(`; Domain=.${parts.slice(i).join(".")}`);
  for (const name of names) {
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; Path=/${d}`;
  }
}

/**
 * Cookie banner for the Snap Pixel, rendered only while Snap is enabled in
 * Integrations. `initial` is the stored choice read on the server: with no
 * choice the banner shows and nothing from Snap loads; Accept loads the pixel
 * at once (no reload); Decline loads nothing. Either choice is kept 12 months.
 * The footer "Cookie settings" button reopens it through OPEN_CONSENT_EVENT.
 * Google tags are not affected.
 */
export default function CookieConsent({ pixelId, initial }: { pixelId: string; initial: Consent | null }) {
  const t = useTranslations("chrome");
  const [consent, setConsent] = useState<Consent | null>(initial);
  const [open, setOpen] = useState(initial === null);
  const panel = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reopen = () => {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  // Reopened from the footer: move focus into the banner so the choice is the next stop.
  useEffect(() => {
    if (open && returnFocus.current) panel.current?.focus();
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus();
    returnFocus.current = null;
  }, []);

  const choose = (value: Consent) => {
    document.cookie = consentCookie(value, location.protocol === "https:");
    if (value === "denied") clearSnapCookies();
    setConsent(value);
    close();
  };

  return (
    <>
      {consent === "granted" && <SnapPixel pixelId={pixelId} />}
      {open && (
        <section
          ref={panel}
          tabIndex={-1}
          data-testid="cookie-consent"
          aria-labelledby="cookie-consent-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          className="animate-settle fixed inset-x-3 bottom-[calc(88px+env(safe-area-inset-bottom,0px))] z-50 flex flex-col gap-4 rounded-[22px] bg-white p-5 text-ink shadow-[0_0_0_1px_rgba(11,26,51,0.08),0_24px_48px_-20px_rgba(12,60,120,0.45)] outline-none sm:inset-x-auto sm:start-6 sm:w-[420px] lg:bottom-6 lg:w-[min(680px,calc(100vw-260px))] lg:flex-row lg:items-center lg:gap-6 lg:py-4 lg:ps-6 lg:pe-4"
        >
          <div className="flex min-w-0 flex-col gap-1.5 lg:flex-1">
            <h2 id="cookie-consent-title" className="text-[17px] font-bold leading-snug tracking-normal">
              {t("consentTitle")}
            </h2>
            <p className="text-[15px] leading-[1.55] text-body rtl:leading-[1.8]">
              {t("consentText")}{" "}
              <Link
                href="/privacy-policy"
                className="rounded-sm font-semibold text-brand underline decoration-brand/30 underline-offset-[3px] outline-brand hover:decoration-brand focus-visible:outline-3 focus-visible:outline-offset-2"
              >
                {t("consentPrivacy")}
              </Link>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 lg:w-[248px] lg:shrink-0">
            <button type="button" onClick={() => choose("granted")} className={`${BUTTON} bg-brand hover:bg-brand-deep`}>
              {t("consentAccept")}
            </button>
            <button type="button" onClick={() => choose("denied")} className={`${BUTTON} bg-ink hover:bg-[#1B2B47]`}>
              {t("consentDecline")}
            </button>
          </div>
        </section>
      )}
    </>
  );
}

/** Footer link that reopens the cookie banner. */
export function CookieSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      {label}
    </button>
  );
}
