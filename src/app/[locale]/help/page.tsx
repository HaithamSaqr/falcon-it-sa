import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("help", locale);
}

/** Kept route (ruling R3): forwards to /contact in the same language, in one hop. */
export default async function HelpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return redirect({ href: "/contact", locale });
}
