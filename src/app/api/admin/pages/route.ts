import { requireAuth } from "@/lib/auth";
import { listPages } from "@/lib/blocks/store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// GET /api/admin/pages: every known page with its block count.
export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  try {
    return jsonSuccess(await listPages());
  } catch (err) {
    console.error("[admin/pages] list failed:", err);
    return jsonError("Could not load the pages. Check the database connection.", 500);
  }
}
