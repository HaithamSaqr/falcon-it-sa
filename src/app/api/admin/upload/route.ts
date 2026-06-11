import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAuth } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { UPLOAD_DIR, ALLOWED_EXT, extFromName } from "@/lib/uploads";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// POST /api/admin/upload — multipart file → saved to data/uploads, returns URL
export async function POST(request: NextRequest) {
  const { authenticated } = await requireAuth();
  if (!authenticated) return jsonError("Unauthorized", 401);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) return jsonError("No file provided", 400);

  const ext = extFromName(file.name);
  if (!ALLOWED_EXT[ext]) return jsonError("Unsupported file type", 400);
  if (file.size > MAX_BYTES) return jsonError("File too large (max 5MB)", 400);

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${crypto.randomUUID()}${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return jsonSuccess({ url: `/api/uploads/${filename}` }, "Uploaded");
}
