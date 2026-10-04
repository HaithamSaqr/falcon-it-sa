/**
 * Task 5: public chrome data (navbar, footer, WhatsApp, mobile bar).
 *
 * `buildPublicSettings` turns the admin data into what the public layout and
 * `/api/settings/public` expose. The Egypt office is hidden (owner decision),
 * placeholder phones never reach the page, and WhatsApp never routes to an
 * Egyptian or placeholder number.
 */
import { describe, expect, it } from "vitest";
import {
  SAUDI_WHATSAPP_FALLBACK,
  buildPublicSettings,
  isHiddenPhone,
  isVisibleBranch,
  mentionsEgypt,
  safeSocialHref,
  safeWhatsapp,
  sanitizeWhatsappRouting,
  supportingServices,
} from "@/lib/public-chrome";
import { BLOCKS } from "@/lib/blocks/registry";
import { KEPT_ROUTES, resolveKeptRoute } from "@/lib/kept-routes";
import { BLOCK_TYPES } from "@/lib/blocks/types";
import {
  DEFAULT_FOOTER_LINKS,
  DEFAULT_INTEGRATIONS,
  DEFAULT_PRODUCTS,
  DEFAULT_SECTORS,
  DEFAULT_SETTINGS,
} from "@/lib/db/defaults";
import { withV2Sectors } from "@/lib/blocks/seed/sectors";
import type { FooterLink, SiteSettings } from "@/types/admin";

const KSA = {
  id: "ksa",
  name: { en: "Saudi Arabia Office", ar: "مكتب السعودية" },
  address: { en: "Riyadh, Saudi Arabia", ar: "الرياض، المملكة العربية السعودية" },
  phone: "00966568406006",
};

describe("isHiddenPhone", () => {
  it.each(["", "   ", "+201000000000", "201000000000", "+20 100 000 0000", "00201000000000"])(
    "hides %j",
    (phone) => expect(isHiddenPhone(phone)).toBe(true),
  );

  it("keeps a real Saudi number", () => {
    expect(isHiddenPhone("00966568406006")).toBe(false);
    expect(isHiddenPhone("+966 56 840 6006")).toBe(false);
  });

  it("tolerates missing values", () => {
    expect(isHiddenPhone(undefined)).toBe(true);
    expect(isHiddenPhone(null)).toBe(true);
  });
});

describe("mentionsEgypt", () => {
  it.each(["Egypt Office", "Cairo, Egypt", "EGYPT", "مكتب مصر", "القاهرة، مصر", "cairo branch"])(
    "matches %j",
    (text) => expect(mentionsEgypt(text)).toBe(true),
  );

  it.each(["Riyadh, Saudi Arabia", "مكتب السعودية", "الرياض", ""])("does not match %j", (text) =>
    expect(mentionsEgypt(text)).toBe(false),
  );

  // Whole words only: مصرف (bank) and مصروفات (expenses) contain مصر.
  it.each(["فرع مصر", "القاهرة، مصر", "Cairo office", "وفي مصر", "بمصر", "لمصر", "فمصر", "والقاهرة", "(Egypt)", "egypt."])(
    "matches the whole word in %j",
    (text) => expect(mentionsEgypt(text)).toBe(true),
  );

  it.each([
    "برج مصرف الراجحي، الرياض",
    "مصروفات التشغيل",
    "المصرف الأهلي",
    "مصري",
    "Egyptology",
    "Cairokit",
    "notegypt",
  ])("does not match %j", (text) => expect(mentionsEgypt(text)).toBe(false));
});

describe("isVisibleBranch", () => {
  it("shows a branch with a real phone and an address", () => {
    expect(isVisibleBranch(KSA)).toBe(true);
  });

  it("hides the placeholder Egypt office", () => {
    expect(isVisibleBranch(DEFAULT_SETTINGS.company.branches[1])).toBe(false);
  });

  it("hides an Egypt office even with a real-looking phone and address", () => {
    expect(
      isVisibleBranch({
        id: "eg2",
        name: { en: "Head office", ar: "المكتب الرئيسي" },
        address: { en: "Nasr City, Cairo", ar: "مدينة نصر، القاهرة" },
        phone: "+20 2 1234 5678",
      }),
    ).toBe(false);
  });

  it("hides a branch without a phone", () => {
    expect(isVisibleBranch({ ...KSA, phone: "" })).toBe(false);
  });

  it("hides a branch without an address", () => {
    expect(isVisibleBranch({ ...KSA, address: { en: "", ar: "" } })).toBe(false);
  });
});

