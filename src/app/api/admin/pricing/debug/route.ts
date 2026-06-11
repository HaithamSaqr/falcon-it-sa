import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { query } from "@/lib/db/pool";

/** GET /api/admin/pricing/debug — returns raw sector_pricing rows for diagnosing mismatches */
export async function GET() {
  if (process.env.NODE_ENV === "production") return jsonError("Not available in production", 403);
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  try {
    const rows = await query("SELECT * FROM sector_pricing ORDER BY sector_id, system");
    const sectors = await query("SELECT id, name_en FROM sectors ORDER BY id");
    const base = await query("SELECT * FROM pricing_base WHERE id = 1");
    return jsonSuccess({
      sector_pricing: rows.rows,
      sectors: sectors.rows,
      pricing_base: base.rows[0] ?? null,
    });
  } catch (err) {
    return jsonError(String(err), 500);
  }
}
