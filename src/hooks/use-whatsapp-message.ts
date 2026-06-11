"use client";

import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSettings } from "@/components/providers/settings-provider";

/**
 * Context-aware WhatsApp greeting based on the current route:
 *  - /products/[slug] or /brochure/[slug]  → mentions the product
 *  - /sectors/[slug]                        → mentions the sector (landing page)
 *  - anything else                          → generic greeting
 */
export function useWhatsAppMessage(): string {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const { products, sectors } = useSettings();
  const isAr = locale === "ar";

  // Product pages and product brochures share the product slug.
  const productSlug = pathname.match(/^\/(?:products|brochure)\/([^/]+)/)?.[1];
  if (productSlug) {
    const p = products.find((x) => x.slug === productSlug);
    if (p) return t("common.whatsappProduct", { name: isAr ? p.name.ar : p.name.en });
  }

  const sectorSlug = pathname.match(/^\/sectors\/([^/]+)/)?.[1];
  if (sectorSlug) {
    const s = sectors.find((x) => x.slug === sectorSlug);
    if (s) return t("common.whatsappSector", { name: isAr ? s.name.ar : s.name.en });
  }

  return t("common.whatsappMessage");
}
