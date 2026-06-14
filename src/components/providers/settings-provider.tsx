"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { COMPANY } from "@/lib/constants";

interface BilingualText {
  en: string;
  ar: string;
}

export interface PublicBranch {
  id: string;
  name: BilingualText;
  address: BilingualText;
  phone: string;
}

export interface PublicFooterLink {
  id: string;
  section: string;
  label: BilingualText;
  url: string;
}

export interface PublicProduct {
  slug: string;
  name: BilingualText;
}

export interface PublicSector {
  slug: string;
  name: BilingualText;
}

interface WhatsappRouting {
  domains: { domain: string; number: string }[];
  countries: { country: string; number: string }[];
}

export interface LandingCta {
  mode: "whatsapp" | "url";
  url: string;
  label?: BilingualText;
  note?: BilingualText;
}

interface PublicSettings {
  gulfOnly: boolean;
  loginUrl: string;
  products: PublicProduct[];
  sectors: PublicSector[];
  whatsappRouting?: WhatsappRouting;
  landingCta?: LandingCta;
  /** Public Google Ads conversion config (no secrets). */
  googleAds?: { adsId: string; quoteLabel: string; demoLabel: string; contactLabel: string; whatsappLabel: string };
  company: {
    name: { en: string; ar: string };
    email: string;
    phone: { ksa: string; egypt?: string };
    whatsapp: string;
    branches: PublicBranch[];
  };
  social: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  footerLinks: PublicFooterLink[];
}

// Default from constants (used before API response arrives)
const DEFAULT_SETTINGS: PublicSettings = {
  gulfOnly: false,
  loginUrl: "https://falcon-valley.com",
  products: [],
  sectors: [],
  landingCta: { mode: "whatsapp", url: "", label: { en: "", ar: "" }, note: { en: "", ar: "" } },
  googleAds: { adsId: "", quoteLabel: "", demoLabel: "", contactLabel: "", whatsappLabel: "" },
  company: {
    name: COMPANY.name as unknown as { en: string; ar: string },
    email: COMPANY.email,
    phone: COMPANY.phone,
    whatsapp: COMPANY.whatsapp,
    branches: COMPANY.branches as unknown as PublicBranch[],
  },
  social: { ...(COMPANY.social as unknown as PublicSettings["social"]), tiktok: "" },
  footerLinks: [],
};

const SettingsContext = createContext<PublicSettings>(DEFAULT_SETTINGS);

export function useSettings() {
  return useContext(SettingsContext);
}

/**
 * Resolve the effective WhatsApp number for this visitor.
 * Precedence: visitor country (by IP) → request domain → company.whatsapp.
 */
async function resolveWhatsapp(data: PublicSettings): Promise<PublicSettings> {
  const routing = data.whatsappRouting;
  if (!routing || (!routing.domains?.length && !routing.countries?.length)) return data;

  const fallback = data.company.whatsapp;

  // Layer 2 (country) — highest priority.
  let countryNumber = "";
  if (routing.countries?.length) {
    try {
      const geo = await fetch("/api/geo").then((r) => r.json());
      const country = String(geo?.data?.country || "").toUpperCase();
      if (country) {
        countryNumber = routing.countries.find((c) => c.country.toUpperCase() === country)?.number || "";
      }
    } catch {
      /* ignore geo failure */
    }
  }

  // Layer 1 (domain) — fallback when no country rule matched.
  let domainNumber = "";
  if (routing.domains?.length) {
    const host = window.location.hostname.toLowerCase();
    domainNumber =
      routing.domains.find((d) => {
        const dom = d.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
        return dom && (host === dom || host.endsWith("." + dom));
      })?.number || "";
  }

  const whatsapp = countryNumber || domainNumber || fallback;
  return { ...data, company: { ...data.company, whatsapp } };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PublicSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then(async (data) => {
        if (data.success && data.data) {
          const resolved = await resolveWhatsapp(data.data as PublicSettings);
          setSettings(resolved);
        }
      })
      .catch(() => {
        // Keep defaults on error
      });
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}
