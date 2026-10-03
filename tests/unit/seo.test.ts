/**
 * Task 6: SEO infrastructure. The data store is mocked so these run without a
 * database; the e2e spec covers the real pages.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  getPageSeo: vi.fn(),
  getSeo: vi.fn(),
  getSettings: vi.fn(),
  getSectors: vi.fn(),
  getProducts: vi.fn(),
}));

vi.mock("@/lib/data-store", () => store);

import {
  SITE_URL,
  absoluteUrl,
  alternatesFor,
  breadcrumbLd,
  buildMetadata,
  faqLd,
  localizedPath,
  organizationLd,
} from "@/lib/seo";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { buildPublicSettings } from "@/lib/public-chrome";
import {
  DEFAULT_FOOTER_LINKS,
  DEFAULT_INTEGRATIONS,
  DEFAULT_PRODUCTS,
  DEFAULT_SECTORS,
  DEFAULT_SETTINGS,
} from "@/lib/db/defaults";
import { withV2Sectors } from "@/lib/blocks/seed/sectors";

const SECTOR_SLUGS = [
  "real-estate",
  "manufacturing",
  "trading",
  "hospitality",
  "retail",
  "logistics",
  "professional-services",
];

const GLOBAL_SEO = {
  metaTitle: { en: "Global title", ar: "عنوان عام" },
  metaDescription: { en: "Global description", ar: "وصف عام" },
  metaKeywords: { en: "a, b", ar: "أ, ب" },
  ogImage: "",
};

beforeEach(() => {
  vi.resetAllMocks();
  store.getPageSeo.mockResolvedValue(null);
  store.getSeo.mockResolvedValue(GLOBAL_SEO);
  store.getSettings.mockResolvedValue({ ...DEFAULT_SETTINGS, blogEnabled: false });
  store.getSectors.mockResolvedValue(withV2Sectors(DEFAULT_SECTORS).filter((s) => s.enabled));
  store.getProducts.mockResolvedValue(DEFAULT_PRODUCTS.filter((p) => p.enabled));
});

describe("paths and alternates", () => {
  it("localizedPath follows localePrefix as-needed", () => {
    expect(localizedPath("/sectors/real-estate", "ar")).toBe("/ar/sectors/real-estate");
    expect(localizedPath("/sectors/real-estate", "en")).toBe("/sectors/real-estate");
    expect(localizedPath("/", "en")).toBe("/");
    expect(localizedPath("/", "ar")).toBe("/ar");
    expect(localizedPath("demo", "ar")).toBe("/ar/demo");
    expect(localizedPath("/demo/", "en")).toBe("/demo");
  });

  it("SITE_URL defaults to the production origin without a trailing slash", () => {
    expect(SITE_URL).toBe("https://falcon-it.sa");
  });

  it("absoluteUrl resolves paths and keeps absolute URLs", () => {
    expect(absoluteUrl("/images/x.jpg")).toBe("https://falcon-it.sa/images/x.jpg");
    expect(absoluteUrl("images/x.jpg")).toBe("https://falcon-it.sa/images/x.jpg");
    expect(absoluteUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
  });

  it("alternatesFor gives absolute canonical, en, ar and x-default (the en URL)", () => {
    const a = alternatesFor("/demo");
    expect(a.canonical).toBe("https://falcon-it.sa/demo");
    expect(a.languages).toEqual({
      en: "https://falcon-it.sa/demo",
      ar: "https://falcon-it.sa/ar/demo",
      "x-default": "https://falcon-it.sa/demo",
    });
    expect(alternatesFor("/demo", "ar").canonical).toBe("https://falcon-it.sa/ar/demo");
    expect(alternatesFor("/").languages.ar).toBe("https://falcon-it.sa/ar");
    expect(alternatesFor("/").languages["x-default"]).toBe("https://falcon-it.sa/");
  });
});

describe("buildMetadata", () => {
  const fallbackTitle = { en: "Book a demo", ar: "احجز عرضًا تجريبيًا" };
  const fallbackDescription = { en: "See it live.", ar: "شاهده مباشرة." };

  it("uses the page_seo row for the locale first", async () => {
    store.getPageSeo.mockResolvedValue({
      page: "demo",
      title: { en: "Seo title", ar: "عنوان" },
      description: { en: "Seo desc", ar: "وصف" },
      ogImage: "/api/uploads/og.png",
    });
    const m = await buildMetadata({ page: "demo", path: "/demo", locale: "ar", fallbackTitle, fallbackDescription });
    expect(m.title).toBe("عنوان | Falcon");
    expect(m.description).toBe("وصف");
    expect((m.openGraph as { images: { url: string }[] }).images[0].url).toBe(
      "https://falcon-it.sa/api/uploads/og.png",
    );
    expect(m.alternates?.canonical).toBe("https://falcon-it.sa/ar/demo");
  });

  it("falls back to the page fallback, then to the global SEO", async () => {
    const m = await buildMetadata({ page: "demo", path: "/demo", locale: "en", fallbackTitle, fallbackDescription });
    expect(m.title).toBe("Book a demo | Falcon");
    expect(m.description).toBe("See it live.");

    const g = await buildMetadata({
      page: "home",
      path: "/",
      locale: "en",
      fallbackTitle: { en: "", ar: "" },
      fallbackDescription: { en: "", ar: "" },
    });
    expect(g.title).toBe("Global title");
    expect(g.description).toBe("Global description");
  });

  it("empty row text falls through to the fallback", async () => {
    store.getPageSeo.mockResolvedValue({
      page: "demo",
      title: { en: "", ar: "" },
      description: { en: "", ar: "" },
      ogImage: "",
    });
    const m = await buildMetadata({ page: "demo", path: "/demo", locale: "en", fallbackTitle, fallbackDescription });
    expect(m.title).toBe("Book a demo | Falcon");
  });

  it("does not double the brand when the title already carries it", async () => {
    const m = await buildMetadata({
      page: "about",
      path: "/about",
      locale: "en",
      fallbackTitle: { en: "About Falcon Smart Solutions", ar: "" },
      fallbackDescription,
    });
    expect(m.title).toBe("About Falcon Smart Solutions");
  });

  it("og:image is absolute and defaults to the hero photo", async () => {
    const m = await buildMetadata({ page: "demo", path: "/demo", locale: "en", fallbackTitle, fallbackDescription });
    const og = m.openGraph as { images: { url: string }[]; url: string; locale: string };
    expect(og.images[0].url).toBe("https://falcon-it.sa/images/v2/photo-hero-office.jpg");
    expect(og.url).toBe("https://falcon-it.sa/demo");
    expect(og.locale).toBe("en_US");
    const tw = m.twitter as { card: string; images: string[] };
    expect(tw.card).toBe("summary_large_image");
    expect(tw.images[0]).toBe("https://falcon-it.sa/images/v2/photo-hero-office.jpg");
  });

  it("uses the global og image when it is set, resolved against SITE_URL", async () => {
    store.getSeo.mockResolvedValue({ ...GLOBAL_SEO, ogImage: "/api/uploads/global.png" });
    const m = await buildMetadata({ page: "demo", path: "/demo", locale: "en", fallbackTitle, fallbackDescription });
    expect((m.openGraph as { images: { url: string }[] }).images[0].url).toBe(
      "https://falcon-it.sa/api/uploads/global.png",
    );
  });

  it("emits hreflang en, ar and x-default (the en URL)", async () => {
    const m = await buildMetadata({
      page: "sector:real-estate",
      path: "/sectors/real-estate",
      locale: "ar",
      fallbackTitle,
      fallbackDescription,
    });
    expect(m.alternates?.languages).toEqual({
      en: "https://falcon-it.sa/sectors/real-estate",
      ar: "https://falcon-it.sa/ar/sectors/real-estate",
      "x-default": "https://falcon-it.sa/sectors/real-estate",
    });
  });

  it("still returns metadata when the data store throws", async () => {
    store.getPageSeo.mockRejectedValue(new Error("db down"));
    store.getSeo.mockRejectedValue(new Error("db down"));
    const m = await buildMetadata({ page: "demo", path: "/demo", locale: "en", fallbackTitle, fallbackDescription });
    expect(m.title).toBe("Book a demo | Falcon");
    expect(m.alternates?.canonical).toBe("https://falcon-it.sa/demo");
  });
});

describe("sitemap", () => {
  const urls = (entries: Awaited<ReturnType<typeof sitemap>>) => entries.map((e) => e.url);

  it("lists every enabled sector in both locales with alternates", async () => {
    const entries = await sitemap();
    const u = urls(entries);
    for (const slug of SECTOR_SLUGS) {
      expect(u).toContain(`https://falcon-it.sa/sectors/${slug}`);
      expect(u).toContain(`https://falcon-it.sa/ar/sectors/${slug}`);
    }
    const re = entries.find((e) => e.url === "https://falcon-it.sa/sectors/real-estate");
    expect(re?.alternates?.languages).toMatchObject({
      en: "https://falcon-it.sa/sectors/real-estate",
      ar: "https://falcon-it.sa/ar/sectors/real-estate",
    });
  });

  it("includes the static pages in both locales", async () => {
    const u = urls(await sitemap());
    for (const p of [
      "/",
      "/sectors",
      "/erp/falcon",
      "/erp/odoo",
      "/about",
      "/contact",
      "/demo",
      "/faq",
      "/privacy-policy",
      "/terms",
      "/clients",
    ]) {
      expect(u).toContain(absoluteUrl(localizedPath(p, "en")));
      expect(u).toContain(absoluteUrl(localizedPath(p, "ar")));
    }
  });

  it("includes only the supporting products, never the old ERP product URLs", async () => {
    const u = urls(await sitemap());
    for (const slug of ["server-management", "data-management", "applications"]) {
      expect(u).toContain(`https://falcon-it.sa/products/${slug}`);
      expect(u).toContain(`https://falcon-it.sa/ar/products/${slug}`);
    }
    for (const slug of ["falcon-erp-desktop", "falcon-cloud", "odoo-services"]) {
      expect(u.some((x) => x.includes(`/products/${slug}`))).toBe(false);
    }
  });

  it("excludes /blog while blog_enabled is false", async () => {
    const u = urls(await sitemap());
    expect(u.some((x) => x.includes("/blog"))).toBe(false);
  });

  it("includes /blog in both locales when blog_enabled is true", async () => {
    store.getSettings.mockResolvedValue({ ...DEFAULT_SETTINGS, blogEnabled: true });
    const u = urls(await sitemap());
    expect(u).toContain("https://falcon-it.sa/blog");
    expect(u).toContain("https://falcon-it.sa/ar/blog");
  });

  it("does not throw when the database is down: static list plus seed sectors", async () => {
    store.getSettings.mockRejectedValue(new Error("db down"));
    store.getSectors.mockRejectedValue(new Error("db down"));
    store.getProducts.mockRejectedValue(new Error("db down"));
    const u = urls(await sitemap());
    expect(u).toContain("https://falcon-it.sa/");
    expect(u).toContain("https://falcon-it.sa/ar/demo");
    for (const slug of SECTOR_SLUGS) expect(u).toContain(`https://falcon-it.sa/sectors/${slug}`);
    for (const slug of ["server-management", "data-management", "applications"]) {
      expect(u).toContain(`https://falcon-it.sa/products/${slug}`);
    }
    expect(u.some((x) => x.includes("/blog"))).toBe(false);
  });

  it("has no duplicate URLs", async () => {
    const u = urls(await sitemap());
    expect(new Set(u).size).toBe(u.length);
  });
});

describe("robots", () => {
  it("allows all, disallows admin, setup and api, and points to the sitemap", () => {
    const r = robots();
    const rule = (Array.isArray(r.rules) ? r.rules : [r.rules])[0];
    expect(rule.userAgent).toBe("*");
    expect(([] as string[]).concat(rule.allow ?? [])).toContain("/");
    const disallow = ([] as string[]).concat(rule.disallow ?? []);
    expect(disallow).toEqual(expect.arrayContaining(["/admin", "/setup", "/api"]));
    expect(r.sitemap).toBe("https://falcon-it.sa/sitemap.xml");
  });
});

describe("JSON-LD helpers", () => {
  const settings = buildPublicSettings({
    settings: DEFAULT_SETTINGS,
    footerLinks: DEFAULT_FOOTER_LINKS,
    products: DEFAULT_PRODUCTS,
    sectors: withV2Sectors(DEFAULT_SECTORS),
    integrations: DEFAULT_INTEGRATIONS,
  });

  it("organizationLd uses company data and never mentions Egypt", () => {
    const ld = organizationLd(settings);
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Organization");
    expect(ld.name).toBe("Falcon Smart Solutions");
    expect(ld.url).toBe("https://falcon-it.sa");
    expect(ld.logo).toBe("https://falcon-it.sa/images/v2/falcon-mark.png");
    const json = JSON.stringify(ld);
    expect(json).not.toMatch(/egypt|cairo|مصر|القاهرة|\+20/i);
    expect(JSON.stringify(ld.address)).toContain("SA");
    expect(ld.telephone).toMatch(/^\+966/);
    expect(Array.isArray(ld.sameAs)).toBe(true);
    expect((ld.sameAs as string[]).every((s) => s.startsWith("https://"))).toBe(true);
  });

  it("organizationLd works without settings", () => {
    expect(organizationLd().name).toBe("Falcon Smart Solutions");
  });

  it("faqLd builds a FAQPage", () => {
    const ld = faqLd([{ question: "Q1?", answer: "A1" }]);
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toEqual([
      { "@type": "Question", name: "Q1?", acceptedAnswer: { "@type": "Answer", text: "A1" } },
    ]);
  });

  it("breadcrumbLd builds positioned absolute items", () => {
    const ld = breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Sectors", url: "/sectors" },
    ]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://falcon-it.sa/" },
      { "@type": "ListItem", position: 2, name: "Sectors", item: "https://falcon-it.sa/sectors" },
    ]);
  });
});
