/** Retail and e-commerce sector page seed (EN + AR). */
import { b } from "../fields";
import { seedPage } from "./helpers";
import { sectorBlocks, FATOORA_FAQ } from "./common";

const roles = [
  { id: "owner", label: b("Owner", "المالك") },
  { id: "store", label: b("Store manager", "مدير الفرع") },
  { id: "ecom", label: b("E-commerce manager", "مدير المتجر الإلكتروني") },
];

export const SECTOR_RETAIL_SEED = seedPage(
  "sector:retail",
  sectorBlocks({
    slug: "retail",
    roles,
    promise: {
      owner: {
        title: b("Know which stores, channels and products make the money.", "اعرف أي الفروع والقنوات والأصناف تربحك."),
        subtitle: b(
          "Stores, POS and online on one stock and one price list, with margin by channel every morning.",
          "الفروع ونقاط البيع والمتجر الإلكتروني على مخزون واحد وقائمة أسعار واحدة، والهامش لكل قناة كل صباح.",
        ),
      },
      store: {
        title: b("The stock on screen is the stock on the shelf.", "المخزون على الشاشة هو المخزون على الرف."),
        subtitle: b(
          "Receive, transfer and count with barcodes, and close the till against the POS.",
          "استلام وتحويل وجرد بالباركود، وإقفال الصندوق مقابل نقطة البيع.",
        ),
      },
      ecom: {
        title: b("Never sell online what a store already sold.", "لا تبع أونلاين ما باعه الفرع قبلك."),
        subtitle: b(
          "Online orders take real stock, prices match the stores, and every order is invoiced the same way.",
          "الطلب الإلكتروني يأخذ من مخزون حقيقي، والأسعار تطابق الفروع، وكل طلب يُفوتر بالطريقة نفسها.",
        ),
      },
    },
    lifecycleHeading: b(
      "Supplier to customer, in store and online. One number through every stage.",
      "من المورد إلى العميل، في الفرع وأونلاين، رقم واحد يمر بكل المراحل.",
    ),
    stages: [
      {
        title: b("Buying & assortment", "الشراء والتشكيلة"),
        description: b(
          "What to buy, and for which store, based on what actually sells.",
          "ماذا تشتري ولأي فرع، بناءً على ما يُباع فعلًا.",
        ),
        modules: b("Purchasing, inventory", "المشتريات، المخزون"),
        roles: ["owner"],
      },
      {
        title: b("Pricing & promotions", "التسعير والعروض"),
        description: b(
          "One price list for stores and online, with promotions applied the same way.",
          "قائمة أسعار واحدة للفروع والمتجر الإلكتروني، والعروض تُطبَّق بالطريقة نفسها.",
        ),
        modules: b("Price lists, POS", "قوائم الأسعار، نقاط البيع"),
        roles: ["owner", "ecom"],
      },
      {
        title: b("Stock & transfers", "المخزون والتحويلات"),
        description: b(
          "Stock by store and warehouse, with transfers that arrive where they should.",
          "المخزون لكل فرع ومستودع، وتحويلات تصل حيث يجب.",
        ),
        modules: b("Inventory, barcode", "المخزون، الباركود"),
        roles: ["store", "ecom"],
      },
      {
        title: b("In-store sales", "البيع في الفرع"),
        description: b(
          "POS on the same stock and prices, with returns and exchanges handled at the counter.",
          "نقطة بيع على المخزون والأسعار نفسها، والمرتجعات والاستبدال تتم عند الكاشير.",
        ),
        modules: b("POS", "نقاط البيع"),
        roles: ["store"],
      },
      {
        title: b("Online orders", "الطلبات الإلكترونية"),
        description: b(
          "Online orders take real stock and ship from the store or warehouse that holds it.",
          "الطلب الإلكتروني يأخذ من مخزون حقيقي، ويُشحن من الفرع أو المستودع الذي يوجد فيه.",
        ),
        modules: b("eCommerce, delivery", "المتجر الإلكتروني، التسليم"),
        roles: ["store", "ecom"],
      },
      {
        title: b("Close & reporting", "الإقفال والتقارير"),
        description: b(
          "Sales, margin and Fatoora e-invoices per channel, every morning.",
          "المبيعات والهامش والفواتير الإلكترونية لكل قناة، كل صباح.",
        ),
        modules: b("Accounting, reports", "الحسابات، التقارير"),
        roles: ["owner", "store", "ecom"],
      },
    ],
    summary: {
      owner: {
        headline: b(
          "Every morning: sales, margin and stock by store and channel.",
          "كل صباح: المبيعات والهامش والمخزون لكل فرع وقناة.",
        ),
        points: [
          b("Margin by product, store and channel", "الهامش لكل صنف وفرع وقناة"),
          b("Best sellers and slow movers before you reorder", "الأكثر مبيعًا والراكد قبل أن تعيد الطلب"),
          b("One price list and one set of promotions everywhere", "قائمة أسعار واحدة وعروض واحدة في كل مكان"),
          b("Stock value across stores and warehouse in one number", "قيمة المخزون في الفروع والمستودع برقم واحد"),
        ],
      },
      store: {
        headline: b(
          "Run the store with stock you trust and a till that balances.",
          "أدِر الفرع بمخزون تثق به وصندوق مطابق.",
        ),
        points: [
          b("Receiving checked against the order", "الاستلام يُطابق أمر الشراء"),
          b("Transfers between stores tracked at both ends", "التحويل بين الفروع متابَع من الطرفين"),
          b("Shift close against the POS, not a calculator", "إقفال الوردية مقابل نقطة البيع، لا الآلة الحاسبة"),
          b("Cycle counts by section, without closing the store", "جرد دوري حسب القسم، دون إغلاق الفرع"),
        ],
      },
      ecom: {
        headline: b(
          "Sell online from the same stock, prices and invoices as the stores.",
          "بِع أونلاين من المخزون والأسعار والفواتير نفسها التي في الفروع.",
        ),
        points: [
          b("Available stock that reflects in-store sales", "مخزون متاح يعكس مبيعات الفروع"),
          b("Prices and promotions managed once", "الأسعار والعروض تُدار مرة واحدة"),
          b("Orders picked and shipped from the right location", "الطلبات تُجهَّز وتُشحن من الموقع الصحيح"),
          b("Returns that go back into stock properly", "مرتجعات تعود للمخزون بشكل صحيح"),
        ],
      },
    },
    pains: {
      owner: {
        headline: b("Busy stores. Unclear margins.", "فروع مزدحمة، وهامش غير واضح."),
        items: [
          {
            pain: b("Each store has its own prices", "لكل فرع أسعاره"),
            fix: b(
              "A promotion runs in one store and not the other.",
              "العرض يعمل في فرع ولا يعمل في آخر.",
            ),
          },
          {
            pain: b("Online and stores on different systems", "المتجر الإلكتروني والفروع على نظامين"),
            fix: b(
              "Two stock numbers, two sets of reports, one confused picture.",
              "رقمان للمخزون، وتقريران، وصورة مشوشة.",
            ),
          },
          {
            pain: b("Reordering by habit", "إعادة الطلب بالعادة"),
            fix: b(
              "Best sellers run out while slow movers fill the stockroom.",
              "الأكثر مبيعًا ينفد، والراكد يملأ المستودع.",
            ),
          },
          {
            pain: b("Stock losses found at the annual count", "خسائر المخزون تُكتشف في الجرد السنوي"),
            fix: b("Too late to know where they happened.", "وقد فات الأوان لمعرفة أين حدثت."),
          },
        ],
      },
      store: {
        headline: b("The customer asks. The system doesn't know.", "العميل يسأل، والنظام لا يعرف."),
        items: [
          {
            pain: b("Checking the stockroom for every request", "تبحث في المستودع مع كل طلب"),
            fix: b("Because the screen can't be trusted.", "لأن الشاشة لا يُوثق بها."),
          },
          {
            pain: b("Transfers that never show up", "تحويلات لا تصل"),
            fix: b("Sent from one store, missing in the other.", "خرجت من فرع، ومفقودة في الآخر."),
          },
          {
            pain: b("The till never quite balances", "الصندوق لا يتطابق أبدًا"),
            fix: b(
              "Small differences every shift, explained by nobody.",
              "فروقات صغيرة كل وردية، لا يفسّرها أحد.",
            ),
          },
          {
            pain: b("Counts that close the store", "جرد يغلق الفرع"),
            fix: b("And still end in adjustments.", "وينتهي رغم ذلك بتسويات."),
          },
        ],
      },
      ecom: {
        headline: b("Orders online. Stock somewhere else.", "الطلب أونلاين، والمخزون في مكان آخر."),
        items: [
          {
            pain: b("Selling items the stores already sold", "تبيع أصنافًا باعتها الفروع"),
            fix: b(
              "Then cancelling, refunding and apologising.",
              "ثم تلغي وتعيد المبلغ وتعتذر.",
            ),
          },
          {
            pain: b("Prices updated twice, by hand", "الأسعار تُحدَّث مرتين يدويًا"),
            fix: b("And they still differ by the evening.", "وتختلف رغم ذلك بحلول المساء."),
          },
          {
            pain: b("Invoices issued outside the main system", "الفواتير تصدر خارج النظام الأساسي"),
            fix: b(
              "So finance rebuilds online sales every month.",
              "فتعيد المالية بناء المبيعات الإلكترونية كل شهر.",
            ),
          },
          {
            pain: b("Returns that vanish from stock", "مرتجعات تختفي من المخزون"),
            fix: b(
              "Received at a store, never put back on sale.",
              "استُلمت في فرع، ولم تعد للبيع.",
            ),
          },
        ],
      },
    },
    fit: {
      odoo: {
        when: b(
          "If online sales are a big part of your business",
          "إذا كانت المبيعات الإلكترونية جزءًا كبيرًا من عملك",
        ),
        points: [
          b("eCommerce, POS and inventory as connected apps", "المتجر الإلكتروني ونقاط البيع والمخزون تطبيقات مترابطة"),
          b("Add modules as you grow", "أضف الوحدات مع نمو عملك"),
          b("Custom features our developers build around your process", "مزايا خاصة يبنيها مطوّرونا حول إجراءاتك"),
        ],
      },
      falcon: {
        when: b(
          "If your stores are the core and you want the system on your own server",
          "إذا كانت الفروع هي الأساس وتريد النظام على سيرفرك",
        ),
        points: [
          b("POS, inventory and accounts in one Arabic-first system", "نقاط البيع والمخزون والحسابات في نظام واحد عربي أولًا"),
          b(
            "Stock in every store, with barcodes and transfers between warehouses",
            "مخزون كل فرع مع الباركود والتحويل بين المستودعات",
          ),
          b("On your internal network, or Falcon Cloud in the browser", "على شبكتك الداخلية، أو فالكون كلاود من المتصفح"),
        ],
      },
    },
    plan: {
      assess: b(
        "We map your stores and channels in one session: where stock and margin leak.",
        "نرسم فروعك وقنواتك في جلسة واحدة: أين يتسرّب المخزون والهامش.",
      ),
      setup: b(
        "We load your items, barcodes, price lists, stores and stock, and reconcile them with you.",
        "ننقل أصنافك والباركود وقوائم الأسعار والفروع والمخزون، ونطابقها معك.",
      ),
      train: b(
        "Cashiers, store managers and your online team train on your own items, and we stay with you after go-live.",
        "الكاشير ومدراء الفروع وفريق المتجر الإلكتروني يتدرّبون على أصنافك الحقيقية، ونبقى معك بعد التشغيل.",
      ),
    },
    quoteWho: b("a retailer", "شركة تجزئة"),
    faqHeading: b("What retailers ask", "ما يسأله تجّار التجزئة"),
    faqs: [
      {
        question: b("Why are there no prices on the site?", "لماذا لا توجد أسعار على الموقع؟"),
        answer: b(
          "Because one shop doesn't need what a chain with an online store needs. After the session you get a written proposal with scope, price and timeline.",
          "لأن محلًا واحدًا لا يحتاج ما تحتاجه سلسلة فروع بمتجر إلكتروني. بعد الجلسة تحصل على عرض مكتوب بالنطاق والسعر والجدول.",
        ),
      },
      {
        question: b("Can our online store use the same stock?", "هل يمكن لمتجرنا الإلكتروني أن يستخدم المخزون نفسه؟"),
        answer: b(
          "That is the aim of the setup. How your online store and your branches share one stock and one price list, we configure in the blueprint to match how you work.",
          "هذا هدف الإعداد. أما طريقة مشاركة المتجر الإلكتروني والفروع لمخزون واحد وقائمة أسعار واحدة، فنضبطها في المخطط حسب طريقة عملك.",
        ),
      },
      FATOORA_FAQ,
      {
        question: b("Can you move our items and barcodes?", "هل تنقلون أصنافنا والباركود؟"),
        answer: b(
          "Yes. Items, barcodes, price lists, customers and stock per store are part of the migration plan.",
          "نعم. الأصناف والباركود وقوائم الأسعار والعملاء والمخزون لكل فرع جزء من خطة الترحيل.",
        ),
      },
    ],
    booking: {
      heading: b(
        "One session shows you where your stock and margin leak.",
        "جلسة واحدة تكفي لترى أين يتسرّب مخزونك وهامشك.",
      ),
      body: b(
        "A consultant maps your stores and channels with you, then sends a written recommendation: which system, what scope, how long.",
        "مستشار تطبيق يرسم معك فروعك وقنواتك، ثم يرسل لك توصية مكتوبة: أي نظام، أي نطاق، وكم من الوقت.",
      ),
    },
  }),
);
