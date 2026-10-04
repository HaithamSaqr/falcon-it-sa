import type { Metadata } from "next";
import { Alexandria, Schibsted_Grotesk } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import Script from "next/script";
import { isInstalled } from "@/lib/db/config";
import { getSeo, getIntegrations } from "@/lib/data-store";
import { routing } from "@/i18n/routing";
import { clientMessages } from "@/i18n/client-messages";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WhatsAppWidget from "@/components/layout/whatsapp-widget";
import MobileBottomBar from "@/components/layout/mobile-bottom-bar";
import SnapPixel from "@/components/layout/snap-pixel";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { getPublicSettings } from "@/lib/public-settings";
import { JsonLd } from "@/components/v2/json-ld";
import { SITE_URL, organizationLd } from "@/lib/seo";

import "@/app/globals.css";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
});

const alexandria = Alexandria({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-alexandria",
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
  // Pages that call buildMetadata add their own canonical and hreflang.
  const metadataBase = new URL(SITE_URL);
  try {
    const [seo, integrations] = await Promise.all([getSeo(), getIntegrations()]);
    const g = integrations.google;
    return {
      metadataBase,
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
      ...(g?.enabled && g.verification
        ? { verification: { google: g.verification } }
        : {}),
    };
  } catch {
    return { metadataBase };
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

  // Only the namespaces client components read go to the browser.
  const messages = clientMessages(await getMessages());
  const isRTL = locale === "ar";

  // Chrome data (nav, footer, WhatsApp) rendered on the server; the client
  // provider only adds geo-based WhatsApp routing on top.
  const publicSettings = await getPublicSettings();

  // Marketing tags — injected only when enabled in Integrations.
  const integrations = await getIntegrations().catch(() => null);
  const g = integrations?.google;
  const googleOn = !!g?.enabled;
  const gtagId = g?.ga4Id || g?.adsId || "";
  // Snapchat Snap Pixel.
  const snap = integrations?.snapchat;
  const snapOn = !!snap?.enabled && !!snap?.pixelId;

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      // The font variables live on <html> so the `--font-sans` / `--font-arabic`
      // theme tokens (declared on :root) can resolve them.
      className={cn(schibsted.variable, alexandria.variable)}
      suppressHydrationWarning
    >
      <body
        className={cn(isRTL ? "font-arabic" : "font-sans", "antialiased")}
      >
        <JsonLd data={organizationLd(publicSettings)} />

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

        {/* Snapchat Snap Pixel — sitewide (init once + PAGE_VIEW on load & route change) */}
        {snapOn && <SnapPixel pixelId={snap!.pixelId} />}

        <NextIntlClientProvider locale={locale} messages={messages}>
          <SettingsProvider initial={publicSettings}>
            <Navbar settings={publicSettings} />
            <main>{children}</main>
            <Footer settings={publicSettings} />
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
