import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/api-helpers";

// GET /api/geo — best-effort country detection for currency selection.
export async function GET(request: NextRequest) {
  let country = (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    ""
  ).toUpperCase();

  if (!country) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const isPrivate =
      !ip ||
      ip.startsWith("127.") ||
      ip.startsWith("::1") ||
      ip.startsWith("10.") ||
      ip.startsWith("192.168.") ||
      ip.startsWith("172.");
    if (ip && !isPrivate) {
      try {
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
          signal: AbortSignal.timeout(2500),
        });
        const d = await res.json();
        if (d?.countryCode) country = String(d.countryCode).toUpperCase();
      } catch {
        /* ignore */
      }
    }
  }

  return jsonSuccess({ country: country || null, currency: country === "EG" ? "EGP" : "USD" });
}
