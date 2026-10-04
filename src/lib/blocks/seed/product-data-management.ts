/** Data management page seed. From DEFAULT_PRODUCTS, the brochure and PRODUCT_CONTENT; no prices. */
import { b } from "../fields";
import { seedPage } from "./helpers";
import { productBlocks } from "./common";

export const PRODUCT_DATA_MANAGEMENT_SEED = seedPage(
  "product:data-management",
  productBlocks({
    title: b("Your data, organised and moved with care.", "بياناتك، منظّمة ومنقولة بعناية."),
    subtitle: b(
      "We analyse your business data and move it from legacy systems to modern software such as Odoo, mapped, cleaned and validated along the way.",
      "نحلّل بيانات عملك وننقلها من الأنظمة القديمة إلى برمجيات حديثة مثل أودو، مع المطابقة والتنظيف والتحقّق في كل خطوة.",
    ),
    featuresHeading: b("What we do with your data.", "ما نفعله ببياناتك."),
    featuresIntro: b(
      "From messy legacy systems to clean, reliable records and dashboards you can act on.",
      "من أنظمة قديمة مبعثرة إلى سجلات نظيفة موثوقة ولوحات تبني عليها قراراتك.",
    ),
    features: [
      {
        icon: "ChartBar",
        title: b("Data analysis", "تحليل البيانات"),
        line: b("Raw data turned into clear, usable insight.", "تحويل البيانات الخام إلى رؤى واضحة قابلة للاستخدام."),
      },
      {
        icon: "ArrowsClockwise",
        title: b("Data migration", "ترحيل البيانات"),
        line: b(
          "From any legacy system to modern platforms such as Odoo or SAP.",
          "من أي نظام قديم إلى منصات حديثة مثل أودو أو SAP.",
        ),
      },
      {
        icon: "Broom",
        title: b("Data cleansing", "تنظيف البيانات"),
        line: b("Duplicates removed, records validated and standardised.", "إزالة التكرار، والتحقّق من السجلات وتوحيدها."),
      },
      {
        icon: "Plugs",
        title: b("Integrations", "التكاملات"),
        line: b("Your tools connected through reliable ETL pipelines.", "ربط أدواتك عبر مسارات ETL موثوقة."),
      },
      {
        icon: "ChartLineUp",
        title: b("Dashboards", "لوحات المتابعة"),
        line: b("Live dashboards for the numbers you decide on.", "لوحات حيّة للأرقام التي تبني عليها قراراتك."),
      },
      {
        icon: "ShieldCheck",
        title: b("Validated transfers", "نقل مُتحقَّق منه"),
        line: b(
          "Every record mapped and checked with you before go-live.",
          "كل سجل مطابق ومُراجع معك قبل التشغيل.",
        ),
      },
    ],
    steps: [
      {
        title: b("Audit", "الفحص"),
        description: b("We analyse your source data.", "نحلّل بيانات المصدر."),
      },
      {
        title: b("Map", "المطابقة"),
        description: b("We map and clean the data.", "نطابق البيانات وننظّفها."),
      },
      {
        title: b("Migrate", "الترحيل"),
        description: b("We transfer it to the new system.", "ننقلها إلى النظام الجديد."),
      },
      {
        title: b("Validate", "التحقّق"),
        description: b("We check accuracy with you and go live.", "نتحقّق من الدقة معك ونبدأ التشغيل."),
      },
    ],
    booking: {
      heading: b("Tell us where your data lives today.", "أخبرنا أين بياناتك اليوم."),
      body: b(
        "In one session we review your current systems and data, then send a written recommendation and scope.",
        "في جلسة واحدة نراجع أنظمتك وبياناتك الحالية، ثم نرسل لك توصية مكتوبة بالنطاق.",
      ),
    },
  }),
);
