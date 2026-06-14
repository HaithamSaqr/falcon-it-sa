import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import SectionHeader from "@/components/shared/section-header";
import BrochureButton from "@/components/sections/brochure-button";
import ProductEmbed from "@/components/sections/product-embed";
import ProductHero from "@/components/sections/product-hero";
import ProductSectors from "@/components/sections/product-sectors";

type Props = {
  params: Promise<{ locale: string }>;
};

const SERVICES = [
  { icon: "\uD83D\uDE80", key: "f1" },
  { icon: "\u2699\uFE0F", key: "f2" },
  { icon: "\uD83D\uDD00", key: "f3" },
  { icon: "\uD83C\uDF93", key: "f4" },
  { icon: "\uD83D\uDEE1\uFE0F", key: "f5" },
  { icon: "\uD83D\uDCCB", key: "f6" },
] as const;

const PAIN_POINTS = [
  { icon: "\uD83E\uDDE9", key: "problem1" },
  { icon: "\uD83D\uDCA5", key: "problem2" },
  { icon: "\uD83D\uDDE3\uFE0F", key: "problem3" },
] as const;



const TRUST_BADGES = ["trustBadge1", "trustBadge2", "trustBadge3", "trustBadge4"] as const;

export default async function OdooServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";
  return <OdooServicesContent isArabic={isArabic} />;
}

