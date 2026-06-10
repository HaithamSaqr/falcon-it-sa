/**
 * Sectors served by Falcon ERP.
 * Each sector gets its own short landing page at /sectors/<slug>.
 * Names & descriptions live in messages/{ar,en}.json under `sectors.items.<slug>`.
 */

export type Sector = {
  slug: string;
  icon: string;
  gradient: string;
};

const GRADIENT_PALETTE = [
  "bg-gradient-to-br from-primary-800 to-primary-600",
  "bg-gradient-to-tr from-primary-900 to-primary-700",
  "bg-gradient-to-bl from-primary-700 to-dark-lighter",
  "bg-gradient-to-r from-dark to-primary-800",
  "bg-gradient-to-tl from-primary-600 to-dark",
  "bg-gradient-to-b from-primary-800 to-primary-500/60",
  "bg-gradient-to-t from-dark-lighter to-primary-700",
  "bg-gradient-to-br from-dark to-primary-600",
  "bg-gradient-to-l from-primary-900 to-primary-700",
] as const;

const SECTOR_DEFS: { slug: string; icon: string }[] = [
  { slug: "retail", icon: "🛍️" },
  { slug: "manufacturing", icon: "🏭" },
  { slug: "construction", icon: "🏗️" },
  { slug: "real-estate", icon: "🏢" },
  { slug: "hospitality", icon: "🍽️" },
  { slug: "healthcare", icon: "🏥" },
  { slug: "education", icon: "🎓" },
  { slug: "logistics", icon: "🚚" },
  { slug: "trading", icon: "📦" },
  { slug: "automotive", icon: "🚗" },
  { slug: "food-beverage", icon: "🍔" },
  { slug: "pharma", icon: "💊" },
  { slug: "professional-services", icon: "💼" },
  { slug: "agriculture", icon: "🌾" },
  { slug: "energy", icon: "⚡" },
  { slug: "fashion", icon: "👗" },
  { slug: "jewelry", icon: "💎" },
  { slug: "nonprofit", icon: "🤝" },
];

export const SECTORS: Sector[] = SECTOR_DEFS.map((s, i) => ({
  ...s,
  gradient: GRADIENT_PALETTE[i % GRADIENT_PALETTE.length],
}));

export function getSector(slug: string): Sector | undefined {
  return SECTORS.find((s) => s.slug === slug);
}

// ── Pricing ────────────────────────────────────────────────────────
// NOTE: Placeholder formula. Replace `calculateSectorCost` with the real
// pricing logic once it is provided. Everything that displays cost reads
// from this single function, so updating it here updates the whole flow.
export const PRICING = {
  /** Cloud plan price per user, per month (SAR). */
  pricePerUserMonthly: 75,
  /** One-off setup/onboarding fee (SAR). Set to 0 to hide. */
  setupFee: 0,
} as const;

export type SectorCost = {
  users: number;
  monthly: number;
  yearly: number;
  setup: number;
};

export function calculateSectorCost(users: number): SectorCost {
  const safeUsers = Math.max(1, Math.floor(Number(users) || 0));
  const monthly = safeUsers * PRICING.pricePerUserMonthly;
  return {
    users: safeUsers,
    monthly,
    yearly: monthly * 12,
    setup: PRICING.setupFee,
  };
}

/**
 * WhatsApp destination for sector lead submissions.
 * wa.me format: international number, digits only (no leading 00 or +).
 */
export const SECTOR_WHATSAPP = "966568406006";
