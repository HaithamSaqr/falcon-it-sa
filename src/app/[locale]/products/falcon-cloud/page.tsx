import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import SectionHeader from "@/components/shared/section-header";
import BrochureButton from "@/components/sections/brochure-button";
import ProductHero from "@/components/sections/product-hero";

type Props = {
  params: Promise<{ locale: string }>;
};

const FEATURES = [
  { icon: "\uD83D\uDCF1", key: "f1" },
  { icon: "\uD83D\uDD04", key: "f2" },
  { icon: "\u2B06\uFE0F", key: "f3" },
  { icon: "\uD83C\uDFE2", key: "f4" },
  { icon: "\uD83D\uDD12", key: "f5" },
  { icon: "\u2705", key: "f6" },
] as const;

const PAIN_POINTS = [
  { icon: "\uD83D\uDDA5\uFE0F", key: "problem1" },
  { icon: "\uD83D\uDD0D", key: "problem2" },
  { icon: "\uD83D\uDCB8", key: "problem3" },
] as const;



const TRUST_BADGES = ["trustBadge1", "trustBadge2", "trustBadge3", "trustBadge4"] as const;

export default async function FalconCloudPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";
  return <FalconCloudContent isArabic={isArabic} />;
}

function FalconCloudContent({ isArabic }: { isArabic: boolean }) {
  const t = useTranslations("products");
  const tp = useTranslations("cloudPage");
  const tc = useTranslations("common");

  return (
    <>
      {/* Section 1: Hero (editable from admin → Products) */}
      <ProductHero slug="falcon-cloud" />

      {/* Section 2: Problem / Pain Agitation */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow={tp("problemEyebrow")}
            title={tp("problemTitle")}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PAIN_POINTS.map((pain) => (
              <Card key={pain.key} className="text-start">
                <span className="mb-4 inline-block text-3xl">{pain.icon}</span>
                <h3 className="mb-2 text-lg font-bold text-text-primary">
                  {tp(`${pain.key}Title`)}
                </h3>
                <p className="text-sm text-text-secondary">
                  {tp(`${pain.key}Desc`)}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="primary" size="md" href="#how-it-works">
              {tp("problemCtaText")}
            </Button>
          </div>
        </Container>
      </section>

      {/* Section 3: Key Benefits (6 cards) */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow={tp("featuresEyebrow")}
            title={tp("featuresTitle")}
            subtitle={tp("featuresSubtitle")}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.key} className="text-start">
                <span className="mb-4 inline-block text-3xl">{feature.icon}</span>
                <h3 className="mb-2 text-lg font-bold text-text-primary">
                  {tp(`${feature.key}Title`)}
                </h3>
                <p className="text-sm text-text-secondary">
                  {tp(`${feature.key}Desc`)}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="primary" size="md" href="/demo">
              {tp("featuresCtaText")}
            </Button>
          </div>
        </Container>
      </section>

      {/* NEW: Comprehensive Cloud Brochure Modules */}
      <section className="py-20 bg-white border-t border-gray-100">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
              {isArabic ? "المميزات التفصيلية للنسخة السحابية" : "Detailed Cloud Version Features"}
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              {isArabic 
                ? "دليل متكامل للوظائف والمزايا الفريدة لنظام فالكون السحابي ERP المتاح من أي مكان" 
                : "An all-inclusive guide to the features and unique benefits of Falcon Cloud ERP, accessible anywhere"}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 text-start">
            {/* Anywhere Access */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">📱</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "الوصول اللحظي من الجوال والأجهزة" : "Anywhere & Mobile Access"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تطبيق هاتف مخصص متوافق بالكامل مع أنظمة iOS و Android" : "Native mobile application fully compatible with iOS and Android"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "واجهة مستخدم متجاوبة (Responsive) وسلسة على متصفحات الجوال" : "Highly responsive UI designed specifically for mobile and tablet browsers"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "نظام إشعارات دفع (Push Notifications) للموافقات وطلبات الشراء" : "Push notifications for pending approvals and purchase workflows"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "إدارة الصلاحيات بدقة حسب موقع المستخدم وجهازه" : "Granular user permissions mapped by location or devices"}</span>
                </li>
              </ul>
            </div>

            {/* Auto Updates */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🔄</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "التحديثات والنسخ الاحتياطي التلقائي" : "Auto-Updates & Backups"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تحديث تلقائي وفوري فور صدور تعديلات من هيئة الزكاة والضريبة" : "Instant updates deployed automatically with new ZATCA regulations"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "نسخ احتياطي يومي مشفر على خوادم إقليمية متعددة لمنع ضياع البيانات" : "Daily encrypted backups across multiple regional data centers"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "صيانة دورية وترقية أمنية للنظام دون التأثير على وقت العمل" : "Scheduled off-hours maintenance and automated security patching"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "توفير أحدث المزايا البرمجية وتحسينات الأداء تلقائياً" : "Automatic deployment of performance improvements and new features"}</span>
                </li>
              </ul>
            </div>

            {/* Cloud POS */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🛒</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "نقاط البيع والمبيعات السحابية" : "Cloud Point of Sale (POS)"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "ربط فوري وموحد لجميع الفروع والمخازن ونقاط البيع" : "Unified real-time tracking across all POS terminals and retail branches"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "دعم كامل للعمل في وضع عدم الاتصال (Offline Mode) مع مزامنة لاحقة" : "100% offline capability with background auto-sync once online"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "إدارة ذكية لحملات التسويق، الخصومات، وبرامج ولاء العملاء" : "Dynamic discount codes, promotions, and customer loyalty campaigns"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "ربط مباشر بمتجرك الإلكتروني (Salla, Zid, WooCommerce)" : "Direct plug-and-play integrations with e-commerce portals (Salla, Zid, etc.)"}</span>
                </li>
              </ul>
            </div>

            {/* Real-time Analytics */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">📈</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "لوحات تحكم وتحليلات فورية" : "Real-time Dashboards & BI"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "لوحة تحكم إدارية فورية تعرض الإيرادات والأرباح والمخازن" : "C-suite dashboards showing revenues, margins, and stock levels"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "توليد تقارير الأداء المالي، المبيعات، ومعدل دوران المخزون" : "Instant financial performance, sales analysis, and inventory turn reports"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تنبيهات فورية ومؤشرات ذكية لمراقبة النفقات وتدفق النقد" : "Expenditure and cash flow monitoring with custom threshold alerts"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تصدير التقارير بصيغ مختلفة (Excel, PDF) وبلمسة واحدة" : "One-click export of complex tables to Excel and PDF formats"}</span>
                </li>
              </ul>
            </div>

            {/* Multi-Branch Sync */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🏢</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "إدارة الفروع المتعددة والمحاسبة" : "Multi-Branch & Consolidations"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "إدارة فروع وكيانات تجارية متعددة بلوحة تحكم واحدة" : "Manage multiple commercial registrations and branches centrally"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "توحيد القوائم المالية وإغلاق الفترة المحاسبية للفروع تلقائياً" : "Automatic financial consolidation and period closing for all branches"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "مزامنة لحظية للمخزون وتحويلات المخازن بين الفروع" : "Real-time stock level synchronization and inter-branch transfers"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تقارير مقارنة للأداء والمبيعات والربحية بين كل فرع وآخر" : "Comparative sales, margin, and efficiency reporting between branches"}</span>
                </li>
              </ul>
            </div>

            {/* Premium Cloud Security */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🔒</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "الأمن السحابي والاستضافة المحلية" : "Enterprise Cloud Security"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "استضافة داخل مراكز البيانات المحلية للامتثال التام لنظام الـ PDPL" : "In-kingdom hosting for full compliance with local PDPL data laws"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تشفير البيانات أثناء انتقالها وتخزينها لحمايتها من الاختراق" : "Data encryption at rest and in transit protecting critical records"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "جدران حماية متطورة ونظام كشف الاختراق والاستجابة للحوادث" : "Advanced enterprise firewalls and intrusion detection services"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "ضمان وقت تشغيل بنسبة 99.9% مع اتفاقية مستوى الخدمة الموقعة" : "99.9% availability guaranteed under a signed Service Level Agreement"}</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* NEW: Cloud Infrastructure & Hosting Specs */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-extrabold text-text-primary">
              {isArabic ? "الامتثال الأمني وضمانات الاستضافة" : "Security Compliance & Hosting SLAs"}
            </h2>
            <p className="mt-4 text-text-secondary">
              {isArabic 
                ? "مواصفات الأمان والبنية السحابية المتقدمة التي تحمي بيانات شركتك المالية والتشغيلية" 
                : "Security specifications and advanced cloud infrastructure protecting your corporate data"}
            </p>
          </div>

          <div className="mx-auto max-w-4xl bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-start">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-gray-100 pb-2">
                  {isArabic ? "البنية السحابية وأماكن تخزين البيانات" : "Infrastructure & Hosting"}
                </h3>
                <ul className="space-y-3 text-sm text-text-secondary">
                  <li><strong>{isArabic ? "الخوادم السحابية:" : "Cloud Infrastructure:"}</strong> AWS / Google Cloud Local Saudi Regions</li>
                  <li><strong>{isArabic ? "ضمان وقت التشغيل:" : "Guaranteed Uptime:"}</strong> 99.9% Uptime SLA {isArabic ? "مع تعويض مالي عند الانقطاع" : "with service credits on downtime"}</li>
                  <li><strong>{isArabic ? "النسخ الاحتياطي السحابي:" : "Cloud Backups:"}</strong> {isArabic ? "يومي تلقائي مع الاحتفاظ بنسخ لـ 30 يوماً سابقة" : "Daily automated, with 30-day retention policies"}</li>
                  <li><strong>{isArabic ? "سرعة الاستجابة والدعم:" : "Technical Support SLA:"}</strong> {isArabic ? "فريق دعم فني متكامل باستجابة خلال ساعة للمشاكل الحرجة" : "1-hour response time for critical priority issues"}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-gray-100 pb-2">
                  {isArabic ? "معايير الأمان والخصوصية" : "Security Standards"}
                </h3>
                <ul className="space-y-3 text-sm text-text-secondary">
                  <li><strong>{isArabic ? "التشفير وحماية قنوات البيانات:" : "Encryption:"}</strong> TLS 1.3 {isArabic ? "للقنوات و" : "and"} AES-256 {isArabic ? "لقاعدة البيانات" : "for database encryption"}</li>
                  <li><strong>{isArabic ? "الشهادات والاعتمادات:" : "Compliance & Standards:"}</strong> SOC 2 Type II Certified Data Centers / ISO 27001</li>
                  <li><strong>{isArabic ? "سيادة البيانات والخصوصية:" : "Data Sovereignty:"}</strong> 100% {isArabic ? "متوافق مع الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA)" : "compliant with Saudi Data and AI Authority guidelines"}</li>
                  <li><strong>{isArabic ? "نظام كشف الاختراق:" : "Intrusion Prevention:"}</strong> Automated WAF (Web Application Firewall) & DDoS Protection</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Section 4: How It Works (3 steps) */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <Container>
          <SectionHeader
            eyebrow={tp("howItWorksEyebrow")}
            title={tp("howItWorksTitle")}
            subtitle={tp("howItWorksSubtitle")}
          />
          <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-3">
            {(["step1", "step2", "step3"] as const).map((step) => (
              <div key={step} className="text-center">
                <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10 text-2xl font-extrabold text-primary-500">
                  {tp(`${step}Number`)}
                </span>
                <h3 className="mb-3 text-xl font-bold text-text-primary">
                  {tp(`${step}Title`)}
                </h3>
                <p className="text-sm text-text-secondary">
                  {tp(`${step}Desc`)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="cta" size="lg" href="/demo">
              {tp("howItWorksCtaText")}
            </Button>
          </div>
        </Container>
      </section>

      {/* Section 5: Mid-page CTA Banner */}
      <section className="bg-primary-900 py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
              {tp("midCtaTitle")}
            </h2>
            <p className="mb-8 text-lg text-gray-300">
              {tp("midCtaSubtitle")}
            </p>
            <Button variant="cta" size="lg" href="/demo">
              {tp("midCtaButton")}
            </Button>
          </div>
        </Container>
      </section>

      {/* NEW: Specific Product FAQ */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-extrabold text-text-primary">
              {isArabic ? "الأسئلة الشائعة حول النسخة السحابية" : "Cloud Version FAQ"}
            </h2>
            <p className="mt-4 text-text-secondary">
              {isArabic 
                ? "إجابات وحلول سريعة لأهم استفسارات الشركات عن نظام فالكون السحابي" 
                : "Quick answers to common questions about Falcon Cloud ERP"}
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-6 text-start">
            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-text-primary text-base">
                {isArabic ? "أين يتم تخزين واستضافة بياناتنا؟ وهل هي آمنة؟" : "Where is our data hosted, and is it secure?"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {isArabic 
                  ? "يتم استضافة بياناتك بالكامل داخل مراكز بيانات محلية آمنة داخل المملكة العربية السعودية (الرياض). نستخدم أحدث تقنيات الحماية وجدران الحماية لحمايتها، مما يجعلها متوافقة 100% مع أنظمة الأمن السيبراني المحلّية وضمان الخصوصية وسرعة التصفح الفائقة."
                  : "Your database is hosted inside highly secure, local Saudi Arabian data centers (Riyadh). We implement enterprise-grade security encryption, complying 100% with local cyber security regulations and ensuring top speed and privacy for your team."}
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-text-primary text-base">
                {isArabic ? "ماذا يحدث في حال انقطاع الإنترنت في مقر شركتي أو فروع نقاط البيع؟" : "What happens if our office or POS internet connection drops?"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {isArabic 
                  ? "تحتوي نقاط البيع والمبيعات في فالكون كلاود على خاصية (Offline Billing) التي تضمن لك إكمال عمليات البيع للعملاء وإصدار الفواتير وطباعتها حتى عند انقطاع الإنترنت بالكامل. بمجرد استقرار الإشارة وعودة الاتصال، يقوم النظام بمزامنة كافة الفواتير والعمليات مع الخادم السحابي تلقائياً."
                  : "Falcon Cloud POS features integrated Offline Billing functionality, allowing you to run register sales, create receipts, and print invoices even during total internet blackouts. The moment connection is re-established, all locally cached data is automatically synced with the cloud server."}
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-text-primary text-base">
                {isArabic ? "هل هناك التزامات أو عقود طويلة الأجل؟ وكيف يمكن إلغاء الاشتراك؟" : "Are there long-term contract lock-ins, and how do I cancel?"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {isArabic 
                  ? "الاشتراكات مرنة تماماً وبشكل شهري أو سنوي حسب رغبتك. يمكنك ترقية عدد المستخدمين أو تقليله، أو حتى إلغاء الاشتراك في أي وقت تريده دون أي غرامات أو قيود. بياناتك ملكك بالكامل ويمكنك تصديرها كملفات Excel في أي وقت."
                  : "We offer complete flexibility with month-to-month or annual plans. You can scale your user seats up or down, or cancel your subscription at any time without penalty or hassle. Your data belongs entirely to you, and you can export it to Excel whenever you need to."}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Section 7: Testimonial */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-primary-500">
              {tp("testimonialEyebrow")}
            </span>
            <blockquote className="mb-8 text-xl font-medium leading-relaxed text-text-primary sm:text-2xl">
              &ldquo;{tp("testimonialQuote")}&rdquo;
            </blockquote>
            <div className="mb-4 mx-auto h-16 w-16 rounded-full bg-primary-500/10" />
            <p className="text-lg font-bold text-text-primary">
              {tp("testimonialName")}
            </p>
            <p className="text-sm text-text-secondary">
              {tp("testimonialRole")} — {tp("testimonialCompany")}
            </p>
          </div>
        </Container>
      </section>

      {/* Section 8: Final CTA + Lead Form */}
      <section className="bg-dark py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
              {tp("finalCtaTitle")}
            </h2>
            <p className="mb-10 text-lg text-gray-300">
              {tp("finalCtaSubtitle")}
            </p>
            <form className="mx-auto grid max-w-lg gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder={tp("formName")}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none sm:col-span-1"
              />
              <input
                type="email"
                placeholder={tp("formEmail")}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none sm:col-span-1"
              />
              <input
                type="tel"
                placeholder={tp("formPhone")}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none sm:col-span-1"
              />
              <input
                type="text"
                placeholder={tp("formCompany")}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none sm:col-span-1"
              />
              <div className="sm:col-span-2">
                <Button variant="cta" size="lg" className="w-full">
                  {tp("formSubmit")}
                </Button>
              </div>
            </form>
            <p className="mt-4 text-sm text-gray-400">
              {tp("formDisclaimer")}
            </p>
            <p className="mt-6 text-sm text-gray-400">
              {tc("orCallUs")}: <span className="font-semibold text-white" dir="ltr">00966568406006</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              {TRUST_BADGES.map((badge) => (
                <span key={badge} className="flex items-center gap-2">
                  <span className="text-cta">&#10003;</span> {tp(badge)}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <BrochureButton slug="falcon-cloud" />
    </>
  );
}
