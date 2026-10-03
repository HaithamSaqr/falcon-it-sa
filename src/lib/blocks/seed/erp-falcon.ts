/**
 * Falcon ERP page seed. Facts from messages/*.json (desktopPage, cloudPage),
 * the approved mockups and the product screenshots. Falcon ERP is Falcon's own
 * product; it is never presented as built on Odoo.
 */
import { b, demoCta, noCta } from "../fields";
import { seedPage } from "./helpers";
import { erpFitBlock, processBlock, FATOORA_FAQ, NOT_BUILT_ON_ODOO_FAQ } from "./common";

export const ERP_FALCON_SEED = seedPage("erp:falcon", [
  {
    type: "hero",
    content: {
      title: b("Falcon ERP. Our own ERP, built in-house.", "فالكون ERP. نظامنا الخاص، طوّرناه بأنفسنا."),
      subtitle: b(
        "Accounting, inventory, sales, HR, manufacturing and Fatoora e-invoicing in one Arabic-first system. Run it on your own servers, in Falcon Cloud from the browser, or both.",
        "المحاسبة والمخزون والمبيعات والموارد البشرية والتصنيع والفوترة الإلكترونية في نظام واحد عربي أولًا. شغّله على سيرفراتك، أو في فالكون كلاود من المتصفح، أو الاثنين معًا.",
      ),
      primaryCta: demoCta(),
      secondaryCta: { label: b("Compare with Odoo", "قارنه بأودو"), href: "/erp/odoo" },
      sectorsLabel: b(""),
      card: {
        image: "/images/v2/shot-sales-dashboard.jpg",
        alt: b("Falcon ERP sales dashboard in Arabic", "لوحة المبيعات في فالكون ERP بالعربية"),
        caption: b("The sales dashboard, in Arabic", "لوحة المبيعات، بالعربية"),
      },
      sectorPills: [],
    },
  },
  {
    type: "departments",
    content: {
      heading: b("Every department, one Arabic-first system.", "كل الأقسام في نظام واحد، عربي أولًا."),
      intro: b(
        "The modules share the same data, so a sale, a stock movement and its journal entry are one transaction, not three.",
        "الوحدات تتشارك البيانات نفسها، فالبيع وحركة المخزون والقيد المحاسبي عملية واحدة لا ثلاث.",
      ),
      items: [
        {
          icon: "Calculator",
          title: b("Accounting & finance", "المحاسبة والمالية"),
          line: b(
            "General ledger, payables and receivables, fixed assets, budgets, multi-currency and bank reconciliation.",
            "دفتر الأستاذ والذمم الدائنة والمدينة والأصول الثابتة والموازنات وتعدد العملات وتسوية البنوك.",
          ),
        },
        {
          icon: "Receipt",
          title: b("Fatoora e-invoicing", "الفوترة الإلكترونية"),
          line: b(
            "ZATCA e-invoices with QR codes and credit and debit notes, built into the system.",
            "فواتير إلكترونية متوافقة مع هيئة الزكاة والضريبة والجمارك برمز QR وإشعارات دائن ومدين، ضمن النظام نفسه.",
          ),
        },
        {
          icon: "Package",
          title: b("Inventory & warehouses", "المخزون والمستودعات"),
          line: b(
            "Stock across warehouses with barcodes, reordering and batch or serial tracking.",
            "المخزون في كل المستودعات مع الباركود وإعادة الطلب وتتبّع الدفعات والأرقام التسلسلية.",
          ),
        },
        {
          icon: "Handshake",
          title: b("Sales & CRM", "المبيعات وإدارة العملاء"),
          line: b(
            "Leads, quotations, follow-ups and the sales pipeline in one place.",
            "العملاء المحتملون وعروض الأسعار والمتابعات ومسار المبيعات في مكان واحد.",
          ),
        },
        {
          icon: "UsersThree",
          title: b("HR & payroll", "الموارد البشرية والرواتب"),
          line: b(
            "Employee records, leave, payroll and end-of-service calculations.",
            "ملفات الموظفين والإجازات والرواتب وحساب مكافأة نهاية الخدمة.",
          ),
        },
        {
          icon: "Factory",
          title: b("Manufacturing", "التصنيع"),
          line: b(
            "Bills of materials, work orders, quality control and cost tracking.",
            "قوائم المواد وأوامر العمل ومراقبة الجودة وتتبّع التكلفة.",
          ),
        },
        {
          icon: "Kanban",
          title: b("Projects", "المشاريع"),
          line: b(
            "Projects and tasks with their cost, in the same system as the accounts.",
            "المشاريع والمهام بتكلفتها، في النظام نفسه مع الحسابات.",
          ),
        },
        {
          icon: "Buildings",
          title: b("Real estate", "العقارات"),
          line: b(
            "Property directory, owners and brokers, lease contracts and receipt vouchers.",
            "الدليل العقاري والملاك والوسطاء وعقود الإيجار وسندات القبض.",
          ),
        },
        {
          icon: "Storefront",
          title: b("POS & hospitality", "نقاط البيع والضيافة"),
          line: b("Point of sale, kitchen screen and hotel modules.", "نقاط البيع وشاشة المطبخ والفندق."),
        },
        {
          icon: "Wrench",
          title: b("Equipment & maintenance", "المعدات والصيانة"),
          line: b("Equipment, maintenance and rental.", "المعدات والصيانة والتأجير."),
        },
      ],
    },
  },
  {
    type: "departments",
    content: {
      heading: b("Desktop, Cloud or both.", "ديسكتوب أو كلاود، أو الاثنان."),
      intro: b(
        "Pick where Falcon ERP runs. We plan it with you in the blueprint.",
        "اختر أين يعمل فالكون ERP، ونخطط لذلك معك في المخطط.",
      ),
      items: [
        {
          icon: "Desktop",
          title: b("Falcon Desktop", "فالكون ديسكتوب"),
          line: b(
            "Installed on your own servers, inside your network. Your data stays with you.",
            "يُثبَّت على سيرفراتك داخل شبكتك، وتبقى بياناتك عندك.",
          ),
        },
        {
          icon: "Cloud",
          title: b("Falcon Cloud", "فالكون كلاود"),
          line: b(
            "In the browser, from any device, with every branch working on the same data.",
            "من المتصفح وعلى أي جهاز، وكل الفروع تعمل على البيانات نفسها.",
          ),
        },
        {
          icon: "ArrowsLeftRight",
          title: b("Hybrid", "الاثنان معًا"),
          line: b(
            "A mix of Desktop and Cloud, planned around your offices and branches.",
            "مزيج من ديسكتوب وكلاود، مخطط حسب مكاتبك وفروعك.",
          ),
        },
      ],
    },
  },
  {
    type: "setup_list",
    content: {
      heading: b("Built for how your team works.", "مبني على طريقة عمل فريقك."),
      intro: b(
        "Falcon ERP is our own product, so we can shape it around Saudi requirements and the way your accountants work.",
        "فالكون ERP منتجنا الخاص، لذلك نستطيع تشكيله حول المتطلبات السعودية وطريقة عمل محاسبيك.",
      ),
      points: [
        {
          problem: b("Your data on someone else's servers", "بياناتك على سيرفرات غيرك"),
          fix: b(
            "Falcon Desktop runs on your own servers, so financial and employee records stay with you.",
            "فالكون ديسكتوب يعمل على سيرفراتك، فتبقى البيانات المالية وبيانات الموظفين عندك.",
          ),
        },
        {
          problem: b("A system the accountants avoid", "نظام يتجنّبه المحاسبون"),
          fix: b(
            "Arabic-first screens and reports, quick for accountants to learn.",
            "شاشات وتقارير عربية أولًا، سريعة التعلّم على المحاسبين.",
          ),
        },
        {
          problem: b("Features you pay for and never use", "مزايا تدفع ثمنها ولا تستخدمها"),
          fix: b(
            "We set up the modules you need now, and add the rest when you grow.",
            "نجهّز الوحدات التي تحتاجها الآن، ونضيف الباقي حين تكبر.",
          ),
        },
        {
          problem: b("E-invoicing bolted on", "فوترة إلكترونية كإضافة خارجية"),
          fix: b(
            "Fatoora e-invoicing is part of the system, not an add-on.",
            "الفوترة الإلكترونية جزء من النظام، لا إضافة خارجية.",
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
      heading: b("Questions about Falcon ERP", "أسئلة عن فالكون ERP"),
      items: [
        NOT_BUILT_ON_ODOO_FAQ,
        {
          question: b("Where does our data live?", "أين تُحفظ بياناتنا؟"),
          answer: b(
            "With Falcon Desktop, on your own servers inside your network. With Falcon Cloud, on the cloud setup we agree with you in the blueprint.",
            "مع فالكون ديسكتوب، على سيرفراتك داخل شبكتك. ومع فالكون كلاود، على الإعداد السحابي الذي نتفق عليه معك في المخطط.",
          ),
        },
        FATOORA_FAQ,
        {
          question: b("Is it in Arabic?", "هل النظام بالعربية؟"),
          answer: b(
            "Yes. Falcon ERP is Arabic-first: screens, financial reports and invoices work in Arabic from right to left.",
            "نعم. فالكون ERP عربي أولًا: الشاشات والتقارير المالية والفواتير بالعربية ومن اليمين إلى اليسار.",
          ),
        },
        {
          question: b("Can you move our data from our current system?", "هل تنقلون بياناتنا من نظامنا الحالي؟"),
          answer: b(
            "Yes. Opening balances, items, customers, suppliers and open documents are part of the migration plan, and we reconcile them with you before go-live.",
            "نعم. الأرصدة الافتتاحية والأصناف والعملاء والموردون والمستندات المفتوحة جزء من خطة الترحيل، ونطابقها معك قبل التشغيل.",
          ),
        },
      ],
    },
  },
  {
    type: "booking",
    content: {
      heading: b("See Falcon ERP running on your own workflow.", "شاهد فالكون ERP يعمل على دورة عملك."),
      body: b(
        "In one session, a senior implementer shows you Falcon ERP on your processes, then sends a written recommendation: which modules, which deployment, how long.",
        "في جلسة واحدة، يعرض لك مستشار تطبيق خبير فالكون ERP على إجراءاتك، ثم يرسل لك توصية مكتوبة: أي وحدات، وأي طريقة تشغيل، وكم من الوقت.",
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
