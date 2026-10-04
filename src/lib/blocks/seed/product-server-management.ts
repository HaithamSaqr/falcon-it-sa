/** Server management page seed. From DEFAULT_PRODUCTS, the brochure and PRODUCT_CONTENT; no prices. */
import { b } from "../fields";
import { seedPage } from "./helpers";
import { productBlocks } from "./common";

export const PRODUCT_SERVER_MANAGEMENT_SEED = seedPage(
  "product:server-management",
  productBlocks({
    title: b("Servers set up right, and looked after.", "خوادم مجهّزة كما يجب، ومتابَعة باستمرار."),
    subtitle: b(
      "We design, provision, secure and run the infrastructure your business depends on, from a single server to a containerised platform.",
      "نصمّم ونجهّز ونؤمّن ونشغّل البنية التحتية التي يعتمد عليها عملك، من خادم واحد إلى منصة حاويات متكاملة.",
    ),
    featuresHeading: b("What we take care of.", "ما نتولاه عنك."),
    featuresIntro: b(
      "Production-ready servers, with Nginx, Docker Compose, SSL and firewalls set up the same way every time.",
      "خوادم جاهزة للتشغيل، مع Nginx وDocker Compose وشهادات SSL والجدران النارية بالطريقة نفسها في كل مرة.",
    ),
    features: [
      {
        icon: "HardDrives",
        title: b("Server provisioning", "تجهيز الخوادم"),
        line: b(
          "Operating system, networking and production-ready configuration.",
          "إعداد نظام التشغيل والشبكات وتهيئة جاهزة للتشغيل الفعلي.",
        ),
      },
      {
        icon: "Package",
        title: b("Docker & containers", "Docker والحاويات"),
        line: b(
          "Your apps in containers, orchestrated with Docker Compose, so every environment behaves the same.",
          "تطبيقاتك في حاويات منظّمة عبر Docker Compose، فتتطابق كل البيئات.",
        ),
      },
      {
        icon: "ShieldCheck",
        title: b("Security hardening", "تعزيز الأمان"),
        line: b(
          "Firewalls, SSL certificates and hardening to current best practice.",
          "جدران نارية وشهادات SSL وتأمين وفق أفضل الممارسات.",
        ),
      },
      {
        icon: "ChartLineUp",
        title: b("Monitoring & alerts", "المراقبة والتنبيهات"),
        line: b(
          "Monitoring, logs and alerts, so problems surface before users notice.",
          "مراقبة وسجلّات وتنبيهات، فتظهر المشكلة قبل أن يلاحظها المستخدمون.",
        ),
      },
      {
        icon: "Database",
        title: b("Backups & recovery", "النسخ الاحتياطي والتعافي"),
        line: b(
          "Automated backups and a recovery plan that has been tested.",
          "نسخ احتياطي تلقائي وخطة تعافٍ مُختبرة.",
        ),
      },
      {
        icon: "Rocket",
        title: b("Deployments & updates", "النشر والتحديثات"),
        line: b(
          "Repeatable deployments and updates with as little downtime as possible.",
          "نشر وتحديثات قابلة للتكرار بأقل توقف ممكن.",
        ),
      },
    ],
    steps: [
      {
        title: b("Assess", "التقييم"),
        description: b("We review your needs and your current setup.", "نراجع احتياجاتك ووضعك الحالي."),
      },
      {
        title: b("Provision", "التجهيز"),
        description: b("We set up and harden the servers.", "نُعدّ الخوادم ونؤمّنها."),
      },
      {
        title: b("Deploy", "النشر"),
        description: b("We containerise your apps and go live.", "ننقل تطبيقاتك إلى حاويات ونطلقها."),
      },
      {
        title: b("Support", "الدعم"),
        description: b("We monitor, maintain and scale.", "نراقب ونصون ونوسّع."),
      },
    ],
    booking: {
      heading: b("Tell us what you run today.", "أخبرنا بما تشغّله اليوم."),
      body: b(
        "In one session we review your servers and applications, then send a written recommendation and scope.",
        "في جلسة واحدة نراجع خوادمك وتطبيقاتك، ثم نرسل لك توصية مكتوبة بالنطاق.",
      ),
    },
  }),
);
