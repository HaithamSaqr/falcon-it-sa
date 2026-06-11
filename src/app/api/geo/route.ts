import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/api-helpers";

const SAR_COUNTRIES = new Set(["SA", "AE", "QA", "KW", "BH", "OM"]);

// GET /api/geo — best-effort country detection for currency selection.
// Detection order: CDN header → IP lookup → default SAR.
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
      /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
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

  // Unknown country → default to SAR
  const currency = country === "EG" ? "EGP" : SAR_COUNTRIES.has(country) ? "SAR" : country ? "USD" : "SAR";
  return jsonSuccess({ country: country || null, currency });
}