function OdooServicesContent({ isArabic }: { isArabic: boolean }) {
  const t = useTranslations("products");
  const tp = useTranslations("odooPage");
  const tc = useTranslations("common");

  return (
    <>
      {/* Section 1: Hero (editable from admin → Products) */}
      <ProductHero slug="odoo-services" />

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
            eyebrow={tp("servicesEyebrow")}
            title={tp("servicesTitle")}
            subtitle={tp("servicesSubtitle")}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <Card key={service.key} className="text-start">
                <span className="mb-4 inline-block text-3xl">{service.icon}</span>
                <h3 className="mb-2 text-lg font-bold text-text-primary">
                  {tp(`${service.key}Title`)}
                </h3>
                <p className="text-sm text-text-secondary">
                  {tp(`${service.key}Desc`)}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="primary" size="md" href="/contact">
              {tp("servicesCtaText")}
            </Button>
          </div>
        </Container>
      </section>

      {/* NEW: Comprehensive Odoo Services Brochure Deep Dive */}
      <section className="py-20 bg-white border-t border-gray-100">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
              {isArabic ? "خدمات تنفيذ وتخصيص أودو الشاملة" : "Complete Odoo Customization & Setup"}
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              {isArabic 
                ? "نحن لا نثبت أودو فحسب، بل نطوعه بالكامل ليطابق احتياجات وهيكل شركتك وثقافة عملك الإقليمية" 
                : "We don't just install Odoo — we shape it entirely to match your business workflows and regional culture"}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 text-start">
            {/* Business Analysis */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🔍</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "دراسة العمل وتحليل الفجوات" : "Business & Gap Analysis"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "جلسات وورش عمل مكثفة لفهم دورة المستندات والعمليات الحالية" : "Intensive workshops to map documents lifecycle and current processes"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "مقارنة متطلباتك مع معايير أودو (Odoo Standard) لتقليل الكود الإضافي" : "Compare workflows with Odoo Standard configurations to minimize customization"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "صياغة مستند نطاق العمل الفني (SRS) وتوقيعه قبل البدء بالكود" : "Draft and align on a Software Requirements Specification (SRS) doc"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تقييم العائد الاستثماري لعمليات الأتمتة المقترحة للمستودعات والمالية" : "Cost-benefit ROI analysis for proposed warehouse & financial automations"}</span>
                </li>
              </ul>
            </div>

            {/* Custom Apps */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">⚙️</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "تخصيص وبرمجة تطبيقات خاصة" : "Custom App Development"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "كتابة تطبيقات وإضافات مخصصة (Custom Modules) بلغة Python" : "Develop robust custom python modules following Odoo guidelines"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تعديل واجهات المستخدم وبناء لوحات بيانات ولوحات تحكم ذكية" : "Modify user interfaces and build tailored BI dashboards"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تصميم وتخصيص تقارير الطباعة ونماذج الفواتير وعروض الأسعار" : "Custom layouts for invoices, quotations, and picking slips"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "أتمتة سير العمل والموافقات المعقدة عبر الإدارات المختلفة" : "Automate cross-departmental approval flows and document statuses"}</span>
                </li>
              </ul>
            </div>

            {/* API Integrations */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🔗</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "الربط وتكامل الأنظمة" : "System Integrations & APIs"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "ربط أودو مع بوابات الدفع الإلكتروني (PayTabs, Moyasar)" : "Payment gateway integrations (PayTabs, Moyasar) for sales"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "مزامنة لحظية مع منصات الشحن والتوصيل والخدمات اللوجستية" : "Real-time sync with local logistics and delivery platforms"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "ربط أجهزة الحضور والانصراف والبصمة بقسم الموارد البشرية" : "Connect on-premise biometric attendance devices directly to HR"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "التكامل مع قنوات المبيعات والشركاء الخارجيين عبر الـ APIs" : "Robust REST API syncs with external partners and ERPs"}</span>
                </li>
              </ul>
            </div>

            {/* Localization */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🇸🇦</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "التعريب والامتثال المحلي" : "MENA & Saudi Localization"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تعريب كامل بنسبة 100% للواجهات والتقارير المالية" : "100% Arabic translation for accounting and operations"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تكامل تام ومستمر مع المرحلة الثانية للفوترة الإلكترونية (ZATCA)" : "Fully compliant Phase 2 ZATCA e-invoicing API integration"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تهيئة شجرة حسابات وقيود المحاسبة لتطابق لوائح المملكة" : "Predefined Saudi Chart of Accounts and tax configurations"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "دعم كامل لنظام حماية الأجور (WPS) والتأمينات الاجتماعية" : "Compliant Wages Protection System (WPS) bank exports and GOSI"}</span>
                </li>
              </ul>
            </div>

            {/* Training */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🎓</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "التدريب الميداني والاعتماد" : "Hands-on Staff Training"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "دورات تدريبية عملية للموظفين حسب أقسامهم وأدوارهم" : "Role-based training sessions for accounting, HR, and operations"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "توفير فيديوهات مسجلة وكتيبات شرح تفصيلية باللغة العربية" : "Detailed training manuals and recorded video walkthroughs in Arabic"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "اختبارات كفاءة للمستخدمين لضمان تشغيل النظام دون أخطاء" : "Post-training proficiency tests to ensure error-free daily entries"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "دعم فني ميداني لصيق بموظفيك خلال الأسبوع الأول للإطلاق" : "On-site hand-holding support during your critical go-live week"}</span>
                </li>
              </ul>
            </div>

            {/* Managed SLA Support */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🛡️</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "عقود الدعم الفني والصيانة (SLA)" : "Managed SLA Support"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "مهندس دعم فني مخصص للاستجابة للمشاكل الحرجة خلال ساعة" : "Dedicated account engineer answering critical issues within 1 hour"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "دعم فني مباشر وسريع عن طريق الواتساب والاتصال الهاتفي" : "Direct developer-backed support via WhatsApp and telephone"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "صيانة وقائية دورية وفحص خوادم أودو والتأكد من النسخ الاحتياطي" : "Routine database optimization and backup validation routines"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تحديث النظام وتثبيت الميزات الجديدة بأسعار مخفضة ومجدولة" : "Discounted upgrade rates for major Odoo core version updates"}</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* NEW: Odoo Implementation Methodology */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-extrabold text-text-primary">
              {isArabic ? "منهجية تنفيذ مشاريع أودو" : "Our Odoo Delivery Methodology"}
            </h2>
            <p className="mt-4 text-text-secondary">
              {isArabic 
                ? "خطة عمل مجربة ومقسمة على 4 مراحل تضمن نجاح مشروع أودو ضمن الميزانية والوقت المحدد" 
                : "A battle-tested 4-phase delivery framework that ensures Odoo success on-time and on-budget"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4 text-start">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <span className="text-cta text-2xl font-bold">01</span>
              <h3 className="text-base font-bold text-text-primary mt-2">
                {isArabic ? "التخطيط والتحليل" : "Plan & Analyze"}
              </h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {isArabic 
                  ? "نقوم بدراسة متطلباتك الحالية وتحديد الفجوات البرمجية وكتابة ملف النطاق الفني والموافقة عليه." 
                  : "We map your current processes, identify software gaps, and sign off on a detailed scope of work."}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <span className="text-cta text-2xl font-bold">02</span>
              <h3 className="text-base font-bold text-text-primary mt-2">
                {isArabic ? "التخصيص والتهيئة" : "Configure & Develop"}
              </h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {isArabic 
                  ? "نقوم بتهيئة قاعدة البيانات القياسية وتطوير الأكواد والبرمجيات المخصصة واستيراد بياناتك الأولية." 
                  : "We set up the database, write custom modules, modify layouts, and import your master data."}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <span className="text-cta text-2xl font-bold">03</span>
              <h3 className="text-base font-bold text-text-primary mt-2">
                {isArabic ? "الاختبار والتدريب" : "Test & Train"}
              </h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {isArabic 
                  ? "نقوم باختبار النظام بالكامل للتأكد من خلوه من الأخطاء وتدريب الموظفين وإجراء جولة محاكاة حية." 
                  : "We test flows end-to-end, run user training sessions, and perform simulated day-in-the-life testing."}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <span className="text-cta text-2xl font-bold">04</span>
              <h3 className="text-base font-bold text-text-primary mt-2">
                {isArabic ? "الإطلاق والدعم المباشر" : "Go-Live & Support"}
              </h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {isArabic 
                  ? "نبدأ العمل الفعلي على النظام ونوفر دعماً لصيقاً وميدانياً للموظفين لضمان الاستقرار التام." 
                  : "We launch the live system and provide intensive support during week one for absolute stability."}
              </p>
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
            <Button variant="cta" size="lg" href="/contact">
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
            <Button variant="cta" size="lg" href="/contact">
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
              {isArabic ? "الأسئلة الشائعة حول خدمات أودو" : "Odoo Implementation FAQ"}
            </h2>
            <p className="mt-4 text-text-secondary">
              {isArabic 
                ? "إجابات وتوضيحات هامة للشركات المهتمة بتطبيق وتعديل نظام أودو" 
                : "Clear answers to essential questions about Odoo setup and support"}
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-6 text-start">
            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-text-primary text-base">
                {isArabic ? "ما الفرق بين نسخة أودو المجانية (Community) والمدفوعة (Enterprise)؟" : "What is the difference between Odoo Community and Enterprise?"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {isArabic 
                  ? "نسخة المجتمع (Community) مجانية الرخص وتوفر الوحدات الأساسية للمحاسبة والمخازن وهي خيار ممتاز للشركات الناشئة والصغيرة بميزانية محدودة. بينما نسخة المؤسسة (Enterprise) مدفوعة الرخص سنوياً ولكنها توفر وصولاً كاملاً لتطبيق الموارد البشرية والرواتب المتقدم، ونقاط البيع السحابية، ودعم تطبيقات الجوال، وتوافق ZATCA الكامل والمباشر للمرحلة الثانية."
                  : "Odoo Community is open-source with no license fees, providing core modules (CRM, basic sales & inventory). Odoo Enterprise is a paid subscription that unlocks advanced features, responsive mobile views, comprehensive local HR, fully integrated barcode features, and direct Phase 2 ZATCA e-invoicing capabilities."}
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-text-primary text-base">
                {isArabic ? "هل يمكننا النقل من نظامنا المالي الحالي إلى أودو دون فقدان البيانات؟" : "Can we migrate from our current system to Odoo without data loss?"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {isArabic 
                  ? "نعم بالتأكيد. لدينا خبراء متخصصون في سحب وتحويل وتصنيف البيانات المالية والمستودعية من الأنظمة القديمة (مثل SAP, Oracle, QuickBooks أو Excel) واستيرادها بأمان إلى أودو مع الحفاظ التام على الأرصدة الافتتاحية وتاريخ المبيعات."
                  : "Absolutely. We have database migration experts who extract, clean, map, and import your master data and opening balances from legacy ERPs (SAP, Oracle, QuickBooks) or Excel sheets securely into your new Odoo setup, guaranteeing zero data loss."}
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-text-primary text-base">
                {isArabic ? "كيف يتم تنظيم عمليات الدعم الفني بعد إطلاق النظام؟" : "How does post-go-live technical support work?"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {isArabic 
                  ? "نقدم اتفاقيات دعم فني وصيانة مرنة بنقاط أو ساعات محددة شهرياً. يتواصل معك فريق دعم متكامل يتحدث العربية لحل المشاكل التقنية وتعديل التقارير وتحديث الصلاحيات بمرونة تامة عن بُعد أو من خلال الزيارات الميدانية."
                  : "We offer tailored annual SLA support packages with monthly hours. Our Arabic-speaking helpdesk handles software issues, creates new customized print layouts, adjusts user access rights, and maintains server database health remotely or via site visits."}
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
                suppressHydrationWarning
                placeholder={tp("formName")}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none sm:col-span-1"
              />
              <input
                type="email"
                suppressHydrationWarning
                placeholder={tp("formEmail")}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none sm:col-span-1"
              />
              <input
                type="tel"
                suppressHydrationWarning
                placeholder={tp("formPhone")}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none sm:col-span-1"
              />
              <input
                type="text"
                suppressHydrationWarning
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

      <ProductSectors slug="odoo-services" />

      <ProductEmbed slug="odoo-services" />
      <BrochureButton slug="odoo-services" />
    </>
  );
}
