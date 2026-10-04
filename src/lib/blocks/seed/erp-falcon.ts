/**
 * Falcon ERP page seed. Module and capability statements come only from the
 * Falcon ERP company handbook (2026-09-30: module catalog and product chapters
 * 02 to 07, ZATCA chapter); the Desktop, Cloud and hybrid lines repeat what
 * messages/*.json (desktopPage, cloudPage) already said. Falcon ERP is
 * Falcon's own product; it is never presented as built on Odoo.
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
        "The modules work on the same data: an invoice creates its stock movement and its journal entry from the same document, according to your settings.",
        "الوحدات تعمل على البيانات نفسها: الفاتورة تُنشئ حركة المخزون والقيد المحاسبي من المستند نفسه، حسب إعداداتك.",
      ),
      items: [
        {
          icon: "Calculator",
          title: b("Accounting & finance", "المحاسبة والمالية"),
          line: b(
            "General ledger, cash and banks, tax, budgets, letters of guarantee and loans.",
            "دفتر الأستاذ والصناديق والبنوك والضرائب والموازنات وخطابات الضمان والقروض.",
          ),
        },
        {
          icon: "Briefcase",
          title: b("Fixed assets", "الأصول الثابتة"),
          line: b(
            "The asset register, depreciation posted to the accounts, and disposal.",
            "سجل الأصول، والإهلاك مرحّلًا إلى الحسابات، والاستبعاد.",
          ),
        },
        {
          icon: "Receipt",
          title: b("Fatoora e-invoicing", "الفوترة الإلكترونية"),
          line: b(
            "Standard and simplified e-invoices with QR codes, sent to ZATCA for clearance or reporting.",
            "فواتير إلكترونية قياسية ومبسّطة برمز QR، تُرسل إلى هيئة الزكاة والضريبة والجمارك للاعتماد أو الإبلاغ.",
          ),
        },
        {
          icon: "Package",
          title: b("Inventory & warehouses", "المخزون والمستودعات"),
          line: b(
            "Items, units and barcodes, receipts, issues, transfers between warehouses and stock counts.",
            "الأصناف والوحدات والباركود، والإضافة والصرف والتحويل بين المستودعات والجرد.",
          ),
        },
        {
          icon: "ShoppingCart",
          title: b("Purchasing", "المشتريات"),
          line: b(
            "Purchase requests and approvals, purchase orders with payment schedules, and supplier invoices.",
            "طلبات الشراء واعتمادها، وأوامر الشراء بجداول دفعاتها، وفواتير الموردين.",
          ),
        },
        {
          icon: "Handshake",
          title: b("Sales", "المبيعات"),
          line: b(
            "Quotations, sales orders, invoices and returns, price lists and salesperson commissions.",
            "عروض الأسعار وطلبات البيع والفواتير والمرتجعات، وقوائم الأسعار وعمولات المندوبين.",
          ),
        },
        {
          icon: "Storefront",
          title: b("Point of sale", "نقاط البيع"),
          line: b(
            "Cash, card and credit sales, with cashier shifts opened and closed against the cash box.",
            "البيع نقدًا وبالشبكة وبالآجل، مع فتح ورديات الكاشير وإقفالها على الصندوق.",
          ),
        },
        {
          icon: "UsersThree",
          title: b("HR & payroll", "الموارد البشرية والرواتب"),
          line: b(
            "Employee records, attendance and shifts, leave and payroll.",
            "ملفات الموظفين، والحضور والورديات، والإجازات والرواتب.",
          ),
        },
        {
          icon: "Factory",
          title: b("Manufacturing", "التصنيع"),
          line: b(
            "Production plans, manufacturing orders and the materials each order needs.",
            "خطط الإنتاج وأوامر التصنيع، والخامات التي يحتاجها كل أمر.",
          ),
        },
        {
          icon: "Kanban",
          title: b("Projects & contracting", "المشاريع والمقاولات"),
          line: b(
            "Tenders, the technical office, project budgets and subcontractor extracts.",
            "العطاءات والمكتب الفني وموازنات المشاريع ومستخلصات مقاولي الباطن.",
          ),
        },
        {
          icon: "Buildings",
          title: b("Real estate", "العقارات"),
          line: b(
            "Properties and units, lease and sale contracts, and instalment collection.",
            "العقارات والوحدات، وعقود الإيجار والبيع، وتحصيل الأقساط.",
          ),
        },
        {
          icon: "Bed",
          title: b("Hotels", "الفنادق"),
          line: b(
            "Rooms, reservations, guest check-in and check-out, and housekeeping.",
            "الغرف والحجوزات، ودخول النزلاء وخروجهم، والإشراف الداخلي.",
          ),
        },
        {
          icon: "Wrench",
          title: b("Equipment & maintenance", "المعدات والصيانة"),
          line: b(
            "Equipment rental, maintenance plans and requests, and customer maintenance contracts.",
            "تأجير المعدات، وخطط الصيانة وطلباتها، وعقود صيانة العملاء.",
          ),
        },
        {
          icon: "Truck",
          title: b("Transport", "النقل"),
          line: b(
            "Transport orders, waybills and transport invoices.",
            "أوامر النقل والبوالص وفواتير النقل.",
          ),
        },
        {
          icon: "ChartBar",
          title: b("Reports & dashboards", "التقارير ولوحات المتابعة"),
          line: b(
            "A report designer for your own layouts, and dashboards shown by user permission.",
            "مصمّم تقارير لتنسيقاتك الخاصة، ولوحات متابعة تظهر حسب صلاحيات كل مستخدم.",
          ),
        },
      ],
    },
  },
  {
    type: "departments",
    content: {
      heading: b("Desktop, Cloud or both.", "ديسكتوب أو كلاود، أو الاثنان."),
      intro: b(
        "Pick where Falcon ERP runs. We agree it with you before we start.",
        "اختر أين يعمل فالكون ERP، ونتفق على ذلك معك قبل البدء.",
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
        "فالكون ERP منتجنا الخاص، لذلك نستطيع تكييفه وفق المتطلبات السعودية وطريقة عمل محاسبيك.",
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
            "شاشات وتقارير عربية أولًا، يتعلّمها المحاسبون بسرعة.",
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
