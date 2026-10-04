import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSectors, updateSectors } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import type { Sector } from "@/types/admin";
import { isSafeImage } from "@/lib/blocks/links";

export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  return jsonSuccess(await getSectors());
}

export async function PUT(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  const body = (await request.json().catch(() => null)) as Sector[] | null;
  if (!Array.isArray(body)) return jsonError("Invalid body", 400);
  for (const s of body) {
    if (s?.photo !== undefined && (typeof s.photo !== "string" || !isSafeImage(s.photo))) {
      return jsonError(`${s?.id ?? "sector"}: photo must be an uploaded image, a /images/ path or an https:// link`, 400);
    }
    const p = s?.shortPromise;
    if (p !== undefined && (typeof p?.en !== "string" || typeof p?.ar !== "string" || p.en.length > 300 || p.ar.length > 300)) {
      return jsonError(`${s?.id ?? "sector"}: short promise must be text up to 300 characters`, 400);
    }
  }
  await updateSectors(body);
  return jsonSuccess({ saved: true }, "Sectors updated");
}
