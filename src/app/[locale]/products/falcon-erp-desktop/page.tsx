import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import SectionHeader from "@/components/shared/section-header";
import IndustryGrid from "@/components/sections/industry-grid";

type Props = {
  params: Promise<{ locale: string }>;
};

const FEATURES = [
  { icon: "\uD83D\uDCB0", key: "f1" },
  { icon: "\uD83D\uDCE6", key: "f2" },
  { icon: "\uD83D\uDC65", key: "f3" },
  { icon: "\uD83D\uDCC8", key: "f4" },
  { icon: "\uD83C\uDFED", key: "f5" },
  { icon: "\uD83E\uDDFE", key: "f6" },
] as const;

const PAIN_POINTS = [
  { icon: "\uD83D\uDCB8", key: "problem1" },
  { icon: "\uD83C\uDF10", key: "problem2" },
  { icon: "\u23F3", key: "problem3" },
] as const;



const TRUST_BADGES = ["trustBadge1", "trustBadge2", "trustBadge3", "trustBadge4"] as const;

export default async function FalconErpDesktopPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";
  return <FalconErpDesktopContent isArabic={isArabic} />;
}

function FalconErpDesktopContent({ isArabic }: { isArabic: boolean }) {
  const t = useTranslations("products");
  const tp = useTranslations("desktopPage");
  const tc = useTranslations("common");

  return (
    <>
      {/* Section 1: Hero */}
      <section className="bg-dark py-20 lg:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="mb-4 inline-block rounded-full bg-primary-500/10 px-4 py-1.5 text-sm font-semibold text-primary-500">
                {tp("badge")}
              </span>
              <h1 className="mb-6 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
                {tp("heroTitle")}
              </h1>
              <p className="mb-8 text-xl text-gray-300">
                {tp("heroSubtitle")}
              </p>
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <Button variant="cta" size="lg" href="/contact">
                  {tp("heroCtaPrimary")}
                </Button>
                <Button variant="dark-outline" size="lg" href="/demo">
                  {tp("heroCtaSecondary")}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="text-cta">&#10003;</span> {tp("heroTrust1")}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-cta">&#10003;</span> {tp("heroTrust2")}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-cta">&#10003;</span> {tp("heroTrust3")}
                </span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-900/40 p-8">
                <span className="text-lg font-medium text-primary-500/80">
                  {tp("screenshotAlt")}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

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
            eyebrow={tp("modulesEyebrow")}
            title={tp("modulesTitle")}
            subtitle={tp("modulesSubtitle")}
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
              {tp("modulesCtaText")}
            </Button>
          </div>
        </Container>
      </section>

      {/* NEW: Comprehensive Brochure & Module Deep Dive */}
      <section className="py-20 bg-white border-t border-gray-100">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
              {isArabic ? "المميزات التفصيلية للنسخة المكتبية" : "Detailed Desktop Version Features"}
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              {isArabic 
                ? "دليل متكامل لكافة الخصائص والمواصفات التي تميز خيار التثبيت المحلي من فالكون ERP" 
                : "An all-inclusive guide to the features and capabilities of Falcon ERP on-premise deployment"}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 text-start">
            {/* Accounting */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">📊</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "المحاسبة والإدارة المالية" : "Accounting & Finance"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "شجرة حسابات ديناميكية متعددة المستويات لتناسب هيكل شركتك" : "Dynamic multi-level charts of accounts to match your corporate structure"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "توليد تلقائي بالكامل للقيود اليومية والترحيب بدفاتر الأستاذ" : "Fully automated journal entries and ledger postings"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "إدارة مراكز التكلفة المتعددة وحساب أرباح وخسائر المشاريع" : "Multi-cost center management and project P&L calculations"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "استخراج فوري للإقرارات الضريبية والقوائم المالية الختامية" : "Instant extraction of tax declarations and final financial statements"}</span>
                </li>
              </ul>
            </div>

            {/* Inventory */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">📦</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "المستودعات والمخازن" : "Inventory & Warehouse"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تتبع المخزون بالدفعات (Batches) وتواريخ الصلاحية والأرقام التسلسلية" : "Batch tracking, expiry dates, and serial numbers"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "إدارة طلبات التحويل بين المخازن والفروع والموافقة عليها" : "Inter-warehouse and branch transfer request management"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تكامل تام مع قارئ الباركود والجرد الإلكتروني الذكي" : "Full integration with barcode scanners for smart digital stocktakes"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "إشعارات تنبيهية تلقائية عند وصول الأصناف لحد الطلب" : "Automated reorder point notifications to prevent stockouts"}</span>
                </li>
              </ul>
            </div>

            {/* HR & Payroll */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">👥</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "الموارد البشرية والرواتب" : "HR & Payroll"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "احتساب مسير الرواتب بضغطة زر وتصدير ملف الـ WPS المعتمد" : "One-click payroll run with compliant WPS bank file export"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تكامل مع أجهزة البصمة المحلية لحساب الحضور والغياب" : "Direct integration with local biometric devices for attendance"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "حساب تلقائي لمستحقات التأمينات الاجتماعية ومكافأة نهاية الخدمة" : "Automated calculations for GOSI and End of Service (EOS) benefits"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "إدارة الطلبات الذاتية للموظفين (إجازات، عهد، سلف)" : "Employee self-service request portal (leaves, advances, assets)"}</span>
                </li>
              </ul>
            </div>

            {/* ZATCA Phase 2 */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🛡️</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "الربط مع هيئة الزكاة والضريبة" : "ZATCA Phase 2 Integration"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "توليد وحفظ الفواتير الإلكترونية بصيغة XML المتوافقة تماماً" : "XML invoice generation and storage in complete compliance"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "توقيع الفاتورة رقمياً وربطها لحظياً مع بوابة (فاتورة) للمرحلة الثانية" : "Cryptographic signing and real-time API syncing with Fatoora Portal"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "إنشاء وتضمين رموز الاستجابة السريعة (QR Codes) المشفرة تلقائياً" : "Automatic generation of encrypted QR Codes on all invoices"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "المرونة التامة وإمكانية العمل في وضع عدم الاتصال بالإنترنت" : "Offline billing capacity with delayed auto-sync for uninterrupted sales"}</span>
                </li>
              </ul>
            </div>

            {/* Manufacturing */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🏭</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "التصنيع والإنتاج" : "Manufacturing & Production"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تحديد قائمة المواد (BOM) ومراحل التصنيع بوضوح" : "Define Bills of Materials (BOM) and production routing steps"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "أتمتة طلبات صرف المواد الخام بناء على أوامر الإنتاج" : "Automated raw material dispatch requests based on work orders"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "حساب التكاليف الإجمالية للمنتج (المواد + العمالة + المصاريف غير المباشرة)" : "Full costing analysis (raw materials + direct labor + overheads)"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "تخطيط متطلبات المواد وجدولة خطوط الإنتاج بكفاءة" : "Material Requirements Planning (MRP) and production scheduling"}</span>
                </li>
              </ul>
            </div>

            {/* Security & Ownership */}
            <div className="rounded-2xl border border-gray-100 bg-slate-50/50 p-6">
              <span className="text-3xl">🔑</span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {isArabic ? "أمن البيانات والملكية الكاملة" : "Data Security & Ownership"}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "البيانات مخزنة داخل خوادمك ولا يتم إرسالها خارج الشركة أبداً" : "Data is stored on your local servers and never sent outside the organization"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "الامتثال التام لقانون حماية البيانات الشخصية بالمملكة" : "100% compliance with Saudi Personal Data Protection Law (PDPL)"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "ترخيص دائم تملكه مدى الحياة بدون اشتراكات أو فواتير شهرية" : "One-off perpetual license owned for life, with no recurring monthly bills"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">✓</span>
                  <span>{isArabic ? "إعداد نظام نسخ احتياطي تلقائي ومجدول على أقراص خارجية" : "Automatic and scheduled backup routines on external storage or private NAS"}</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* NEW: Technical Specifications Section */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-extrabold text-text-primary">
              {isArabic ? "المواصفات الفنية والمتطلبات التشغيلية" : "Technical Specifications & Requirements"}
            </h2>
            <p className="mt-4 text-text-secondary">
              {isArabic 
                ? "كل ما تحتاج معرفته عن البنية التحتية المطلوبة لتشغيل خادم فالكون ديسكتوب ERP محلياً" 
                : "Everything you need to know about the infrastructure needed to deploy Falcon ERP on-premise"}
            </p>
          </div>

          <div className="mx-auto max-w-4xl bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-start">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-gray-100 pb-2">
                  {isArabic ? "متطلبات الخادم (Server Specs)" : "Server Requirements"}
                </h3>
                <ul className="space-y-3 text-sm text-text-secondary">
                  <li><strong>{isArabic ? "نظام التشغيل:" : "OS:"}</strong> Windows Server 2019/2022 {isArabic ? "أو" : "or"} Linux Ubuntu 22.04 LTS</li>
                  <li><strong>{isArabic ? "المعالج (CPU):" : "CPU:"}</strong> Intel Xeon {isArabic ? "أو معالج ثماني النواة كحد أدنى" : "or 8-core CPU minimum"}</li>
                  <li><strong>{isArabic ? "الذاكرة العشوائية (RAM):" : "RAM:"}</strong> 16 GB RAM {isArabic ? "لـ 20 مستخدماً" : "for up to 20 users"} / 32 GB RAM {isArabic ? "لأكثر من ذلك" : "for more"}</li>
                  <li><strong>{isArabic ? "سعة التخزين:" : "Storage:"}</strong> 100 GB SSD/NVMe {isArabic ? "مساحة فارغة (توصية)" : "free space (Recommended)"}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-gray-100 pb-2">
                  {isArabic ? "قواعد البيانات والشبكة" : "Database & Network"}
                </h3>
                <ul className="space-y-3 text-sm text-text-secondary">
                  <li><strong>{isArabic ? "محرك قواعد البيانات:" : "Database Engine:"}</strong> PostgreSQL 15+ {isArabic ? "(افتراضي ومجاني)" : "(Default, Open-source)"} / Microsoft SQL Server</li>
                  <li><strong>{isArabic ? "الشبكة الداخلية:" : "Local Network:"}</strong> 1 Gbps Ethernet LAN {isArabic ? "لضمان سرعة تبادل البيانات" : "for seamless file and database exchange"}</li>
                  <li><strong>{isArabic ? "الوصول الخارجي (اختياري):" : "Remote Access (Optional):"}</strong> IP {isArabic ? "ثابت (Static IP) مع اتصال VPN آمن للوصول من خارج المكتب" : "Static IP with secure VPN tunnel configuration"}</li>
                  <li><strong>{isArabic ? "النسخ الاحتياطي:" : "Backups:"}</strong> {isArabic ? "دعم النسخ الاحتياطي السحابي التلقائي (خارج الموقع) المشفر" : "Integrated support for encrypted off-site cloud backups"}</li>
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

      {/* Section 6: Who It's For */}
      <IndustryGrid
        variant="compact"
        eyebrow={tp("whoItsForEyebrow")}
        title={tp("whoItsForTitle")}
        ctaText={tp("whoItsForCtaText")}
        ctaHref="/contact"
      />

      {/* NEW: Specific Product FAQ */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100">
        <Container>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-extrabold text-text-primary">
              {isArabic ? "الأسئلة الشائعة حول النسخة المكتبية" : "Desktop Version FAQ"}
            </h2>
            <p className="mt-4 text-text-secondary">
              {isArabic 
                ? "إجابات شافية حول ترخيص واستخدام وأمان نظام فالكون ERP المحلي" 
                : "Clear answers to common questions about Falcon ERP on-premise licensing, usage, and security"}
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-6 text-start">
            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-text-primary text-base">
                {isArabic ? "هل يحتاج النظام لوجود اتصال مستمر بالإنترنت؟" : "Does the system require a continuous internet connection?"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {isArabic 
                  ? "لا، فالكون ديسكتوب يعمل بالكامل داخل شبكتك المحلية بدون إنترنت. يتم فقط الاتصال بالإنترنت بشكل مؤقت ومحمي عند إرسال وربط الفواتير مع هيئة الزكاة (ZATCA)، مما يضمن استمرارية الفوترة والبيع حتى في حال انقطاع الإنترنت."
                  : "No, Falcon Desktop runs entirely within your local office network and does not require active internet for daily activities. An internet connection is only briefly used to authenticate and submit invoices to ZATCA, ensuring you can keep billing even during internet outages."}
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-text-primary text-base">
                {isArabic ? "ما هي آلية الحصول على التحديثات وخاصة المتعلقة بهيئة الزكاة؟" : "How are ZATCA and system updates delivered?"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {isArabic 
                  ? "نوفر خطة دعم وصيانة سنوية تضمن حصولك الفوري على كافة التحديثات البرمجية وتحديثات الامتثال القانوني والضريبي فور صدورها من الهيئة، ويقوم فريقنا بتثبيتها وتدريب فريقك عليها مجاناً."
                  : "We offer an annual maintenance and support SLA that guarantees you receive all system updates and tax compliance adjustments as soon as ZATCA announces changes. Our certified technical team will apply the updates for you."}
              </p>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-text-primary text-base">
                {isArabic ? "هل هناك حد أقصى لعدد المستخدمين أو حجم البيانات؟" : "Is there a user or database limit?"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {isArabic 
                  ? "لا يوجد أي حد برمجي مفروض من النظام. حجم البيانات وعدد المستخدمين النشطين يعتمد بالكامل على مواصفات الخادم الخاص بك. يمكنك إضافة أي عدد من المستخدمين وترقية مواصفات جهاز السيرفر بحرية تامة."
                  : "There is no software-imposed limit on database size or user count. It depends entirely on your server hardware capacity. You are free to upgrade your server and add users as your organization grows."}
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
    </>
  );
}
