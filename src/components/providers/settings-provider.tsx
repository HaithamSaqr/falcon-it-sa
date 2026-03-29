"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { COMPANY } from "@/lib/constants";

interface PublicSettings {
  gulfOnly: boolean;
  company: {
    name: { en: string; ar: string };
    email: string;
    phone: { ksa: string; egypt?: string };
    whatsapp: string;
    address: {
      ksa: { en: string; ar: string };
      egypt?: { en: string; ar: string };
    };
  };
  social: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
}

// Default from constants (used before API response arrives)
const DEFAULT_SETTINGS: PublicSettings = {
  gulfOnly: false,
  company: {
    name: COMPANY.name as unknown as { en: string; ar: string },
    email: COMPANY.email,
    phone: COMPANY.phone,
    whatsapp: COMPANY.whatsapp,
    address: COMPANY.address as unknown as PublicSettings["company"]["address"],
  },
  social: COMPANY.social as unknown as PublicSettings["social"],
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
