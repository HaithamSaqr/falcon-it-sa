/** Applications page seed. From DEFAULT_PRODUCTS, the brochure and PRODUCT_CONTENT; no prices. */
import { b } from "../fields";
import { seedPage } from "./helpers";
import { productBlocks } from "./common";

export const PRODUCT_APPLICATIONS_SEED = seedPage(
  "product:applications",
  productBlocks({
    title: b("Apps built around your business.", "تطبيقات مصمّمة حول أعمالك."),
    subtitle: b(
      "From idea to launch, we design and build the apps your business needs: mobile, web and Odoo.",
      "من الفكرة إلى الإطلاق، نصمّم ونبني التطبيقات التي يحتاجها عملك: جوال وويب وأودو.",
    ),
    featuresHeading: b("What we build.", "ما نبنيه."),
    featuresIntro: b(
      "Designed, built and maintained by our own team.",
      "نصمّمها ونبنيها ونصونها بفريقنا.",
    ),
    features: [
      {
        icon: "DeviceMobile",
        title: b("Android & iOS apps", "تطبيقات أندرويد وآيفون"),
        line: b(
          "Native and cross-platform mobile apps, published to the App Store and Google Play.",
          "تطبيقات جوال أصلية ومتعددة المنصات، تُنشر على App Store وGoogle Play.",
        ),
      },
      {
        icon: "Code",
        title: b("Custom applications", "تطبيقات مخصّصة"),
        line: b(
          "Software built around your exact processes: internal tools, portals and customer-facing products.",
          "برمجيات مبنية حول إجراءاتك بالضبط: أدوات داخلية وبوابات ومنتجات موجّهة للعملاء.",
        ),
      },
      {
        icon: "PuzzlePiece",
        title: b("Odoo apps & modules", "تطبيقات وموديولات أودو"),
        line: b(
          "Custom modules and integrations that extend your Odoo.",
          "موديولات وتكاملات مخصّصة توسّع نظام أودو لديك.",
        ),
      },
      {
        icon: "Globe",
        title: b("Web applications", "تطبيقات الويب"),
        line: b("Fast, modern web apps and portals.", "تطبيقات وبوابات ويب حديثة وسريعة."),
      },
      {
        icon: "PaintBrush",
        title: b("UI and UX design", "تصميم الواجهات وتجربة الاستخدام"),
        line: b("Clear, easy interfaces your users understand.", "واجهات واضحة وسهلة يفهمها المستخدمون."),
      },
      {
        icon: "Wrench",
        title: b("Maintenance & support", "الصيانة والدعم"),
        line: b("Ongoing updates and support after launch.", "تحديثات مستمرة ودعم بعد الإطلاق."),
      },
    ],
    steps: [
      {
        title: b("Discover", "الاكتشاف"),
        description: b("We understand your goals and users.", "نفهم أهدافك ومستخدميك."),
      },
      {
        title: b("Design", "التصميم"),
        description: b("UX, UI and prototypes you can click through.", "تجربة الاستخدام والواجهات ونماذج أولية قابلة للتجربة."),
      },
      {
        title: b("Build", "التطوير"),
        description: b("We develop and test.", "نطوّر ونختبر."),
      },
      {
        title: b("Launch", "الإطلاق"),
        description: b("We publish and support.", "ننشر وندعم."),
      },
    ],
    booking: {
      heading: b("Tell us about the app you need.", "أخبرنا عن التطبيق الذي تحتاجه."),
      body: b(
        "In one session we go through your idea and your users, then send a written recommendation and scope.",
        "في جلسة واحدة نناقش فكرتك ومستخدميك، ثم نرسل لك توصية مكتوبة بالنطاق.",
      ),
    },
  }),
);
