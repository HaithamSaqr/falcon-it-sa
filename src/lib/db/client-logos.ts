/**
 * The owner's client logos, cleaned by scripts/assets/clean-client-logos.mjs into
 * public/images/v2/clients/<slug>.png, and how they map onto the production
 * `clients` table.
 *
 * The `prod` column reflects production as of 2026-10-04: the row id and the
 * exact `/api/uploads/...` logo that row held then. The one-off data fix
 * `v2-client-logos-2026-10` (src/lib/db/migrate.ts) swaps a row's logo for the
 * clean file only while it still holds that exact upload, fills names only
 * where they are blank, inserts the clients production does not have yet, and
 * never deletes anything. Order is the display order (production sort order,
 * then the new clients).
 *
 * Not mapped, on purpose: production rows `2dee0f69-...` (دايت فتنس) and
 * `100f0e21-...` (دايموند) have no logo and duplicate rows that already carry
 * the Diet Fitness and Diamond Home logos, so they stay hidden as they are.
 */
import type { Bi } from "@/lib/blocks/bi";
import { CLIENT_LOGO_SIZES } from "./client-logo-sizes";

export type ClientLogo = {
  slug: string;
  name: Bi;
  /** Production row this logo belongs to; absent for clients production does not have yet. */
  prod?: { id: string; upload: string };
};

/** Public path of a cleaned logo. */
export const clientLogoPath = (slug: string): string => `/images/v2/clients/${slug}.png`;

/** Box for a logo whose size is unknown (an admin upload): the cleaned logos' canvas. */
export const DEFAULT_LOGO_SIZE: readonly [number, number] = [480, 160];

/**
 * [width, height] of a logo: the real size of a bundled cleaned logo, so its
 * box is reserved before it loads; the default box for anything else.
 */
export function clientLogoSize(src: string): readonly [number, number] {
  const m = /^\/images\/v2\/clients\/([a-z0-9-]+)\.png$/.exec(src);
  return (m && CLIENT_LOGO_SIZES[m[1]]) || DEFAULT_LOGO_SIZE;
}

/** Row id used when a client is inserted by the data fix. */
export const newClientId = (slug: string): string => `v2-client-${slug}`;

const up = (file: string) => `/api/uploads/${file}`;