describe("safeWhatsapp", () => {
  it("keeps a Saudi number", () => {
    expect(safeWhatsapp("966500000001", "966568406006")).toBe("966500000001");
  });

  it.each(["201000000000", "+201000000000", "00201234567890", "201234567890", "", "  "])(
    "falls back for %j",
    (n) => expect(safeWhatsapp(n, "966568406006")).toBe("966568406006"),
  );

  it("never falls back to an Egyptian number", () => {
    expect(safeWhatsapp("201234567890", "201000000000")).toBe(SAUDI_WHATSAPP_FALLBACK);
  });

  it.each([
    ["+966 56 840 6006", "966568406006"],
    ["00966 56 840 6006", "966568406006"],
    ["(966) 56-840-6006", "966568406006"],
  ])("normalises %j to wa.me digits", (n, want) => expect(safeWhatsapp(n, "966500000001")).toBe(want));

  it("normalises the fallback too", () => {
    expect(safeWhatsapp("", "+966 50 000 0001")).toBe("966500000001");
  });
});

describe("sanitizeWhatsappRouting", () => {
  it("drops Egyptian, placeholder and empty numbers and the EG country rule", () => {
    const r = sanitizeWhatsappRouting({
      domains: [
        { id: "d1", domain: "falcon-it.sa", number: "966500000001" },
        { id: "d2", domain: "falcon-eg.com", number: "201234567890" },
        { id: "d3", domain: "x.com", number: "" },
      ],
      countries: [
        { id: "c1", country: "SA", number: "966500000002" },
        { id: "c2", country: "EG", number: "966500000003" },
        { id: "c3", country: "AE", number: "+201000000000" },
      ],
    });
    expect(r).toEqual({
      domains: [{ domain: "falcon-it.sa", number: "966500000001" }],
      countries: [{ country: "SA", number: "966500000002" }],
    });
  });
});

describe("supportingServices", () => {
  it("lists only the custom products, not the ERP products that moved to /erp", () => {
    const slugs = supportingServices(DEFAULT_PRODUCTS.filter((p) => p.enabled)).map((p) => p.slug);
    expect(slugs).toEqual(["server-management", "data-management", "applications"]);
  });
});

function build(overrides: Partial<SiteSettings> = {}, blogEnabled = false) {
  const settings: SiteSettings = {
    ...DEFAULT_SETTINGS,
    blogEnabled,
    company: { ...DEFAULT_SETTINGS.company, crNumber: "7049432656", vatNumber: "311410985900003" },
    ...overrides,
  };
  return buildPublicSettings({
    settings,
    footerLinks: DEFAULT_FOOTER_LINKS,
    products: DEFAULT_PRODUCTS.filter((p) => p.enabled),
    sectors: withV2Sectors(DEFAULT_SECTORS).filter((s) => s.enabled),
    integrations: DEFAULT_INTEGRATIONS,
  });
}

