import type { CSSProperties } from "react";
import { Alexandria, Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";

// Same faces as [locale]/layout.tsx. Styles are inline on purpose: importing
// globals.css here adds a root-level CSS chunk that the dev runtime then
// fails to find on locale pages ("No link element found for chunk").
const schibsted = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "800"], display: "swap" });
const alexandria = Alexandria({ subsets: ["arabic"], weight: ["300", "600"], display: "swap" });

// v2 colour tokens (globals.css @theme static).
const C = { page: "#F5F7FA", surface: "#FFFFFF", ink: "#0B1A33", body: "#3A4860", muted: "#5B6880", brand: "#1466C2" };

const button: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 44,
  padding: "0 24px",
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 600,
  textDecoration: "none",
};

/** Root 404 (URLs outside the locale routes). English first, Arabic below. */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        className={schibsted.className}
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          background: C.page,
          color: C.ink,
        }}
      >
        <main style={{ maxWidth: 576, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 72, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.035em", color: C.muted }}>404</p>
          <h1 style={{ margin: "16px 0 0", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
            This page could not be found.
          </h1>
          <p lang="ar" dir="rtl" className={alexandria.className} style={{ margin: "8px 0 0", fontSize: 18, fontWeight: 300, color: C.body }}>
            لم نعثر على هذه الصفحة.
          </p>
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            <Link href="/" style={{ ...button, background: C.brand, color: "#FFFFFF" }}>
              Go to the home page
            </Link>
            <Link href="/ar" lang="ar" className={alexandria.className} style={{ ...button, background: C.surface, color: C.brand }}>
              الصفحة الرئيسية
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