export const CLIENT_LOGOS: readonly ClientLogo[] = [
  { slug: "capital-safety", name: { en: "Capital Safety Company", ar: "أمان العاصمة" }, prod: { id: "847e9898-0d41-4ad2-ab16-cda9db4df169", upload: up("0f3d43f7-fe74-4127-9eed-c8db20cfbe1a.jpg") } },
  { slug: "zamil", name: { en: "Zamil Group", ar: "مجموعة الزامل" }, prod: { id: "demo-1", upload: up("79182ffa-157d-4877-8f43-abd8e596cdaf.webp") } },
  { slug: "taqnyat", name: { en: "Taqnyat", ar: "تقنيات" }, prod: { id: "demo-2", upload: up("5e37f97e-6d9b-4e3c-9d31-9c55a1dcf6fc.svg") } },
  { slug: "al-tamimi", name: { en: "Al Tamimi", ar: "التميمي" }, prod: { id: "demo-3", upload: up("d9f16699-8ca1-4cba-a840-f539e96547db.png") } },
  { slug: "talween", name: { en: "Talween", ar: "تلوين" }, prod: { id: "demo-4", upload: up("84d4fa94-d548-4567-bcb4-30546d68fe3b.png") } },
  { slug: "smart-care", name: { en: "Smart Care", ar: "سمارت كير" }, prod: { id: "ad762ba5-8110-4637-aee9-92b74ab77d1f", upload: up("2f522e7d-6742-4b6b-8efb-e6fca2964a45.png") } },
  { slug: "saudi-emar", name: { en: "Saudi Emar", ar: "إعمار السعودية" }, prod: { id: "109925b2-eed6-41f8-8f68-b620c70bc8c8", upload: up("304cd69b-f271-404a-a920-517e2676be75.webp") } },
  { slug: "royal-steel", name: { en: "Royal Steel", ar: "رويال ستيل" }, prod: { id: "4819646c-185c-4438-a67b-6abeea0a159c", upload: up("9093bc25-0ff0-4ee1-bea0-98e7e8495a54.jpg") } },
  { slug: "krso", name: { en: "Kurdistan Region Statistics Office", ar: "هيئة إحصاء إقليم كوردستان" }, prod: { id: "9904ce0a-f9ad-4964-bb23-93273e82bf14", upload: up("b7a133af-9560-45c2-b89a-46a365dbb2c2.png") } },
  { slug: "purechem", name: { en: "Purechem", ar: "بيوركيم" }, prod: { id: "e3e2cb33-7eac-4439-bef3-8883644d15db", upload: up("b265f8cd-63ae-458c-9a05-23aca2a55631.jpg") } },
  { slug: "ngd", name: { en: "NGD Developments", ar: "نيو جينريشن" }, prod: { id: "8c4216d5-03c1-4ec0-86a3-1bff730568a5", upload: up("68aef120-bb15-4aef-b2a6-8486d1f8ec42.png") } },
  { slug: "nama-chem", name: { en: "Nama Chem", ar: "نماكيم" }, prod: { id: "c42dbe2d-db75-46f4-8b53-515e08445d7b", upload: up("06eb5270-6b62-4296-a989-8e5e836766ba.jpg") } },
  { slug: "naghi-marine", name: { en: "Naghi Marine", ar: "ناغي للأعمال البحرية" }, prod: { id: "94d5a043-b487-4142-8fd7-c69942446b7d", upload: up("e752cdd5-31cf-4967-8215-e227f08bc4a4.svg") } },
  { slug: "modern-arch-vision", name: { en: "Modern Arch Vision", ar: "مودرن آرك فيجن" }, prod: { id: "db8c052e-3716-4f03-878d-ee005a107046", upload: up("6e64cf62-6026-4fe5-a455-cb278e8d59e1.png") } },
  { slug: "mountain", name: { en: "Mountain", ar: "ماونتن" }, prod: { id: "1e17b143-0b4b-40fe-a0e5-57d21be8befa", upload: up("02f93184-f000-4d50-a199-42d5f9288d04.jpg") } },
  { slug: "marino", name: { en: "Marino Kitchen Equipment", ar: "مارينو لمعدات المطابخ" }, prod: { id: "1eaea6e2-f9a8-49cf-b9f2-c9d5d8997681", upload: up("6bec0a72-6b42-4d15-b21c-1d0f82d34a89.webp") } },
  { slug: "mahara", name: { en: "Mahara", ar: "مهارة" }, prod: { id: "a0009ea6-ec82-4499-bcf8-034b28e621f1", upload: up("9a888dcc-87b7-4449-a616-ebf0ceaa3416.png") } },
  { slug: "lozom", name: { en: "Lozom Pest Control", ar: "لزوم لمكافحة الحشرات" }, prod: { id: "661328d9-9162-4e75-b14a-8019a27427d4", upload: up("f72250d6-63cb-44b5-9eaf-3b4e9065ae03.png") } },
  { slug: "la-verde", name: { en: "La Verde Developments", ar: "لافيردي" }, prod: { id: "61ec0423-c677-4e7d-a01b-762429d47336", upload: up("51a523a7-b9a7-4700-97fa-1f66c5d8bd8f.png") } },
  { slug: "kamco", name: { en: "KAMCO", ar: "كامكو" }, prod: { id: "8df66a6a-8e5f-4dec-a8be-4741a35be63c", upload: up("bc3bc67b-2f1d-413a-82b4-4adec7d82709.webp") } },
  { slug: "inspire", name: { en: "Inspire Contracting", ar: "إنسباير للمقاولات" }, prod: { id: "2b86efe2-3674-4036-991d-c5a6ee3eea6d", upload: up("932f8705-1b0c-4024-b111-e86d115504e9.jpg") } },
  { slug: "haddad-group", name: { en: "Haddad Group", ar: "مجموعة الحداد" }, prod: { id: "07733fc1-97e7-400a-a61e-1fd517cc55be", upload: up("52e13a95-c654-43f9-8f71-c04c4f5a15be.svg") } },
  { slug: "habib-trading", name: { en: "Habib Trading Co.", ar: "شركة حبيب للتجارة" }, prod: { id: "95800565-e9d8-4dc3-a382-3e0b01d3bf11", upload: up("f1b0832f-1b61-425b-a0fb-be3f058aeb77.png") } },
  { slug: "global-conveyor-technology", name: { en: "Global Conveyor Technology", ar: "الدولية لتكنولوجيا السيور الناقلة" }, prod: { id: "5246f635-c074-49c8-bd58-03085a56d628", upload: up("98f7765f-e751-486e-baa6-c3f2b8521fbf.png") } },
  { slug: "geodesy", name: { en: "Geodesy", ar: "جيوديسي" }, prod: { id: "b5e21cc0-5554-48ba-8385-1d783cf84184", upload: up("b65d4b84-69c0-4b1e-a0ac-16c572fe82cb.png") } },
  { slug: "foodx", name: { en: "Food-X", ar: "فودكس" }, prod: { id: "a996648f-596e-4f5d-a689-ec73b63c310a", upload: up("1dfa3c0f-e9de-4f34-9357-1c89e09af0b5.png") } },
  { slug: "elite-construction", name: { en: "Elite Construction", ar: "إيليت للمقاولات" }, prod: { id: "f58a2bf0-df0b-419b-90bd-934c8f8d37f3", upload: up("6be207a0-e270-48e8-8885-cfc893ec3772.png") } },
  { slug: "echo-art", name: { en: "Echo Art", ar: "إيكو آرت" }, prod: { id: "df7dc044-99d1-461e-949a-0edf66f7c14c", upload: up("3b7511e4-ec03-4e46-80e0-7034305a468c.png") } },
  { slug: "diet-fitness", name: { en: "Diet Fitness", ar: "دايت فتنس" }, prod: { id: "78c06b26-411b-4cba-b3f8-8c6489989ddf", upload: up("a07e11d0-c873-421e-9680-7eaa27ad3aec.png") } },
  { slug: "diar", name: { en: "Diar Developments", ar: "الديار" }, prod: { id: "30023a8d-1be5-408e-a65a-9edd0c0008d6", upload: up("c02e3996-371a-4318-8f7a-a0e760586ee1.webp") } },
  { slug: "diamond-home", name: { en: "Diamond Home", ar: "المنزل الماسي" }, prod: { id: "5a0b5b94-c263-4f05-b61a-3b330e1b88f4", upload: up("0b430241-c0c0-40e7-8216-9925c9208175.jpg") } },
  { slug: "business-capital", name: { en: "Business Capital", ar: "بزنس كابيتال" }, prod: { id: "841139ca-691e-4126-a667-ae45b84554bf", upload: up("4f57395c-fdd3-4e68-b107-e6e509aeb6a0.png") } },
  { slug: "benchmark", name: { en: "Benchmark", ar: "بنش مارك" }, prod: { id: "efef4980-5d09-40cb-baec-d3cebfdc2d00", upload: up("bb83c800-014a-4b68-9760-53b41ce13165.png") } },
  { slug: "almada", name: { en: "Al Mada Construction", ar: "مجموعة المدى" }, prod: { id: "26183274-ceae-4b56-bc50-5c3022b35f48", upload: up("e37c8ee1-1284-49fd-88cd-8110c9352aec.png") } },
  { slug: "aldour", name: { en: "Aldour Developments", ar: "الدور المتكاملة" }, prod: { id: "42fa3152-d351-4785-9a05-7d02e4fab856", upload: up("08c61fea-b162-431f-95c6-ff5b20a0c9be.png") } },
  { slug: "al-ameen", name: { en: "Al Ameen Real Estate Development", ar: "الأمين للتطوير العقاري" }, prod: { id: "eccbc5b1-f99b-4a85-996f-5a1143366240", upload: up("35ef5e91-3119-48a7-be5e-23bca35d3956.png") } },
  // Clients production does not have yet (inserted as v2-client-<slug>).
  { slug: "automation-electric", name: { en: "Automation Electric", ar: "أوتوميشن إلكتريك" } },
  { slug: "celia-cosmetics", name: { en: "Celia Cosmetics", ar: "سيليا لمستحضرات التجميل" } },
  { slug: "city-electric", name: { en: "City Electric", ar: "سيتي إلكتريك" } },
  { slug: "dar-elkhebra", name: { en: "Dar Elkhebra", ar: "دار الخبرة" } },
  { slug: "eskan", name: { en: "Eskan Construction", ar: "إسكان للمقاولات" } },
  { slug: "etehad", name: { en: "Etehad Contracting", ar: "الاتحاد للمقاولات" } },
  { slug: "lozom-medical", name: { en: "Lozom Medical Devices", ar: "لزوم للمستلزمات الطبية" } },
  { slug: "points-event", name: { en: "Points Event", ar: "بوينتس إيفنت" } },
  { slug: "tec", name: { en: "T.E.C Taqadum Al-Emar Contracting", ar: "تقدم الإعمار للمقاولات" } },
];

/**
 * Production names known to be wrong (placeholders), replaced only while the row
 * still holds exactly this pair: row 0 carried the Arabic name in the English
 * field and "فالكون" as its Arabic name.
 */
export const CLIENT_NAME_FIXES: readonly { id: string; from: Bi; to: Bi }[] = [
  {
    id: "847e9898-0d41-4ad2-ab16-cda9db4df169",
    from: { en: "امان العاصمة", ar: "فالكون" },
    to: { en: "Capital Safety Company", ar: "أمان العاصمة" },
  },
];
