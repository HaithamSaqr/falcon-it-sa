/**
 * Pricing formula (all base values are in USD).
 *
 *   regular        = users × pricePerUser + hosting + operating + trainingCostPerDay × trainingDays
 *   baseDiscount   = regular × discountPercent / 100
 *   volumeDiscount = regular × volumeDiscountPercent / 100   (from highest matching tier)
 *   total          = regular − baseDiscount − volumeDiscount
 *
 * Per-sector/per-system overrides replace individual fields when present.
 * EGP figures are USD × usdToEgp. SAR figures are USD × usdToSar.
 */

import type { PricingBase, SectorPricingOverride, SectorSystem, VolumeDiscountTier } from "@/types/admin";

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
  volumeDiscountPercent: number;
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

function resolveVolumeDiscount(tiers: VolumeDiscountTier[], users: number): number {
  if (!tiers.length) return 0;
  const sorted = [...tiers].sort((a, b) => b.minUsers - a.minUsers);
  return sorted.find((t) => users >= t.minUsers)?.discountPercent ?? 0;
}

export function computePrice(
  base: PricingBase,
  users: number,
  override?: SectorPricingOverride | null,
  system?: SectorSystem | "" | null
): PriceBreakdown {
  const u = Math.max(1, Math.floor(Number(users) || 1));
  const pricePerUser = override?.pricePerUser ?? base.pricePerUser;
  const operating = override?.operatingCosts ?? base.operatingCosts;
  const systemDefault = (system ? base.systemTrainingDays?.[system as SectorSystem] : undefined) ?? base.trainingDays;
  const trainingDays = override?.trainingDays ?? systemDefault;
  const hosting = override?.hostingPrice ?? base.hostingPrice;
  const discountPercent = override?.discountPercent ?? base.discountPercent;
  const volumeTiers = override?.volumeDiscounts ?? base.volumeDiscounts ?? [];

  const trainingCost = base.trainingCostPerDay * trainingDays;
  const regular = u * pricePerUser + hosting + operating + trainingCost;
  const volumeDiscountPercent = resolveVolumeDiscount(volumeTiers, u);
  const totalDiscountPercent = Math.min(100, discountPercent + volumeDiscountPercent);
  const discount = regular * (totalDiscountPercent / 100);
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
    discountPercent,
    volumeDiscountPercent,
    discount,
    total,
    usdToEgp: base.usdToEgp,
    usdToSar: base.usdToSar,
  };
}
