import { getLocale } from "next-intl/server";
import { getSectors } from "@/lib/data-store";
import SectorsGrid from "./sectors-grid";
import type { SectorSystem } from "@/types/admin";

// Which Falcon system each product page represents.
const PRODUCT_SYSTEM: Record<string, SectorSystem> = {
  "falcon-erp-desktop": "desktop",
  "falcon-cloud": "cloud",
  "odoo-services": "odoo",
};

/**
 * "Sectors we serve" on a product page — only sectors linked to this product's
 * system (in the admin). Links open the landing page with the system preset.
 */
export default async function ProductSectors({ slug }: { slug: string }) {
  const system = PRODUCT_SYSTEM[slug];
  if (!system) return null;

  const all = await getSectors(true);
  const filtered = all.filter((s) => s.systems.includes(system));
  if (filtered.length === 0) return null;

  const isAr = (await getLocale()) === "ar";
  return (
    <SectorsGrid
      sectors={filtered}
      system={system}
      showSearch={filtered.length > 6}
      heading={isAr ? "القطاعات التي نخدمها" : "Sectors we serve"}
      subheading={
        isAr
          ? "اختر قطاعك واحصل على عرض سعر فوري لهذا المنتج"
          : "Pick your sector and get an instant quote for this product"
      }
    />
  );
}