describe("buildPublicSettings", () => {
  it("never exposes the placeholder Egypt phone or the Egypt office", () => {
    const json = JSON.stringify(build());
    expect(json).not.toContain("201000000000");
    expect(json).not.toMatch(/egypt|cairo|مصر|القاهرة/i);
  });

  it("keeps the Saudi office and number", () => {
    const s = build();
    expect(s.company.branches.map((b) => b.id)).toEqual(["ksa"]);
    expect(s.company.phone.ksa).toBe("00966568406006");
    expect(s.company.whatsapp).toBe("966568406006");
  });

  it("falls back to the Saudi WhatsApp number when the stored one is Egyptian", () => {
    const s = build({ company: { ...DEFAULT_SETTINGS.company, whatsapp: "201000000000" } });
    expect(s.company.whatsapp).toBe(SAUDI_WHATSAPP_FALLBACK);
  });

  it("carries the company registration and VAT numbers", () => {
    const s = build();
    expect(s.company.crNumber).toBe("7049432656");
    expect(s.company.vatNumber).toBe("311410985900003");
  });

  it("exposes the enabled v2 sectors by slug", () => {
    const s = build();
    expect(s.sectors.map((x) => x.slug)).toEqual([
      "real-estate",
      "manufacturing",
      "trading",
      "hospitality",
      "retail",
      "logistics",
      "professional-services",
    ]);
  });

  it("hides blog footer links while the blog is disabled", () => {
    expect(build().footerLinks.some((l) => l.url.startsWith("/blog"))).toBe(false);
    expect(build({}, true).footerLinks.some((l) => l.url === "/blog")).toBe(true);
  });

  it("carries the global primary CTA", () => {
    expect(build().primaryCta).toEqual({
      label: { en: "Book a demo", ar: "احجز عرضًا تجريبيًا" },
      demoUrl: "/demo",
    });
  });
});

describe("block defaults", () => {
  it.each([...BLOCK_TYPES])("%s defaults never mention Egypt", (type) => {
    expect(JSON.stringify(BLOCKS[type].defaults())).not.toMatch(/egypt|cairo|مصر|القاهرة/i);
  });
});

describe("phone display", () => {
  it("formats the Saudi number for people and for tel: links", async () => {
    const { displayPhone, telHref } = await import("@/lib/public-chrome");
    expect(displayPhone("00966568406006")).toBe("+966 56 840 6006");
    expect(telHref("00966568406006")).toBe("tel:+966568406006");
    expect(telHref("+966 56 840 6006")).toBe("tel:+966568406006");
    expect(displayPhone("011 222 3333")).toBe("011 222 3333");
  });
});

describe("kept routes (ruling R3)", () => {
  it("resolves /careers, /help, /partners and /webinars to their page, keeping locale, query and hash", () => {
    expect(resolveKeptRoute("/careers")).toBe("/about");
    expect(resolveKeptRoute("/help")).toBe("/contact");
    expect(resolveKeptRoute("/partners")).toBe("/contact");
    expect(resolveKeptRoute("/webinars")).toBe("/demo");
    expect(resolveKeptRoute("/ar/careers")).toBe("/ar/about");
    expect(resolveKeptRoute("/en/help/")).toBe("/en/contact");
    expect(resolveKeptRoute("/webinars?utm_source=x#top")).toBe("/demo?utm_source=x#top");
  });

  it("leaves every other URL alone", () => {
    for (const u of ["/about", "/careers-old", "/x/careers", "https://example.com/careers", "/constructor", "/__proto__", ""]) {
      expect(resolveKeptRoute(u)).toBe(u);
    }
  });

  it("points footer links at the final destinations, also for old rows still stored as /careers", () => {
    const urls = (links: FooterLink[]) =>
      buildPublicSettings({
        settings: DEFAULT_SETTINGS,
        footerLinks: links,
        products: [],
        sectors: [],
        integrations: DEFAULT_INTEGRATIONS,
      }).footerLinks.map((l) => l.url);
    const stored: FooterLink[] = ["/careers", "/help", "/webinars", "/partners"].map((url, i) => ({
      id: `old${i}`,
      section: "about",
      label: { en: "x", ar: "x" },
      url,
    }));
    expect(urls(stored)).toEqual(["/about", "/contact", "/demo", "/contact"]);
    for (const u of urls(DEFAULT_FOOTER_LINKS)) expect(Object.keys(KEPT_ROUTES)).not.toContain(u);
  });
});

describe("safeSocialHref", () => {
  it("keeps https URLs and trims them", () => {
    expect(safeSocialHref("https://linkedin.com/company/falcon")).toBe("https://linkedin.com/company/falcon");
    expect(safeSocialHref("  https://x.com/falcon  ")).toBe("https://x.com/falcon");
  });

  it.each(["", "   ", "javascript:alert(1)", "data:text/html,x", "http://insecure.example", "//evil.example", "https://a b.example", undefined, null])(
    "drops %j",
    (v) => expect(safeSocialHref(v as string)).toBe(""),
  );
});
