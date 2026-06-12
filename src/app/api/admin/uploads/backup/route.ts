import { requireAuth } from "@/lib/auth";
import { dumpUploads } from "@/lib/uploads-backup";
import { jsonError } from "@/lib/api-helpers";

// GET /api/admin/uploads/backup — download a JSON backup of all uploaded images
export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  try {
    const backup = await dumpUploads();
    const date = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(backup), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="falcon-images-${date}.json"`,
      },
    });
  } catch (err) {
    return jsonError("Images backup failed: " + (err instanceof Error ? err.message : "error"), 500);
  }
}
