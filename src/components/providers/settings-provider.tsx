"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { safeWhatsapp, type PublicSettings } from "@/lib/public-chrome";

export type {
  PublicSettings,
  PublicBranch,
  PublicFooterLink,
  PublicProduct,
  PublicSector,
  LandingCta,
} from "@/lib/public-chrome";

const SettingsContext = createContext<PublicSettings | null>(null);

/** Public settings rendered by the server (see `getPublicSettings`), plus client WhatsApp routing. */
export function useSettings(): PublicSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}

/**
 * Resolve the effective WhatsApp number for this visitor.
 * Precedence: visitor country (by IP), then request domain, then company.whatsapp.
 * The routing was sanitised on the server; `safeWhatsapp` is the last guard so
 * an Egyptian or placeholder number never becomes the target.
 */
async function resolveWhatsapp(data: PublicSettings, signal: AbortSignal): Promise<string> {
  const routing = data.whatsappRouting;
  const fallback = data.company.whatsapp;
  if (!routing || (!routing.domains?.length && !routing.countries?.length)) return fallback;

  // Country rule: highest priority.
  let countryNumber = "";
  if (routing.countries?.length) {
    try {
      const geo = await fetch("/api/geo", { signal }).then((r) => r.json());
      const country = String(geo?.data?.country || "").toUpperCase();
      if (country) {
        countryNumber = routing.countries.find((c) => c.country.toUpperCase() === country)?.number || "";
      }
    } catch {
      /* ignore geo failure */
    }
  }

  // Domain rule: used when no country rule matched.
  let domainNumber = "";
  if (routing.domains?.length) {
    const host = window.location.hostname.toLowerCase();
    domainNumber =
      routing.domains.find((d) => {
        const dom = d.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
        return dom && (host === dom || host.endsWith("." + dom));
      })?.number || "";
  }

  return safeWhatsapp(countryNumber || domainNumber, fallback);
}

export function SettingsProvider({ initial, children }: { initial: PublicSettings; children: ReactNode }) {
  const [settings, setSettings] = useState<PublicSettings>(initial);

  useEffect(() => {
    const controller = new AbortController();
    resolveWhatsapp(initial, controller.signal).then((whatsapp) => {
      if (controller.signal.aborted || whatsapp === initial.company.whatsapp) return;
      setSettings({ ...initial, company: { ...initial.company, whatsapp } });
    });
    return () => controller.abort();
  }, [initial]);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}
