/**
 * Demo lead attribution (client-safe). "Book a demo" links on sector pages
 * carry `?sector=<slug>&role=<role>`; the demo form preselects its sector
 * field from it and sends both back with the booking, and the demo API stores
 * them in the lead's `data` so the team sees which page and role converted.
 */
import type { Bi } from "@/lib/blocks/bi";
import { V2_SECTORS } from "@/lib/blocks/seed/sectors";

/** A role id: the same short lowercase slug the sector blocks use (`owner`, `fin`, `pm`). */
const ROLE_RE = /^[a-z][a-z0-9_-]{0,23}$/;

/**
 * Form value per v2 sector. The values are the form's existing `industry`
 * values, so Odoo and earlier leads keep reading the same strings;
 * `indServices` is new for the professional services sector.
 */
const SECTOR_INDUSTRY: Record<string, string> = {
  "real-estate": "indRealEstate",
  manufacturing: "indManufacturing",
  trading: "indTrading",
  hospitality: "indHospitality",
  retail: "indRetail",
  logistics: "indLogistics",
  "professional-services": "indServices",
};

export type DemoSectorOption = {
  /** The form's `industry` value. */
  value: string;
  /** The v2 sector slug, or null for "Other". */
  sector: string | null;
  label: Bi;
};

/** The sector field: the seven v2 sectors in their site order, then Other. */
export const DEMO_SECTOR_OPTIONS: DemoSectorOption[] = [
  ...V2_SECTORS.map((s) => ({ value: SECTOR_INDUSTRY[s.slug], sector: s.slug, label: s.name })),
  { value: "indOther", sector: null, label: { en: "Other", ar: "أخرى" } },
];

const KNOWN_SECTORS = new Set(V2_SECTORS.map((s) => s.slug));

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** True for one of the seven v2 sector slugs. */
export function isKnownSector(slug: unknown): slug is string {
  return typeof slug === "string" && KNOWN_SECTORS.has(slug);
}

/** The sector field value for a v2 sector slug; "" for anything else. */
export function industryForSector(slug: string | null | undefined): string {
  return isKnownSector(slug) ? SECTOR_INDUSTRY[slug] : "";
}

export type LeadAttribution = { sector?: string; role?: string };

/**
 * `sector` and `role` from a request body or URL params, validated: the
 * sector must be a v2 sector slug, the role a short lowercase slug. Anything
 * else (unknown, malformed, not a string, empty) is left out.
 */
export function parseLeadAttribution(input: unknown): LeadAttribution {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const o = input as Record<string, unknown>;
  const out: LeadAttribution = {};
  const sector = clean(o.sector);
  if (isKnownSector(sector)) out.sector = sector;
  const role = clean(o.role);
  if (ROLE_RE.test(role)) out.role = role;
  return out;
}
