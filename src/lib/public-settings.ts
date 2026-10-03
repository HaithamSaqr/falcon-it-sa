/**
 * Server-side public settings for the layout chrome. The locale layout passes
 * the result to the client SettingsProvider as `initial`, so the SSR HTML
 * already holds the nav, footer links, products and sectors; the client only
 * adds geo-based WhatsApp routing. `/api/settings/public` returns the same data.
 */
import { getFooterLinks, getIntegrations, getProducts, getSectors, getSettings } from "@/lib/data-store";
import { buildPublicSettings, type PublicSettings } from "@/lib/public-chrome";

export type { PublicSettings } from "@/lib/public-chrome";

export async function getPublicSettings(): Promise<PublicSettings> {
  // Every getter falls back to defaults on its own when the DB is unreachable.
  const [settings, footerLinks, products, sectors, integrations] = await Promise.all([
    getSettings(),
    getFooterLinks(),
    getProducts(true),
    getSectors(true),
    getIntegrations(),
  ]);
  return buildPublicSettings({ settings, footerLinks, products, sectors, integrations });
}
