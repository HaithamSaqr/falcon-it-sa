import type { Bi } from "../bi";
import { CLIENT_LOGOS, clientLogoPath } from "@/lib/db/client-logos";

/**
 * The owner's approved client logos, cleaned and bundled under
 * public/images/v2/clients (see src/lib/db/client-logos.ts). The logo wall
 * shows the `clients` table; these are only the fallback when that table is
 * empty or the database is unreachable.
 */
export const V2_CLIENT_LOGOS: { name: Bi; logo: string }[] = CLIENT_LOGOS.map((c) => ({
  name: c.name,
  logo: clientLogoPath(c.slug),
}));
