import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { deleteProfile, getProfileInfo, profileUploadError, saveProfile } from "@/lib/company-profile";

// GET /api/admin/company-profile: is a profile uploaded, and when
export async function GET() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  return jsonSuccess({ profile: await getProfileInfo() });
}

// POST /api/admin/company-profile: multipart "file" (PDF) replaces the profile
export async function POST(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) return jsonError("No file provided", 400);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const problem = profileUploadError(file.name, bytes);
  if (problem) return jsonError(problem, 400);

  await saveProfile(bytes);
  return jsonSuccess({ profile: await getProfileInfo() }, "Company profile uploaded");
}

// DELETE /api/admin/company-profile: remove it (the download button disappears)
export async function DELETE() {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);
  await deleteProfile();
  return jsonSuccess({ profile: null }, "Company profile removed");
}
