import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import Script from "next/script";
import { isInstalled } from "@/lib/db/config";
import { getSeo, getIntegrations } from "@/lib/data-store";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WhatsAppWidget from "@/components/layout/whatsapp-widget";
import MobileBottomBar from "@/components/layout/mobile-bottom-bar";
import { SettingsProvider } from "@/components/providers/settings-provider";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

// Run per-request so the first-run install gate is always evaluated freshly.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  try {
    const [seo, integrations] = await Promise.all([getSeo(), getIntegrations()]);
    const g = integrations.google;
    return {
      title: isAr ? seo.metaTitle.ar : seo.metaTitle.en,
      description: isAr ? seo.metaDescription.ar : seo.metaDescription.en,
      keywords: (isAr ? seo.metaKeywords.ar : seo.metaKeywords.en)
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      openGraph: {
        title: isAr ? seo.metaTitle.ar : seo.metaTitle.en,
        description: isAr ? seo.metaDescription.ar : seo.metaDescription.en,
        images: seo.ogImage ? [{ url: seo.ogImage }] : [],
        locale: isAr ? "ar_SA" : "en_US",
        type: "website",
      },
      alternates: { languages: { en: "/en", ar: "/ar" } },
      ...(g?.enabled && g.verification
        ? { verification: { google: g.verification } }
        : {}),
    };
  } catch {
    return {};
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // First-run: send visitors to the quick-setup wizard until the DB is configured.
  if (!(await isInstalled())) {
    redirect("/setup");
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const isRTL = locale === "ar";

  // Google tags (GTM / GA4 / Ads) — injected only when enabled in Integrations.
  const g = (await getIntegrations().catch(() => null))?.google;
  const googleOn = !!g?.enabled;
  const gtagId = g?.ga4Id || g?.adsId || "";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          tajawal.variable,
          isRTL ? "font-arabic" : "font-sans",
          "antialiased"
        )}
      >
        {/* Google Tag Manager (noscript) */}
        {googleOn && g?.gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${g.gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        <NextIntlClientProvider locale={locale} messages={messages}>
          <SettingsProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppWidget />
            <MobileBottomBar />
          </SettingsProvider>
        </NextIntlClientProvider>

        {/* Google Tag Manager */}
        {googleOn && g?.gtmId && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${g.gtmId}');`}
          </Script>
        )}

        {/* Google Analytics 4 / Google Ads (gtag.js) */}
        {googleOn && gtagId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${g?.ga4Id ? `gtag('config', '${g.ga4Id}');` : ""}
${g?.adsId ? `gtag('config', '${g.adsId}');` : ""}`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
