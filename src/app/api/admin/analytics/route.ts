import { requireAuth } from "@/lib/auth";
import { getAnalytics } from "@/lib/data-store";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";

// GET /api/admin/analytics
export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const analytics = await getAnalytics();
  return jsonSuccess(analytics);
}
