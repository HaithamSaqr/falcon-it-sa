import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { isInstalled } from "@/lib/db/config";
import { getSeo } from "@/lib/data-store";
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
    const seo = await getSeo();
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SettingsProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppWidget />
            <MobileBottomBar />
          </SettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
