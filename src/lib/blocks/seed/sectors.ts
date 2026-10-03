import type { Sector } from "@/types/admin";
import type { Bi } from "../bi";

/**
 * The seven v2 sectors. Slugs are the existing `sectors.id` values in
 * production. Used by the `v2-sector-slugs` data fix (src/lib/db/migrate.ts),
 * the home sector grid seed and the in-memory fallback when the DB is down.
 */
export interface V2Sector {
  slug: string;
  name: Bi;
  /** One-line promise shown on sector cards (`sectors.short_promise_*`). */
  promise: Bi;
  /** Card and hero photo (`sectors.photo`). */
  photo: string;
  photoAlt: Bi;
}

export const V2_SECTORS: V2Sector[] = [
  {
    slug: "real-estate",
    name: { en: "Real estate and construction", ar: "العقارات والمقاولات" },
    promise: {
      en: "Developers, contractors and brokers, from land to keys.",
      ar: "للمطوّرين والمقاولين والوسطاء، من الأرض إلى المفتاح.",
    },
    photo: "/images/v2/photo-realestate.jpg",
    photoAlt: {
      en: "Residential tower under construction in Riyadh at dusk",
      ar: "برج سكني قيد الإنشاء في الرياض وقت الغروب",
    },
  },
  {
    slug: "manufacturing",
    name: { en: "Manufacturing", ar: "التصنيع" },
    promise: {
      en: "Real cost per product, from raw material to finished goods.",
      ar: "التكلفة الحقيقية لكل منتج، من المادة الخام إلى المنتج النهائي.",
    },
    photo: "/images/v2/photo-manufacturing.jpg",
    photoAlt: {
      en: "Automated production line in a modern factory",
      ar: "خط إنتاج آلي في مصنع حديث",
    },
  },
  {
    slug: "trading",
    name: { en: "Trading and distribution", ar: "التجارة والتوزيع" },
    promise: {
      en: "Price lists, credit limits and stock across every warehouse.",
      ar: "قوائم الأسعار وحدود الائتمان والمخزون في كل مستودعاتك.",
    },
    photo: "/images/v2/photo-distribution.jpg",
    photoAlt: {
      en: "Distribution warehouse aisle with pallet racking and a forklift",
      ar: "ممر في مستودع توزيع برفوف تخزين ورافعة شوكية",
    },
  },
  {
    slug: "hospitality",
    name: { en: "Restaurants and hospitality", ar: "المطاعم والضيافة" },
    promise: {
      en: "Recipes, branches, POS and food cost, shift by shift.",
      ar: "الوصفات والفروع ونقاط البيع وتكلفة الطعام، وردية بوردية.",
    },
    photo: "/images/v2/photo-restaurants.jpg",
    photoAlt: {
      en: "Restaurant kitchen pass with plated dishes under heat lamps",
      ar: "منصة التقديم في مطبخ مطعم وأطباق جاهزة تحت مصابيح التسخين",
    },
  },
  {
    slug: "retail",
    name: { en: "Retail and e-commerce", ar: "التجزئة والتجارة الإلكترونية" },
    promise: {
      en: "Stores, POS and online, sharing one stock and one price list.",
      ar: "الفروع ونقاط البيع والمتجر الإلكتروني، بمخزون واحد وقائمة أسعار واحدة.",
    },
    photo: "/images/v2/photo-retail.jpg",
    photoAlt: {
      en: "Modern retail store with a glowing checkout counter",
      ar: "متجر تجزئة حديث بكاونتر دفع مضاء",
    },
  },
  {
    slug: "logistics",
    name: { en: "Logistics and fleet", ar: "الخدمات اللوجستية والأساطيل" },
    promise: {
      en: "Trips, fuel and maintenance costed per contract.",
      ar: "الرحلات والوقود والصيانة، بتكلفتها على كل عقد.",
    },
    photo: "/images/v2/photo-logistics.jpg",
    photoAlt: {
      en: "Delivery trucks at a loading dock at dusk",
      ar: "شاحنات توصيل عند رصيف التحميل وقت الغروب",
    },
  },
  {
    slug: "professional-services",
    name: { en: "Services and professional", ar: "الخدمات والأعمال المهنية" },
    promise: {
      en: "Timesheets, projects and invoices that finally match.",
      ar: "ساعات العمل والمشاريع والفواتير، متطابقة أخيرًا.",
    },
    photo: "/images/v2/photo-hero-office.jpg",
    photoAlt: {
      en: "Falcon ERP sales dashboard on an office monitor, Riyadh skyline behind",
      ar: "لوحة مبيعات فالكون ERP على شاشة مكتب، وخلفها أفق الرياض",
    },
  },
];

export const V2_SECTOR_SLUGS = V2_SECTORS.map((s) => s.slug);

/**
 * In-memory equivalent of the `v2-sector-slugs` data fix, for the fallback
 * used when the app is not installed or the database is down: the seven v2
 * sectors enabled with their v2 names, photos and promises (in v2 order), every
 * other sector kept but disabled.
 */
export function withV2Sectors(sectors: Sector[]): Sector[] {
  const order = new Map(V2_SECTORS.map((s, i) => [s.slug, i]));
  const out: Sector[] = sectors.map((s) => {
    const i = order.get(s.id);
    if (i === undefined) return { ...s, enabled: false };
    const v = V2_SECTORS[i];
    return { ...s, name: v.name, photo: v.photo, shortPromise: v.promise, enabled: true, sortOrder: i };
  });
  V2_SECTORS.forEach((v, i) => {
    if (out.some((s) => s.id === v.slug)) return;
    out.push({
      id: v.slug,
      icon: "",
      gradient: "",
      name: v.name,
      title: v.name,
      description: { en: "", ar: "" },
      systems: ["desktop", "cloud", "odoo"],
      videoUrl: "",
      videoDomains: [],
      videoCountries: [],
      ctaDomains: [],
      ctaCountries: [],
      featured: false,
      enabled: true,
      sortOrder: i,
      photo: v.photo,
      shortPromise: v.promise,
    });
  });
  return out.sort((a, b) => Number(b.enabled) - Number(a.enabled) || a.sortOrder - b.sortOrder);
}
