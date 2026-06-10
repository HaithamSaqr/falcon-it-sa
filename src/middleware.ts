import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Setup wizard: bypass i18n entirely (install gate lives in layouts) ──
  if (pathname === "/setup" || pathname.startsWith("/setup/")) {
    return NextResponse.next();
  }

  // ── Admin routes: bypass i18n, check auth cookie ──────────────────
  if (pathname.startsWith("/admin")) {
    // Login page is public
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    // All other admin pages require session cookie (fast check; full JWT verification in layout)
    const token = request.cookies.get("falcon_admin_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── All other routes: i18n middleware ──────────────────────────────
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(ar|en)/:path*",
    "/admin/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)"],
};
