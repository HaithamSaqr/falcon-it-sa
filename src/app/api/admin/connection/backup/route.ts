import { requireAuth } from "@/lib/auth";
import { getPool } from "@/lib/db/pool";
import { dumpDatabase } from "@/lib/db/backup";
import { jsonError } from "@/lib/api-helpers";

// GET /api/admin/connection/backup — download a JSON backup of all tables
export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  try {
    const pool = await getPool();
    const backup = await dumpDatabase(pool);
    const date = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="falcon-backup-${date}.json"`,
      },
    });
  } catch (err) {
    return jsonError("Backup failed: " + (err instanceof Error ? err.message : "error"), 500);
  }
}
