import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/page-meta";
import BlockPage, { blocksWith } from "@/components/v2/block-page";
import ContactForm from "@/components/forms/contact-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("contact", locale);
}

/** Contact details from the `contact_info` block (site settings) with the contact form beside them. */
export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const blocks = await blocksWith("contact", "contact_info");
  return <BlockPage page="contact" locale={locale} blocks={blocks} context={{ contactForm: <ContactForm /> }} />;
}
