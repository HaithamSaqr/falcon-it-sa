import { PROFILE_DOWNLOAD_NAME, readProfile } from "@/lib/company-profile";

export const dynamic = "force-dynamic";

// GET /api/company-profile: the uploaded company profile as a PDF download
export async function GET() {
  const data = await readProfile();
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${PROFILE_DOWNLOAD_NAME}"`,
      // Same URL after a replacement: let browsers and Cloudflare revalidate soon.
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
