/**
 * Rich, designed content for the custom product pages.
 * Keyed by product slug. Bilingual. Used to render professional sections
 * (feature cards, capability panel, process steps) instead of plain text.
 */

interface BiText {
  en: string;
  ar: string;
}
interface Feature {
  icon: string;
  title: BiText;
  desc: BiText;
}
interface Step {
  title: BiText;
  desc: BiText;
}
export interface ProductContent {
  intro: BiText;
  features: Feature[];
  capabilitiesTitle: BiText;
  capabilities: BiText[];
  process: Step[];
}

export const PRODUCT_CONTENT: Record<string, ProductContent> = {
  "server-management": {
    intro: {
      en: "We design, provision, secure and run the infrastructure your business depends on — from a single server to a fully containerized platform.",
      ar: "نُصمّم ونُجهّز ونُؤمّن ونُدير البنية التحتية التي تعتمد عليها أعمالك — من خادم واحد إلى منصة حاويات متكاملة.",
    },
    features: [
      { icon: "🖥️", title: { en: "Server provisioning", ar: "تجهيز الخوادم" }, desc: { en: "OS setup, networking and production-ready configuration.", ar: "إعداد نظام التشغيل والشبكات وتهيئة جاهزة للإنتاج." } },
      { icon: "🐳", title: { en: "Docker & containers", ar: "Docker والحاويات" }, desc: { en: "Containerize and orchestrate your apps for portability and scale.", ar: "تحويل تطبيقاتك إلى حاويات وتنظيمها لسهولة النقل والتوسّع." } },
      { icon: "🔒", title: { en: "Security hardening", ar: "تعزيز الأمان" }, desc: { en: "Firewalls, SSL certificates and best-practice hardening.", ar: "جدران نارية وشهادات SSL وتأمين وفق أفضل الممارسات." } },
      { icon: "📊", title: { en: "Monitoring & alerts", ar: "المراقبة والتنبيهات" }, desc: { en: "Real-time monitoring, logging and proactive alerting.", ar: "مراقبة لحظية وسجلّات وتنبيهات استباقية." } },
      { icon: "💾", title: { en: "Backups & recovery", ar: "النسخ الاحتياطي والتعافي" }, desc: { en: "Automated backups and tested disaster recovery.", ar: "نسخ احتياطي تلقائي وخطط تعافٍ مُختبرة." } },
      { icon: "🚀", title: { en: "Zero-downtime deploys", ar: "نشر بدون توقف" }, desc: { en: "Reliable, repeatable deployments and updates.", ar: "نشر وتحديثات موثوقة وقابلة للتكرار." } },
    ],
    capabilitiesTitle: { en: "A production-grade platform", ar: "منصة بمستوى الإنتاج" },
    capabilities: [
      { en: "Nginx reverse proxy & load balancing", ar: "Nginx كـ Reverse Proxy وموازنة الأحمال" },
      { en: "Docker Compose orchestration", ar: "تنظيم الحاويات عبر Docker Compose" },
      { en: "SSL, firewalls & hardening", ar: "شهادات SSL والجدران النارية والتأمين" },
      { en: "24/7 monitoring & support", ar: "مراقبة ودعم على مدار الساعة" },
    ],
    process: [
      { title: { en: "Assess", ar: "التقييم" }, desc: { en: "We review your needs and current setup.", ar: "نراجع احتياجاتك ووضعك الحالي." } },
      { title: { en: "Provision", ar: "التجهيز" }, desc: { en: "Set up and harden the servers.", ar: "إعداد وتأمين الخوادم." } },
      { title: { en: "Deploy", ar: "النشر" }, desc: { en: "Containerize and go live.", ar: "تحويل لحاويات وإطلاق." } },
      { title: { en: "Support", ar: "الدعم" }, desc: { en: "Monitor, maintain and scale.", ar: "مراقبة وصيانة وتوسّع." } },
    ],
  },
  "data-management": {
    intro: {
      en: "Centralize, analyze and move your business data with confidence — from messy legacy systems to clean, modern, world-class software.",
      ar: "وحّد بياناتك وحلّلها وانقلها بثقة — من الأنظمة القديمة المبعثرة إلى برمجيات حديثة عالمية المستوى.",
    },
    features: [
      { icon: "📊", title: { en: "Data analysis", ar: "تحليل البيانات" }, desc: { en: "Turn raw data into clear, actionable insights.", ar: "تحويل البيانات الخام إلى رؤى واضحة قابلة للتنفيذ." } },
      { icon: "🔄", title: { en: "Data migration", ar: "ترحيل البيانات" }, desc: { en: "Move data from any old system to modern software.", ar: "نقل البيانات من أي نظام قديم إلى البرامج الحديثة." } },
      { icon: "🧹", title: { en: "Data cleansing", ar: "تنظيف البيانات" }, desc: { en: "Deduplicate, validate and standardize your data.", ar: "إزالة التكرار والتحقّق وتوحيد البيانات." } },
      { icon: "🔗", title: { en: "Integrations", ar: "التكاملات" }, desc: { en: "Connect your tools with reliable ETL pipelines.", ar: "ربط أدواتك عبر مسارات ETL موثوقة." } },
      { icon: "📈", title: { en: "BI dashboards", ar: "لوحات ذكاء الأعمال" }, desc: { en: "Live dashboards that drive better decisions.", ar: "لوحات حيّة تقود قرارات أفضل." } },
      { icon: "🛡️", title: { en: "Zero data loss", ar: "بدون فقدان بيانات" }, desc: { en: "Accurate, validated transfers — nothing left behind.", ar: "نقل دقيق ومُتحقّق — دون فقدان أي شيء." } },
    ],
    capabilitiesTitle: { en: "Migrate to world-class software", ar: "الانتقال إلى برمجيات عالمية" },
    capabilities: [
      { en: "Migration from any legacy system", ar: "الترحيل من أي نظام قديم" },
      { en: "Move to Odoo, SAP & global platforms", ar: "الانتقال إلى Odoo وSAP والمنصات العالمية" },
      { en: "Field mapping, cleansing & validation", ar: "مطابقة الحقول والتنظيف والتحقّق" },
      { en: "Real-time analytics dashboards", ar: "لوحات تحليلية لحظية" },
    ],
    process: [
      { title: { en: "Audit", ar: "الفحص" }, desc: { en: "Analyze your source data.", ar: "تحليل بيانات المصدر." } },
      { title: { en: "Map", ar: "التخطيط" }, desc: { en: "Map and clean the data.", ar: "مطابقة وتنظيف البيانات." } },
      { title: { en: "Migrate", ar: "الترحيل" }, desc: { en: "Transfer to the new system.", ar: "النقل إلى النظام الجديد." } },
      { title: { en: "Validate", ar: "التحقّق" }, desc: { en: "Verify accuracy & go live.", ar: "التأكد من الدقة والإطلاق." } },
    ],
  },
  applications: {
    intro: {
      en: "From idea to launch, we design and build the apps your business needs — mobile, web and Odoo.",
      ar: "من الفكرة إلى الإطلاق، نُصمّم ونبني التطبيقات التي تحتاجها أعمالك — جوال وويب وأودو.",
    },
    features: [
      { icon: "📱", title: { en: "Android & iOS apps", ar: "تطبيقات أندرويد وآيفون" }, desc: { en: "Native & cross-platform mobile apps with great UX.", ar: "تطبيقات جوال أصلية ومتعددة المنصات بتجربة ممتازة." } },
      { icon: "🛠️", title: { en: "Custom apps", ar: "تطبيقات مخصّصة" }, desc: { en: "Bespoke software built around your processes.", ar: "برمجيات مصمّمة حول عملياتك بالضبط." } },
      { icon: "🧩", title: { en: "Odoo apps & modules", ar: "تطبيقات وموديولات أودو" }, desc: { en: "Custom modules that extend your Odoo ERP.", ar: "موديولات مخصّصة تُوسّع نظام أودو لديك." } },
      { icon: "🌐", title: { en: "Web applications", ar: "تطبيقات ويب" }, desc: { en: "Fast, modern web apps and portals.", ar: "تطبيقات وبوابات ويب حديثة وسريعة." } },
      { icon: "🎨", title: { en: "UI/UX design", ar: "تصميم الواجهات" }, desc: { en: "Beautiful, intuitive interfaces users love.", ar: "واجهات جميلة وسهلة يحبّها المستخدمون." } },
      { icon: "🔧", title: { en: "Maintenance & support", ar: "الصيانة والدعم" }, desc: { en: "Ongoing updates and dependable support.", ar: "تحديثات مستمرة ودعم يُعتمد عليه." } },
    ],
    capabilitiesTitle: { en: "Apps built around your business", ar: "تطبيقات مصمّمة حول أعمالك" },
    capabilities: [
      { en: "Native Android & iOS development", ar: "تطوير أصلي لأندرويد وآيفون" },
      { en: "App Store & Google Play publishing", ar: "النشر على App Store وGoogle Play" },
      { en: "Custom Odoo modules & integrations", ar: "موديولات وتكاملات أودو مخصّصة" },
      { en: "Design, build & maintain", ar: "تصميم وتطوير وصيانة" },
    ],
    process: [
      { title: { en: "Discover", ar: "الاكتشاف" }, desc: { en: "Understand your goals.", ar: "فهم أهدافك." } },
      { title: { en: "Design", ar: "التصميم" }, desc: { en: "UX/UI & prototypes.", ar: "تجربة المستخدم والنماذج." } },
      { title: { en: "Build", ar: "التطوير" }, desc: { en: "Develop & test.", ar: "تطوير واختبار." } },
      { title: { en: "Launch", ar: "الإطلاق" }, desc: { en: "Publish & support.", ar: "نشر ودعم." } },
    ],
  },
};
