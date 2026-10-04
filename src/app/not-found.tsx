import { Alexandria, Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";
import { cn } from "@/lib/utils";

import "@/app/globals.css";

// Same faces and variables as [locale]/layout.tsx, so --font-sans and
// --font-arabic resolve to the v2 fonts here too.
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "800"],
  variable: "--font-schibsted",
  display: "swap",
});

const alexandria = Alexandria({
  subsets: ["arabic"],
  weight: ["300", "600"],
  variable: "--font-alexandria",
  display: "swap",
});

const BUTTON =
  "inline-flex min-h-11 items-center rounded-full px-6 text-[15px] no-underline transition-colors duration-200 outline-brand focus-visible:outline-3 focus-visible:outline-offset-3";

/** Root 404 (URLs outside the locale routes). English first, Arabic below. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={cn(schibsted.variable, alexandria.variable)}>
      <body className="flex min-h-screen items-center justify-center bg-page px-4 font-sans text-ink">
        <main className="max-w-xl text-center">
          <p className="text-[72px] font-extrabold leading-none tracking-[-0.035em] text-muted">404</p>
          <h1 className="mt-4 text-2xl font-extrabold tracking-[-0.02em]">This page could not be found.</h1>
          <p lang="ar" dir="rtl" className="mt-2 font-arabic text-lg font-light text-body">
            لم نعثر على هذه الصفحة.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className={cn(BUTTON, "bg-brand font-semibold text-white hover:bg-brand-deep")}>
              Go to the home page
            </Link>
            <Link
              href="/ar"
              lang="ar"
              className={cn(BUTTON, "bg-surface font-arabic font-semibold text-brand hover:bg-sky")}
            >
              الصفحة الرئيسية
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
