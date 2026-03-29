import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { getPortalSession } from "@/lib/portal-auth";
import { getHelpdeskCategories } from "@/lib/odoo/client";

// GET — Get helpdesk categories for ticket creation
export async function GET() {
  const session = await getPortalSession();
  if (!session.authenticated) {
    return jsonError("Unauthorized", 401);
  }

  const categories = await getHelpdeskCategories();
  const mapped = categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return jsonSuccess(mapped);
}
