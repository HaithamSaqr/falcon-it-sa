import { describe, expect, it } from "vitest";
import { productsIndexBlocks, type ProductService } from "@/lib/blocks/products-index";
import { parseBlock } from "@/lib/blocks/registry";

const services: ProductService[] = [
  { slug: "server-management", name: { en: "Server Management", ar: "إدارة السيرفرات" }, line: { en: "Servers.", ar: "خوادم." } },
  { slug: "data-management", name: { en: "Data Management", ar: "إدارة البيانات" }, line: { en: "Data.", ar: "بيانات." } },
  { slug: "applications", name: { en: "Applications", ar: "التطبيقات" }, line: { en: "Apps.", ar: "تطبيقات." } },
];

describe("productsIndexBlocks", () => {
  it("builds the ERP comparison, a services grid and a booking block that all validate", () => {
    const blocks = productsIndexBlocks(services);
    expect(blocks.map((b) => b.type)).toEqual(["erp_compare", "sector_grid", "booking"]);
    for (const b of blocks) expect(parseBlock(b.type, b.content).ok).toBe(true);
  });

  it("leads with the page heading and links the two ERP cards to /erp/*", () => {
    const [erp] = productsIndexBlocks(services);
    if (erp.type !== "erp_compare") throw new Error("expected erp_compare first");
    expect(erp.content.heading).toEqual({ en: "ERP systems and services", ar: "أنظمة ERP والخدمات" });
    expect(erp.content.falcon.link.href).toBe("/erp/falcon");
    expect(erp.content.odoo.link.href).toBe("/erp/odoo");
    expect(erp.content.falcon.logo).toMatch(/logo-falcon-erp/);
    expect(erp.content.odoo.logo).toMatch(/logo-odoo/);
  });

  it("makes one text-only card per supporting service, in the order given, linking to its page", () => {
    const grid = productsIndexBlocks(services)[1];
    if (grid.type !== "sector_grid") throw new Error("expected sector_grid second");
    expect(grid.content.cards.map((c) => c.href)).toEqual(services.map((s) => `/products/${s.slug}`));
    expect(grid.content.cards.map((c) => c.title)).toEqual(services.map((s) => s.name));
    expect(grid.content.cards.every((c) => c.image === "")).toBe(true);
  });

  it("drops the services grid when there is no supporting service", () => {
    expect(productsIndexBlocks([]).map((b) => b.type)).toEqual(["erp_compare", "booking"]);
  });

  it("has no dash characters in its copy", () => {
    expect(JSON.stringify(productsIndexBlocks(services))).not.toMatch(/[–—]/);
  });
});
