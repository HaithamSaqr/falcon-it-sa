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

interface PublicSettings {
  gulfOnly: boolean;
  loginUrl: string;
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

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PublicSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
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
