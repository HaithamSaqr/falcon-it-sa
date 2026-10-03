import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pickBi } from "@/lib/blocks/bi";
import { parseLeadAttribution } from "@/lib/lead-attribution";
import { pageMetadata } from "@/lib/page-meta";
import BlockPage, { blocksWith } from "@/components/v2/block-page";
import DemoForm from "@/components/forms/demo-form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("demo", locale);
}

/** First value of a query parameter. */
function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * The demo booking page: the `demo_form` block (heading and copy from the CMS)
 * frames the booking form island. `?sector=` and `?role=` from "Book a demo"
 * links preselect the sector and travel with the booking.
 */
export default async function DemoPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale === "ar" ? "ar" : "en";
  const query = await searchParams;
  const attribution = parseLeadAttribution({ sector: first(query.sector), role: first(query.role) });

  // Booking is the main conversion: the form always shows (see blocksWith).
  const blocks = await blocksWith("demo", "demo_form");
  const frame = blocks.find((b) => b.type === "demo_form");
  const submitLabel = frame?.type === "demo_form" ? pickBi(frame.content.submitLabel, lang) : undefined;

  return (
    <BlockPage
      page="demo"
      locale={locale}
      blocks={blocks}
      context={{ demoForm: <DemoForm attribution={attribution} submitLabel={submitLabel} /> }}
    />
  );
}
