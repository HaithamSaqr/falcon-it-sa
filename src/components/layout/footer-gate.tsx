"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

/** Sector landing pages (`/sectors/<slug>`) are long; they get the compact footer. */
export function isSectorLanding(pathname: string): boolean {
  return /^\/sectors\/[^/]+/.test(pathname);
}

/**
 * Picks the full or the compact footer from the current path. Both are
 * server-rendered and passed in, and `usePathname` also resolves during SSR,
 * so the HTML is complete without JavaScript.
 */
export default function FooterGate({ full, compact }: { full: ReactNode; compact: ReactNode }) {
  const pathname = usePathname();
  return <>{isSectorLanding(pathname) ? compact : full}</>;
}
