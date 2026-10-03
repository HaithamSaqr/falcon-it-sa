/**
 * Odoo services page seed. Facts from messages/*.json (odooPage) and the
 * approved mockups. Partner tiers, certifications and project counts from the
 * old page are deliberately left out until confirmed.
 */
import { b, demoCta, noCta } from "../fields";
import { seedPage } from "./helpers";
import { erpFitBlock, processBlock, FATOORA_FAQ } from "./common";

export const ERP_ODOO_SEED = seedPage("erp:odoo", [
  {
    type: "hero",
    content: {
      title: b("Odoo, set up for how your company works.", "أودو، مضبوط على طريقة عمل شركتك."),
      subtitle: b(
        "Implementation, custom development, data migration, training and support, from a team that also builds its own ERP.",
        "التطبيق والتطوير الخاص وترحيل البيانات والتدريب والدعم، من فريق يطوّر نظامه الخاص أيضًا.",
      ),
      primaryCta: demoCta(),
      secondaryCta: { label: b("Compare with Falcon ERP", "قارنه بفالكون ERP"), href: "/erp/falcon" },
      sectorsLabel: b(""),
      card: {
        image: "/images/v2/logo-odoo.png",
        alt: b("Odoo", "أودو"),
        caption: b("The global ERP, set up for you", "النظام العالمي، مضبوط لك"),
      },
      sectorPills: [],
    },
  },
  {
    type: "departments",
    content: {
      heading: b("What we do on Odoo.", "ما نقدّمه على أودو."),
      intro: b(
        "From the first assessment to support after go-live, one team handles your Odoo project.",
        "من أول تقييم إلى الدعم بعد التشغيل، فريق واحد يتولى مشروع أودو لديك.",
      ),
      items: [
        {
          icon: "Rocket",
          title: b("Implementation", "التنفيذ"),
          line: b(
            "Requirements, configuration, data migration, testing and go-live, with hands-on training.",
            "تحليل المتطلبات والإعداد وترحيل البيانات والاختبار والتشغيل، مع تدريب عملي.",
          ),
        },
        {
          icon: "Code",
          title: b("Custom development", "التطوير الخاص"),
          line: b(
            "Custom modules, workflows, reports and integrations built around your process.",
            "وحدات وإجراءات وتقارير وتكاملات خاصة مبنية حول عملك.",
          ),
        },
        {
          icon: "Database",
          title: b("Data migration", "ترحيل البيانات"),
          line: b(
            "From your current system or spreadsheets into Odoo, mapped, cleaned and validated.",
            "من نظامك الحالي أو ملفات Excel إلى أودو، مع المطابقة والتنظيف والتحقّق.",
          ),
        },
        {
          icon: "GraduationCap",
          title: b("Training", "التدريب"),
          line: b(
            "Hands-on training in Arabic and English for every role, on site or remote.",
            "تدريب عملي بالعربية والإنجليزية لكل دور، في موقعك أو عن بُعد.",
          ),
        },
        {
          icon: "Lifebuoy",
          title: b("Support", "الدعم"),
          line: b(
            "Arabic-speaking support after go-live, for fixes, new modules and new branches.",
            "دعم يتحدث العربية بعد التشغيل، للإصلاحات والوحدات الجديدة والفروع الجديدة.",
          ),
        },
        {
          icon: "Receipt",
          title: b("Saudi setup", "الإعداد السعودي"),
          line: b(
            "Fatoora e-invoicing, Arabic localisation and VAT configured for Saudi Arabia.",
            "الفوترة الإلكترونية المتوافقة مع منصة فاتورة، والتعريب، وإعداد ضريبة القيمة المضافة للسعودية.",
          ),
        },
      ],
    },
  },
  {
    type: "setup_list",
    content: {
      heading: b(
        "When an Odoo project goes wrong, it is usually the setup, not the software.",
        "حين يتعثر مشروع أودو، فالسبب غالبًا في الإعداد، لا في البرنامج.",
      ),
      intro: b(
        "Odoo can run almost any business. Whether it runs yours depends on how it is configured.",
        "أودو قادر على تشغيل أغلب الأنشطة، أما أن يشغّل نشاطك أنت فيعتمد على طريقة إعداده.",
      ),
      points: [
        {
          problem: b("Workflows copied from another country", "إجراءات منسوخة من بلد آخر"),
          fix: b(
            "We configure Odoo around Saudi requirements and your own process.",
            "نضبط أودو على المتطلبات السعودية وإجراءاتك أنت.",
          ),
        },
        {
          problem: b("An implementation that has to be redone", "تنفيذ يحتاج إلى إعادة"),
          fix: b(
            "A written blueprint agreed before we build, so the scope does not drift.",
            "مخطط مكتوب نتفق عليه قبل البناء، فلا ينحرف النطاق.",
          ),
        },
        {
          problem: b("Support that doesn't speak your team's language", "دعم لا يتحدث لغة فريقك"),
          fix: b(
            "Arabic-speaking implementers and support, from the first call to after go-live.",
            "فريق تطبيق ودعم يتحدث العربية، من أول اتصال إلى ما بعد التشغيل.",
          ),
        },
      ],
      link: noCta(),
    },
  },
  erpFitBlock(),
  processBlock(),
  {
    type: "faq_ref",
    content: {
      heading: b("Questions about Odoo", "أسئلة عن أودو"),
      items: [
        {
          question: b("Which Odoo apps can you set up?", "ما تطبيقات أودو التي تجهّزونها؟"),
          answer: b(
            "The ones your business needs, such as accounting, inventory, sales and CRM, purchasing, manufacturing, eCommerce and HR. We start with what you need now and add the rest as you grow.",
            "ما يحتاجه عملك، مثل المحاسبة والمخزون والمبيعات وCRM والمشتريات والتصنيع والمتجر الإلكتروني والموارد البشرية. نبدأ بما تحتاجه الآن ونضيف الباقي مع نموك.",
          ),
        },
        {
          question: b("We already run Odoo. Can you take over?", "نستخدم أودو حاليًا، هل تتولون المشروع؟"),
          answer: b(
            "Yes. We review your current setup, fix what is not working and support it from there.",
            "نعم. نراجع إعدادك الحالي، ونصلح ما لا يعمل، ونتولى دعمه بعد ذلك.",
          ),
        },
        FATOORA_FAQ,
        {
          question: b("Can you build features Odoo does not have?", "هل تبنون مزايا غير موجودة في أودو؟"),
          answer: b(
            "Yes. Our developers build custom modules and integrations around your process, as part of the agreed scope.",
            "نعم. مطوّرونا يبنون وحدات وتكاملات خاصة حول إجراءاتك، ضمن النطاق المتفق عليه.",
          ),
        },
      ],
    },
  },
  {
    type: "booking",
    content: {
      heading: b("See Odoo running on your own workflow.", "شاهد أودو يعمل على دورة عملك."),
      body: b(
        "In one session, a senior implementer shows you Odoo on your processes, then sends a written recommendation: which apps, what scope, how long.",
        "في جلسة واحدة، يعرض لك مستشار تطبيق خبير أودو على إجراءاتك، ثم يرسل لك توصية مكتوبة: أي تطبيقات، أي نطاق، وكم من الوقت.",
      ),
      cta: demoCta(),
      noteTitle: b("Free, no commitment.", "مجانية وبلا التزام."),
      note: b(
        "No prices online because every business runs differently; your proposal comes in writing after the session.",
        "لا أسعار على الموقع لأن لكل نشاط طريقته؛ وعرضك يصلك مكتوبًا بعد الجلسة.",
      ),
    },
  },
]);
