/**
 * Blocks for the `/products` index. The page has no stored blocks: the two
 * ERPs reuse the home comparison (logos, points, links to /erp/*), the
 * supporting services are text-only cards built from the enabled products,
 * and a booking block closes the page.
 */
import type { Bi } from "./bi";
import { b, demoCta } from "./fields";
import { HOME_SEED } from "./seed/home";
import { generalBookingBlock } from "./seed/common";
import type { Block, BlockContentMap } from "./types";

const INDEX_PAGE = "products";

/** One supporting service (server management, data management, applications). */
export interface ProductService {
  slug: string;
  name: Bi;
  line: Bi;
}

function erpCompareContent(): BlockContentMap["erp_compare"] {
  const home = HOME_SEED.find((x) => x.type === "erp_compare");
  if (!home) throw new Error("home seed has no erp_compare block");
  return {
    ...structuredClone(home.content as BlockContentMap["erp_compare"]),
    heading: b("ERP systems and services", "أنظمة ERP والخدمات"),
  };
}

function bookingContent(): BlockContentMap["booking"] {
  const booking = generalBookingBlock();
  return { ...structuredClone(booking.content as BlockContentMap["booking"]), noteTitle: b(""), note: b("") };
}

export function productsIndexBlocks(services: ProductService[]): Block[] {
  const blocks: Block[] = [
    { id: "products-erp", page: INDEX_PAGE, type: "erp_compare", sortOrder: 0, enabled: true, content: erpCompareContent() },
  ];
  if (services.length > 0) {
    blocks.push({
      id: "products-services",
      page: INDEX_PAGE,
      type: "sector_grid",
      sortOrder: blocks.length,
      enabled: true,
      content: {
        heading: b("Services around your ERP", "خدمات تدعم نظامك"),
        intro: b(
          "Servers, data migration and custom apps, handled by the team that sets up your ERP.",
          "الخوادم وترحيل البيانات والتطبيقات المخصصة، يتولاها الفريق الذي يجهّز نظامك.",
        ),
        cards: services.map((s) => ({
          title: s.name,
          line: s.line,
          image: "",
          imageAlt: b(""),
          href: `/products/${s.slug}`,
        })),
        otherCard: {
          title: b("Not sure what you need?", "لست متأكدًا مما تحتاجه؟"),
          line: b(
            "Tell us how your business runs and we will point you to the right system or service.",
            "أخبرنا كيف يسير عملك، وسنرشدك إلى النظام أو الخدمة المناسبة.",
          ),
          ctaLabel: demoCta().label,
          href: "/demo",
        },
      },
    });
  }
  blocks.push({
    id: "products-booking",
    page: INDEX_PAGE,
    type: "booking",
    sortOrder: blocks.length,
    enabled: true,
    content: bookingContent(),
  });
  return blocks;
}
