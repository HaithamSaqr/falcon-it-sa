/** Manufacturing sector page seed (EN + AR), same structure as sector:real-estate. */
import { b } from "../fields";
import { seedPage } from "./helpers";
import { sectorBlocks, FATOORA_FAQ } from "./common";

const roles = [
  { id: "owner", label: b("Owner", "المالك") },
  { id: "plant", label: b("Plant manager", "مدير المصنع") },
  { id: "fin", label: b("Finance", "المدير المالي") },
];

export const SECTOR_MANUFACTURING_SEED = seedPage(
  "sector:manufacturing",
  sectorBlocks({
    slug: "manufacturing",
    roles,
    promise: {
      owner: {
        title: b("Know the real cost of every product you sell.", "اعرف التكلفة الحقيقية لكل منتج تبيعه."),
        subtitle: b(
          "Materials, labour and overhead rolled into each product, so you price with numbers, not guesses.",
          "المواد والعمالة والمصاريف غير المباشرة محمّلة على كل منتج، فتسعّر بالأرقام لا بالتخمين.",
        ),
      },
      plant: {
        title: b("Production orders your floor can actually follow.", "أوامر إنتاج يلتزم بها المصنع فعلًا."),
        subtitle: b(
          "Materials checked before the shift starts, every order tracked from release to finished goods.",
          "المواد متوفرة قبل بداية الوردية، وكل أمر إنتاج متابَع من إطلاقه حتى المنتج النهائي.",
        ),
      },
      fin: {
        title: b("Close the month without chasing the factory.", "أقفل الشهر دون أن تلاحق المصنع."),
        subtitle: b(
          "Stock movements, production cost and Fatoora e-invoices post to the accounts as they happen.",
          "حركات المخزون وتكلفة الإنتاج والفواتير الإلكترونية تُرحَّل للحسابات لحظة حدوثها.",
        ),
      },
    },
    lifecycleHeading: b(
      "Order to delivery. One number through every stage.",
      "من الطلب إلى التسليم، رقم واحد يمر بكل المراحل.",
    ),
    stages: [
      {
        title: b("Sales & orders", "المبيعات والطلبات"),
        description: b(
          "Quotes priced from real cost, and orders confirmed against stock and capacity.",
          "عروض أسعار مبنية على التكلفة الفعلية، وطلبات تُؤكَّد حسب المخزون والطاقة الإنتاجية.",
        ),
        modules: b("CRM, sales", "CRM، المبيعات"),
        roles: ["owner", "fin"],
      },
      {
        title: b("Planning & materials", "التخطيط والمواد"),
        description: b(
          "Bills of materials tell purchasing what to buy, and when.",
          "قوائم المواد تخبر المشتريات ماذا تشتري، ومتى.",
        ),
        modules: b("Bills of materials, planning", "قوائم المواد، التخطيط"),
        roles: ["owner", "plant"],
      },
      {
        title: b("Purchasing & receiving", "الشراء والاستلام"),
        description: b(
          "Purchase orders, goods received and supplier bills that match line by line.",
          "أوامر شراء واستلام بضاعة وفواتير موردين متطابقة بندًا ببند.",
        ),
        modules: b("Purchasing, inventory", "المشتريات، المخزون"),
        roles: ["plant", "fin"],
      },
      {
        title: b("Production", "الإنتاج"),
        description: b(
          "Work orders issue materials, record scrap and carry the real cost of each batch.",
          "أوامر العمل تصرف المواد، وتسجّل الهالك، وتحمل التكلفة الفعلية لكل دفعة.",
        ),
        modules: b("Manufacturing, quality", "التصنيع، الجودة"),
        roles: ["owner", "plant", "fin"],
      },
      {
        title: b("Warehouse & dispatch", "المستودع والشحن"),
        description: b(
          "Finished goods by batch and location, picked and shipped against the order.",
          "المنتج النهائي حسب الدفعة والموقع، يُجهَّز ويُشحن مقابل الطلب.",
        ),
        modules: b("Inventory, delivery", "المخزون، التسليم"),
        roles: ["plant"],
      },
      {
        title: b("Invoicing & collection", "الفوترة والتحصيل"),
        description: b(
          "Fatoora e-invoices, customer balances and the margin on every product.",
          "فواتير إلكترونية متوافقة مع منصة فاتورة، وأرصدة العملاء، وهامش كل منتج.",
        ),
        modules: b("Accounting, e-invoicing", "الحسابات، الفوترة الإلكترونية"),
        roles: ["owner", "fin"],
      },
    ],
    summary: {
      owner: {
        headline: b(
          "Every morning: what you made, what it cost and what you earned on it.",
          "كل صباح: ماذا أنتجت، وكم كلّف، وكم ربحت فيه.",
        ),
        points: [
          b("Real cost per product from materials, labour and overhead", "تكلفة فعلية لكل منتج من المواد والعمالة والمصاريف غير المباشرة"),
          b("Margin per product and per customer, not only per month", "هامش كل منتج وكل عميل، لا هامش الشهر فقط"),
          b("Open orders, late orders and stock in one view", "الطلبات المفتوحة والمتأخرة والمخزون في شاشة واحدة"),
          b("Prices built on today's cost when materials go up", "أسعار مبنية على تكلفة اليوم عندما ترتفع المواد"),
        ],
      },
      plant: {
        headline: b(
          "Know what to make today, with the materials already there.",
          "اعرف ماذا تنتج اليوم، والمواد جاهزة أمامك.",
        ),
        points: [
          b("Material shortages flagged before the order is released", "نقص المواد يظهر قبل إطلاق أمر الإنتاج"),
          b("Work orders with steps and quantities, scrap recorded on the floor", "أوامر عمل بخطواتها وكمياتها، والهالك يُسجَّل من أرض المصنع"),
          b("Quality checks tied to each batch", "فحوصات الجودة مرتبطة بكل دفعة"),
          b("Raw material and finished goods stock you can trust", "مخزون مواد خام ومنتج نهائي تثق به"),
        ],
      },
      fin: {
        headline: b(
          "Production cost in the books the day it happens, not after the stock count.",
          "تكلفة الإنتاج في الدفاتر يوم حدوثها، لا بعد الجرد.",
        ),
        points: [
          b("Inventory value that matches the warehouse", "قيمة مخزون تطابق المستودع"),
          b("Supplier bills matched to orders and receipts", "فواتير الموردين مطابقة لأوامر الشراء والاستلام"),
          b("Planned against actual cost for every production order", "التكلفة المخططة مقابل الفعلية لكل أمر إنتاج"),
          b("Fatoora e-invoices issued from the same system", "الفواتير الإلكترونية تصدر من النظام نفسه"),
        ],
      },
    },
    pains: {
      owner: {
        headline: b("A busy factory. So where did the profit go?", "المصنع مشغول، فأين ذهب الربح؟"),
        items: [
          {
            pain: b("You price from last year's cost sheet", "تسعّر من جدول تكلفة العام الماضي"),
            fix: b(
              "Materials went up, the price did not, and the margin quietly went with it.",
              "ارتفعت المواد ولم يتغير السعر، وذهب الهامش بصمت.",
            ),
          },
          {
            pain: b("Every product looks profitable on average", "كل المنتجات تبدو رابحة في المتوسط"),
            fix: b(
              "Without cost per product, the loss-makers hide inside the totals.",
              "بلا تكلفة لكل منتج، الخاسر يختبئ داخل الإجمالي.",
            ),
          },
          {
            pain: b("Late orders surface when the customer calls", "الطلب المتأخر تعرفه حين يتصل العميل"),
            fix: b(
              "Nobody saw the shortage that stopped the line.",
              "لم ينتبه أحد للنقص الذي أوقف الخط.",
            ),
          },
          {
            pain: b("Reports arrive after the decisions", "التقارير تصل بعد القرار"),
            fix: b(
              "By the time the numbers are compiled, the month is over.",
              "حين تكتمل الأرقام يكون الشهر قد انتهى.",
            ),
          },
        ],
      },
      plant: {
        headline: b(
          "The plan says one thing. The floor does another.",
          "الخطة تقول شيئًا، والمصنع يفعل شيئًا آخر.",
        ),
        items: [
          {
            pain: b("Materials run out halfway through a run", "المواد تنقص في منتصف التشغيل"),
            fix: b(
              "The stock on screen was not the stock on the shelf.",
              "المخزون على الشاشة غير المخزون على الرف.",
            ),
          },
          {
            pain: b("Work orders on paper and WhatsApp", "أوامر العمل على الورق وفي الواتساب"),
            fix: b(
              "A change reaches one shift and misses the next.",
              "التعديل يصل لوردية ويفوت التي بعدها.",
            ),
          },
          {
            pain: b("Scrap nobody records", "هالك لا يسجّله أحد"),
            fix: b(
              "So the cost looks fine until the stock count.",
              "فتبدو التكلفة سليمة حتى يوم الجرد.",
            ),
          },
          {
            pain: b("Quality issues traced from memory", "مشكلات الجودة تُتتبَّع بالذاكرة"),
            fix: b(
              "Which batch, which material, which supplier? Nobody is sure.",
              "أي دفعة؟ أي مادة؟ أي مورد؟ لا أحد متأكد.",
            ),
          },
        ],
      },
      fin: {
        headline: b("Month-end waits for the factory.", "إقفال الشهر ينتظر المصنع."),
        items: [
          {
            pain: b("Inventory value lives in a spreadsheet", "قيمة المخزون في ملف Excel"),
            fix: b("And it never matches the general ledger.", "ولا تطابق دفتر الأستاذ أبدًا."),
          },
          {
            pain: b("Supplier bills that do not match receipts", "فواتير موردين لا تطابق الاستلام"),
            fix: b("You pay first and reconcile later, by hand.", "تدفع أولًا وتطابق لاحقًا، يدويًا."),
          },
          {
            pain: b("Production cost estimated, never recorded", "تكلفة الإنتاج تقديرية لا فعلية"),
            fix: b(
              "The difference shows up as a surprise at year-end.",
              "والفرق يظهر مفاجأة في آخر السنة.",
            ),
          },
          {
            pain: b("E-invoicing in a separate tool", "الفوترة الإلكترونية في أداة منفصلة"),
            fix: b(
              "Two systems, two numbers, one more reconciliation.",
              "نظامان، ورقمان، ومطابقة إضافية.",
            ),
          },
        ],
      },
    },
    fit: {
      odoo: {
        when: b(
          "If you want manufacturing apps that grow with the plant",
          "إذا أردت تطبيقات تصنيع تكبر مع مصنعك",
        ),
        points: [
          b(
            "Manufacturing, quality, maintenance and inventory as connected apps",
            "التصنيع والجودة والصيانة والمخزون تطبيقات مترابطة",
          ),
          b("Add modules as you grow", "أضف الوحدات مع نمو عملك"),
          b("Custom features our developers build around your process", "مزايا خاصة يبنيها مطوّرونا حول إجراءاتك"),
        ],
      },
      falcon: {
        when: b(
          "If you want the factory system on your own server, in Arabic",
          "إذا أردت نظام المصنع على سيرفرك، وبالعربية",
        ),
        points: [
          b(
            "Production plans, manufacturing orders and material requirements, in the same system as the accounts",
            "خطط الإنتاج وأوامر التصنيع واحتياجات الخامات، في النظام نفسه مع الحسابات",
          ),
          b("Maintenance plans and requests for your machines", "خطط الصيانة وطلباتها لآلاتك"),
          b("On your internal network, or Falcon Cloud in the browser", "على شبكتك الداخلية، أو فالكون كلاود من المتصفح"),
        ],
      },
    },
    plan: {
      assess: b(
        "We map your production cycle in one session: where cost leaks, and who needs what.",
        "نرسم دورة الإنتاج في جلسة واحدة: أين تتسرّب التكلفة، ومن يحتاج ماذا.",
      ),
      setup: b(
        "We load your items, bills of materials, stock and balances, and reconcile them with you.",
        "ننقل أصنافك وقوائم المواد والمخزون والأرصدة، ونطابقها معك.",
      ),
      train: b(
        "Your team trains on its own products and orders, and we stay with you after go-live.",
        "فريقك يتدرّب على منتجاته وطلباته الحقيقية، ونبقى معك بعد التشغيل.",
      ),
    },
    quoteWho: b("a manufacturer", "مصنع"),
    faqHeading: b(
      "What factory owners, plant managers and finance teams ask",
      "ما يسأله أصحاب المصانع ومدراء الإنتاج وفرق المالية",
    ),
    faqs: [
      {
        question: b("Why are there no prices on the site?", "لماذا لا توجد أسعار على الموقع؟"),
        answer: b(
          "Because a workshop with one line doesn't need what a plant with several lines needs. After the session you get a written proposal with scope, price and timeline.",
          "لأن ورشة بخط إنتاج واحد لا تحتاج ما يحتاجه مصنع بعدة خطوط. بعد الجلسة تحصل على عرض مكتوب بالنطاق والسعر والجدول.",
        ),
      },
      {
        question: b("We make to order and to stock. One system?", "نصنّع حسب الطلب وللمخزون، هل يكفي نظام واحد؟"),
        answer: b(
          "In Odoo this is standard: a sales order can start production, and reordering rules replenish stock items at minimum levels. Falcon ERP has production plans and manufacturing orders, and how orders and stock levels start production we configure in the blueprint to match how you work.",
          "في أودو هذا متاح بشكل أساسي: أمر البيع يمكن أن يُطلق الإنتاج، وأصناف المخزون يُعاد طلبها عند الحد الأدنى. وفي فالكون ERP خطط إنتاج وأوامر تصنيع، أما كيف تُطلق الطلبات ومستويات المخزون الإنتاج فنضبطه في المخطط حسب طريقة عملك.",
        ),
      },
      FATOORA_FAQ,
      {
        question: b("Can you move our items and bills of materials?", "هل تنقلون أصنافنا وقوائم المواد؟"),
        answer: b(
          "Yes. Items, bills of materials, open orders, stock and balances are part of the migration plan.",
          "نعم. الأصناف وقوائم المواد والطلبات المفتوحة والمخزون والأرصدة جزء من خطة الترحيل.",
        ),
      },
    ],
    booking: {
      heading: b("One session shows you where your cost leaks.", "جلسة واحدة تكفي لترى أين تتسرّب تكلفتك."),
      body: b(
        "A consultant maps your production cycle with you, then sends a written recommendation: which system, what scope, how long.",
        "مستشار تطبيق يرسم دورة الإنتاج معك، ثم يرسل لك توصية مكتوبة: أي نظام، أي نطاق، وكم من الوقت.",
      ),
    },
  }),
);
