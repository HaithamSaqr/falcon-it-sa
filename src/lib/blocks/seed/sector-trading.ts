/** Trading and distribution sector page seed (EN + AR). */
import { b } from "../fields";
import { seedPage } from "./helpers";
import { sectorBlocks, FATOORA_FAQ } from "./common";

const roles = [
  { id: "owner", label: b("Owner", "المالك") },
  { id: "sales", label: b("Sales manager", "مدير المبيعات") },
  { id: "wh", label: b("Warehouse manager", "مدير المستودع") },
];

export const SECTOR_TRADING_SEED = seedPage(
  "sector:trading",
  sectorBlocks({
    slug: "trading",
    roles,
    promise: {
      owner: {
        title: b("Know which customers and items actually make you money.", "اعرف أي العملاء وأي الأصناف تربحك فعلًا."),
        subtitle: b(
          "Margin by item, customer and rep, with stock and receivables in the same system.",
          "الهامش لكل صنف وعميل ومندوب، والمخزون والذمم في النظام نفسه.",
        ),
      },
      sales: {
        title: b("Quote from today's stock, never from yesterday's list.", "قدّم عرضك من مخزون اليوم، لا من قائمة الأمس."),
        subtitle: b(
          "The right price list for each customer, credit checked before the order, and every rep's pipeline in one place.",
          "قائمة السعر الصحيحة لكل عميل، والائتمان يُفحص قبل الطلب، ومسار كل مندوب في مكان واحد.",
        ),
      },
      wh: {
        title: b("One stock number every warehouse trusts.", "رقم مخزون واحد تثق به كل المستودعات."),
        subtitle: b(
          "Receive, store, pick and transfer with barcodes, and count against the system, not a printout.",
          "استلام وتخزين وتجهيز وتحويل بالباركود، وجرد مقابل النظام لا مقابل ورقة مطبوعة.",
        ),
      },
    },
    lifecycleHeading: b(
      "Supplier to customer. One number through every stage.",
      "من المورد إلى العميل، رقم واحد يمر بكل المراحل.",
    ),
    stages: [
      {
        title: b("Purchasing & receiving", "الشراء والاستلام"),
        description: b(
          "Supplier orders and goods received, matched to the bill before you pay it.",
          "أوامر الموردين والبضاعة المستلمة، مطابقة للفاتورة قبل أن تدفعها.",
        ),
        modules: b("Purchasing, inventory", "المشتريات، المخزون"),
        roles: ["owner", "wh"],
      },
      {
        title: b("Warehousing", "التخزين"),
        description: b(
          "Stock by warehouse, location and batch, counted against the system.",
          "المخزون حسب المستودع والموقع والدفعة، يُجرد مقابل النظام.",
        ),
        modules: b("Inventory, barcode", "المخزون، الباركود"),
        roles: ["wh"],
      },
      {
        title: b("Pricing & credit", "التسعير والائتمان"),
        description: b(
          "Price lists per customer group, and credit limits checked before the order.",
          "قوائم أسعار لكل فئة عملاء، وحد ائتمان يُفحص قبل الطلب.",
        ),
        modules: b("Sales, price lists", "المبيعات، قوائم الأسعار"),
        roles: ["owner", "sales"],
      },
      {
        title: b("Quotes & orders", "العروض والطلبات"),
        description: b(
          "Reps quote from live stock and prices, on the road or in the office.",
          "المندوب يقدّم عرضه من مخزون وأسعار محدّثة، في الميدان أو في المكتب.",
        ),
        modules: b("CRM, sales", "CRM، المبيعات"),
        roles: ["sales"],
      },
      {
        title: b("Picking & delivery", "التجهيز والتوصيل"),
        description: b(
          "Orders picked, packed and delivered, with stock moving as they go.",
          "الطلبات تُجهَّز وتُغلَّف وتُسلَّم، والمخزون يتحرك معها.",
        ),
        modules: b("Inventory, delivery", "المخزون، التسليم"),
        roles: ["sales", "wh"],
      },
      {
        title: b("Invoicing & collection", "الفوترة والتحصيل"),
        description: b(
          "Fatoora e-invoices, customer statements and overdue balances per rep.",
          "فواتير إلكترونية متوافقة مع منصة فاتورة، وكشوف حساب العملاء، والمتأخرات لكل مندوب.",
        ),
        modules: b("Accounting, e-invoicing", "الحسابات، الفوترة الإلكترونية"),
        roles: ["owner", "sales"],
      },
    ],
    summary: {
      owner: {
        headline: b(
          "Every morning: sales, margin, stock and the money customers owe you.",
          "كل صباح: المبيعات والهامش والمخزون وما لك عند العملاء.",
        ),
        points: [
          b("Margin by item, customer and rep", "الهامش لكل صنف وعميل ومندوب"),
          b("Slow-moving stock flagged before it ties up cash", "المخزون الراكد يظهر قبل أن يحبس السيولة"),
          b("Receivables by age and by rep", "الذمم المدينة حسب العمر وحسب المندوب"),
          b("Stock value across every warehouse in one number", "قيمة المخزون في كل المستودعات برقم واحد"),
        ],
      },
      sales: {
        headline: b(
          "Every rep sells from the same stock, the same prices and the same rules.",
          "كل مندوب يبيع من المخزون نفسه، والأسعار نفسها، والقواعد نفسها.",
        ),
        points: [
          b("Price lists and discounts per customer group", "قوائم أسعار وخصومات لكل فئة عملاء"),
          b("Credit limits checked before the order, not after delivery", "حد الائتمان يُفحص قبل الطلب، لا بعد التسليم"),
          b("Quotes, orders and follow-ups in one pipeline", "العروض والطلبات والمتابعات في مسار واحد"),
          b("Target and actual per rep, without a side sheet", "المستهدف والمحقق لكل مندوب، بلا ملف جانبي"),
        ],
      },
      wh: {
        headline: b("Know what is on every shelf, and where it is going.", "اعرف ماذا على كل رف، وإلى أين يذهب."),
        points: [
          b("Receiving checked against the purchase order", "الاستلام يُطابق أمر الشراء"),
          b("Barcode picking, so fewer wrong shipments", "تجهيز بالباركود، فتقل الشحنات الخاطئة"),
          b("Transfers between warehouses tracked at both ends", "التحويل بين المستودعات متابَع من الطرفين"),
          b("Batch and serial tracking where you need it", "تتبّع الدفعات والأرقام التسلسلية حيث تحتاجها"),
        ],
      },
    },
    pains: {
      owner: {
        headline: b("Sales are up. Cash is not.", "المبيعات ترتفع، والسيولة لا."),
        items: [
          {
            pain: b("Margin known per invoice, not per customer", "تعرف الهامش لكل فاتورة، لا لكل عميل"),
            fix: b(
              "Big accounts with deep discounts may be costing you money.",
              "قد تكون الحسابات الكبيرة بخصوماتها العالية تكلّفك مالًا.",
            ),
          },
          {
            pain: b("Stock that sits for months", "مخزون راكد لشهور"),
            fix: b(
              "Nobody flags it until the shelves are full and cash is short.",
              "لا ينتبه له أحد حتى تمتلئ الرفوف وتشحّ السيولة.",
            ),
          },
          {
            pain: b(
              "Receivables everyone thinks someone else is chasing",
              "ذمم يظن كل واحد أن غيره يتابعها",
            ),
            fix: b("Overdue balances grow quietly.", "والمتأخرات تكبر بصمت."),
          },
          {
            pain: b("Each branch keeps its own numbers", "كل فرع له أرقامه الخاصة"),
            fix: b(
              "Totals take days and still don't agree.",
              "الإجمالي يأخذ أيامًا، ولا يتطابق في النهاية.",
            ),
          },
        ],
      },
      sales: {
        headline: b(
          "Quoting blind, and promising stock you don't have.",
          "تعرض بلا رؤية، وتَعِد بمخزون غير موجود.",
        ),
        items: [
          {
            pain: b("Prices from an old Excel list", "أسعار من قائمة Excel قديمة"),
            fix: b(
              "Each rep quotes the same customer a different price.",
              "كل مندوب يعطي العميل نفسه سعرًا مختلفًا.",
            ),
          },
          {
            pain: b("Stock checked by phone", "المخزون يُسأل عنه بالهاتف"),
            fix: b(
              "The order is confirmed, then the warehouse says it's gone.",
              "يُؤكَّد الطلب، ثم يقول المستودع إنه نفد.",
            ),
          },
          {
            pain: b("Credit limits ignored until it's too late", "حد الائتمان يُتجاهل حتى فوات الأوان"),
            fix: b(
              "You ship to customers who already owe too much.",
              "تشحن لعميل عليه أكثر مما يجب.",
            ),
          },
          {
            pain: b("Follow-ups in personal notebooks", "المتابعات في دفاتر شخصية"),
            fix: b(
              "When a rep leaves, the customer history leaves too.",
              "حين يغادر المندوب، يغادر معه تاريخ العملاء.",
            ),
          },
        ],
      },
      wh: {
        headline: b(
          "The system says one number. The shelf says another.",
          "النظام يقول رقمًا، والرف يقول رقمًا آخر.",
        ),
        items: [
          {
            pain: b("Receiving on paper, entered days later", "الاستلام على الورق ويُدخَل بعد أيام"),
            fix: b(
              "Stock is wrong from the moment it arrives.",
              "فيبدأ الخطأ من لحظة وصول البضاعة.",
            ),
          },
          {
            pain: b("Wrong item, wrong customer", "صنف خاطئ لعميل خاطئ"),
            fix: b(
              "Picking from memory means returns and apologies.",
              "التجهيز من الذاكرة يعني مرتجعات واعتذارات.",
            ),
          },
          {
            pain: b(
              "Transfers that leave one warehouse and never arrive",
              "تحويلات تخرج من مستودع ولا تصل للآخر",
            ),
            fix: b("On paper, at least.", "على الورق على الأقل."),
          },
          {
            pain: b("The annual count that shuts the warehouse", "الجرد السنوي الذي يوقف المستودع"),
            fix: b(
              "And still ends with adjustments nobody can explain.",
              "وينتهي بتسويات لا يفسّرها أحد.",
            ),
          },
        ],
      },
    },
    fit: {
      odoo: {
        when: b(
          "If your reps sell on the road or you also sell online",
          "إذا كان مندوبوك في الميدان أو تبيع أونلاين أيضًا",
        ),
        points: [
          b("CRM, sales and inventory as connected apps", "CRM والمبيعات والمخزون تطبيقات مترابطة"),
          b("An online store on the same stock, when you need it", "متجر إلكتروني على المخزون نفسه عند الحاجة"),
          b("Custom features our developers build around your process", "مزايا خاصة يبنيها مطوّرونا حول إجراءاتك"),
        ],
      },
      falcon: {
        when: b(
          "If you want distribution on your own server, quick for your team",
          "إذا أردت نظام التوزيع على سيرفرك، وسهلًا على فريقك",
        ),
        points: [
          b(
            "Sales, purchasing, inventory and accounts in one Arabic-first system",
            "المبيعات والمشتريات والمخزون والحسابات في نظام واحد عربي أولًا",
          ),
          b(
            "Stock across warehouses with barcodes, serial numbers and expiry dates",
            "مخزون في عدة مستودعات مع الباركود والأرقام التسلسلية وتواريخ الصلاحية",
          ),
          b("On your internal network, or Falcon Cloud in the browser", "على شبكتك الداخلية، أو فالكون كلاود من المتصفح"),
        ],
      },
    },
    plan: {
      assess: b(
        "We map your trading cycle in one session: where margin and stock leak, and who needs what.",
        "نرسم دورة التجارة في جلسة واحدة: أين يتسرّب الهامش والمخزون، ومن يحتاج ماذا.",
      ),
      setup: b(
        "We load your items, price lists, customers, stock and balances, and reconcile them with you.",
        "ننقل أصنافك وقوائم الأسعار والعملاء والمخزون والأرصدة، ونطابقها معك.",
      ),
      train: b(
        "Your reps and storekeepers train on your own items and customers, and we stay with you after go-live.",
        "مندوبوك وأمناء مستودعاتك يتدرّبون على أصنافك وعملائك الحقيقيين، ونبقى معك بعد التشغيل.",
      ),
    },
    quoteWho: b("a distributor", "موزّع"),
    faqHeading: b("What traders and distributors ask", "ما يسأله التجّار والموزّعون"),
    faqs: [
      {
        question: b("Why are there no prices on the site?", "لماذا لا توجد أسعار على الموقع؟"),
        answer: b(
          "Because a trader with one warehouse doesn't need what a distributor with several branches and a field sales team needs. After the session you get a written proposal with scope, price and timeline.",
          "لأن تاجرًا بمستودع واحد لا يحتاج ما يحتاجه موزّع بعدة فروع وفريق مبيعات ميداني. بعد الجلسة تحصل على عرض مكتوب بالنطاق والسعر والجدول.",
        ),
      },
      {
        question: b("Can each customer have its own price list?", "هل يمكن أن يكون لكل عميل قائمة أسعار خاصة؟"),
        answer: b(
          "In Odoo, price lists per customer or customer group are standard. Falcon ERP works with price lists too, and we configure your pricing rules in the blueprint to match how you work. Either way, reps quote only from the agreed lists.",
          "في أودو، قوائم الأسعار لكل عميل أو فئة عملاء متاحة بشكل أساسي. وفالكون ERP يعمل بقوائم الأسعار أيضًا، ونضبط قواعد التسعير لديك في المخطط حسب طريقة عملك. وفي الحالتين يعرض المندوب من القوائم المعتمدة فقط.",
        ),
      },
      FATOORA_FAQ,
      {
        question: b("Can you move our items and customer balances?", "هل تنقلون أصنافنا وأرصدة العملاء؟"),
        answer: b(
          "Yes. Items, price lists, customers, open balances and stock per warehouse are part of the migration plan.",
          "نعم. الأصناف وقوائم الأسعار والعملاء والأرصدة المفتوحة والمخزون لكل مستودع جزء من خطة الترحيل.",
        ),
      },
    ],
    booking: {
      heading: b("One session shows you where your margin leaks.", "جلسة واحدة تكفي لترى أين يتسرّب هامشك."),
      body: b(
        "A consultant maps your buying, stock and sales cycle with you, then sends a written recommendation: which system, what scope, how long.",
        "مستشار تطبيق يرسم معك دورة الشراء والمخزون والبيع، ثم يرسل لك توصية مكتوبة: أي نظام، أي نطاق، وكم من الوقت.",
      ),
    },
  }),
);
