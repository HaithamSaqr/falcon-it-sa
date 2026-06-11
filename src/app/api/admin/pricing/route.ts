import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getPricingBase,
  updatePricingBase,
  getSectorPricing,
  updateSectorPricing,
} from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import type { PricingBase, SectorPricingOverride } from "@/types/admin";

export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const [base, overrides] = await Promise.all([getPricingBase(), getSectorPricing()]);
  return jsonSuccess({ base, overrides });
}

export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const body = (await request.json().catch(() => null)) as {
    base?: PricingBase;
    overrides?: SectorPricingOverride[];
  } | null;
  if (!body?.base) return jsonError("Invalid body", 400);
  await updatePricingBase(body.base);
  if (Array.isArray(body.overrides)) await updateSectorPricing(body.overrides);
  return jsonSuccess({ saved: true }, "Pricing updated");
}
