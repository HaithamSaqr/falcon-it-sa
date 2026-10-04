/**
 * FAQ page seed. The questions are the real FAQ set from DEFAULT_CONTENT
 * (src/lib/db/defaults.ts), rewritten without the retired claims (free trial,
 * certification, fixed migration times, SLA tiers).
 */
import { b } from "../fields";
import { seedPage } from "./helpers";
import { FATOORA_FAQ, NOT_BUILT_ON_ODOO_FAQ, NO_PRICES_FAQ, generalBookingBlock } from "./common";

export const FAQ_SEED = seedPage("faq", [
  {
    type: "faq_ref",
    content: {
      heading: b("Questions we hear often", "أسئلة نسمعها كثيرًا"),
      items: [
        {
          question: b("How do I book a demo?", "كيف أحجز عرضًا تجريبيًا؟"),
          answer: b(
            "Use the demo form. Our team contacts you to confirm a time and asks a few questions, so the session uses your own workflow.",
            "عبر نموذج العرض التجريبي. يتواصل معك فريقنا لتأكيد الموعد ويسألك بعض الأسئلة، لتكون الجلسة على دورة عملك أنت.",
          ),
        },
        {
          question: b("How long does implementation take?", "كم يستغرق التطبيق؟"),
          answer: b(
            "It depends on the scope. As a typical range: assessment 1 day, blueprint 1 to 2 weeks, build 4 to 8 weeks and training 1 to 2 weeks. Your proposal gives your exact timeline.",
            "يعتمد على النطاق. المدد المعتادة: التقييم يوم واحد، والمخطط من أسبوع إلى أسبوعين، والبناء من 4 إلى 8 أسابيع، والتدريب من أسبوع إلى أسبوعين. ويحدد عرضك جدولك الدقيق.",
          ),
        },
        FATOORA_FAQ,
        {
          question: b(
            "Can we move from SAP, Oracle, Odoo or another system?",
            "هل يمكننا الانتقال من SAP أو Oracle أو أودو أو نظام آخر؟",
          ),
          answer: b(
            "Yes. Extracting, mapping, cleaning and validating your data is part of the migration plan, and we reconcile balances with you before go-live.",
            "نعم. استخراج بياناتك ومطابقتها وتنظيفها والتحقّق منها جزء من خطة الترحيل، ونطابق الأرصدة معك قبل التشغيل.",
          ),
        },
        {
          question: b("Can Falcon ERP run on our own servers?", "هل يعمل فالكون ERP على سيرفراتنا؟"),
          answer: b(
            "Yes. Falcon Desktop runs on your own servers, inside your network. Falcon Cloud runs in the browser, and you can combine the two.",
            "نعم. فالكون ديسكتوب يعمل على سيرفراتك داخل شبكتك، وفالكون كلاود يعمل من المتصفح، ويمكن الجمع بينهما.",
          ),
        },
        NOT_BUILT_ON_ODOO_FAQ,
        {
          question: b("Which sectors do you work with?", "ما القطاعات التي تعملون معها؟"),
          answer: b(
            "Real estate and construction, manufacturing, trading and distribution, restaurants and hospitality, retail and e-commerce, logistics and fleet, and professional services. If yours is not listed, book a demo and tell us how you work.",
            "العقارات والمقاولات، والتصنيع، والتجارة والتوزيع، والمطاعم والضيافة، والتجزئة والتجارة الإلكترونية، والخدمات اللوجستية والأساطيل، والخدمات المهنية. وإن لم تجد قطاعك، احجز عرضًا تجريبيًا وأخبرنا كيف تعمل.",
          ),
        },
        {
          question: b("What support do you offer after go-live?", "ما الدعم الذي تقدّمونه بعد التشغيل؟"),
          answer: b(
            "We stay after go-live for fixes, new modules and new branches, including support on WhatsApp. The support level is agreed in your proposal.",
            "نبقى معك بعد التشغيل للإصلاحات والوحدات والفروع الجديدة، ويشمل ذلك الدعم عبر واتساب. ويُتفق على مستوى الدعم في عرضك.",
          ),
        },
        NO_PRICES_FAQ,
      ],
    },
  },
  generalBookingBlock(),
]);
