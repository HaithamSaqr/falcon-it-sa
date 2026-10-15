"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicSettings } from "@/lib/public-chrome";

export type {
  PublicSettings,
  PublicBranch,
  PublicFooterLink,
  PublicProduct,
  PublicSector,
  LandingCta,
} from "@/lib/public-chrome";

const SettingsContext = createContext<PublicSettings | null>(null);

/**
 * Public settings rendered by the server (see `getPublicSettings`). The phone
 * and WhatsApp number are already the ones for this visitor's country.
 */
export function useSettings(): PublicSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}

export function SettingsProvider({ initial, children }: { initial: PublicSettings; children: ReactNode }) {
  return <SettingsContext.Provider value={initial}>{children}</SettingsContext.Provider>;
}
