/**
 * Pricing formula (all base values are in USD).
 *
 *   regular  = users × pricePerUser + hosting + operating + trainingCostPerDay × trainingDays
 *   discount = regular × discountPercent / 100
 *   total    = regular − discount
 *
 * Per-sector/per-system overrides replace pricePerUser, operatingCosts and
 * trainingDays when present; everything else falls back to the base.
 * EGP figures are USD × usdToEgp. SAR figures are USD × usdToSar.
 */

import type { PricingBase, SectorPricingOverride, SectorSystem } from "@/types/admin";

export interface PriceBreakdown {
  users: number;
  pricePerUser: number;
  hosting: number;
  operating: number;
  trainingDays: number;
  trainingCostPerDay: number;
  trainingCost: number;
  regular: number;
  discountPercent: number;
  discount: number;
  total: number;
  usdToEgp: number;
  usdToSar: number;
}

export function findOverride(
  overrides: SectorPricingOverride[],
  sectorId: string,
  system: SectorSystem | "" | null | undefined
): SectorPricingOverride | null {
  if (!system) return null;
  return overrides.find((o) => o.sectorId === sectorId && o.system === system) ?? null;
}

export function computePrice(
  base: PricingBase,
  users: number,
  override?: SectorPricingOverride | null
): PriceBreakdown {
  const u = Math.max(1, Math.floor(Number(users) || 1));
  const pricePerUser = override?.pricePerUser ?? base.pricePerUser;
  const operating = override?.operatingCosts ?? base.operatingCosts;
  const trainingDays = override?.trainingDays ?? base.trainingDays;
  const hosting = base.hostingPrice;
  const trainingCost = base.trainingCostPerDay * trainingDays;
  const regular = u * pricePerUser + hosting + operating + trainingCost;
  const discount = regular * (base.discountPercent / 100);
  const total = regular - discount;
  return {
    users: u,
    pricePerUser,
    hosting,
    operating,
    trainingDays,
    trainingCostPerDay: base.trainingCostPerDay,
    trainingCost,
    regular,
    discountPercent: base.discountPercent,
    discount,
    total,
    usdToEgp: base.usdToEgp,
    usdToSar: base.usdToSar,
  };
}
