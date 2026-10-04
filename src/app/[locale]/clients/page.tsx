import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPageBlocks } from "@/lib/blocks/store";
import { b, noCta } from "@/lib/blocks/fields";
import { generalBookingBlock } from "@/lib/blocks/seed/common";
import { seedPage } from "@/lib/blocks/seed/helpers";
import type { Block } from "@/lib/blocks/types";
import { pageMetadata } from "@/lib/page-meta";
import BlockPage from "@/components/v2/block-page";

type Props = { params: Promise<{ locale: string }> };

/**
 * The clients page when the CMS holds no `clients` blocks: the full logo wall
 * (clients table, bundled approved logos as the fallback) and the booking block.
 */
const DEFAULT_BLOCKS: Block[] = seedPage("clients", [
  {
    type: "logo_wall",
    content: {
      heading: b("Our clients", "عملاؤنا"),
      intro: b(
        "Companies that run on ERPs our team implemented.",
        "شركات تعمل على أنظمة ERP نفّذها فريقنا.",
      ),
      limit: 60,
      link: noCta(),
    },
  },
  generalBookingBlock(),
]).map((blk, i) => ({ ...blk, id: `default:clients:${i}` }) as Block);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("clients", locale);
}

export default async function ClientsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const stored = await getPageBlocks("clients");
  return <BlockPage page="clients" locale={locale} blocks={stored.length > 0 ? stored : DEFAULT_BLOCKS} />;
}
