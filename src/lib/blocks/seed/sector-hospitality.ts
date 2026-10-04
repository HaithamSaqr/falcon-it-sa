/** Restaurants and hospitality sector page seed (EN + AR). */
import { b } from "../fields";
import { seedPage } from "./helpers";
import { sectorBlocks, FATOORA_FAQ } from "./common";

const roles = [
  { id: "owner", label: b("Owner", "المالك") },
  { id: "branch", label: b("Branch manager", "مدير الفرع") },
  { id: "kitchen", label: b("Kitchen manager", "مدير المطبخ") },
];

export const SECTOR_HOSPITALITY_SEED = seedPage(
  "sector:hospitality",
  sectorBlocks({
    slug: "hospitality",
    roles,
    promise: {
      owner: {
        title: b("Know your food cost per branch, every day.", "اعرف تكلفة الطعام لكل فرع، كل يوم."),
        subtitle: b(
          "Recipes, purchases and sales in one system, so you see which branch and which dish makes money.",
          "الوصفات والمشتريات والمبيعات في نظام واحد، فترى أي فرع وأي طبق يربحك.",
        ),
      },
      branch: {
        title: b("Close every shift without a calculator.", "أقفل كل وردية بلا آلة حاسبة."),
        subtitle: b(
          "POS, stock and cash reconciled at the branch, with the numbers already at head office.",
          "نقطة البيع والمخزون والنقدية مطابقة في الفرع، والأرقام تصل الإدارة مباشرة.",
        ),
      },
      kitchen: {
        title: b("Order what you need. Waste less of what you buy.", "اطلب ما تحتاجه، وقلّل الهدر مما تشتريه."),
        subtitle: b(
          "Recipes drive stock, orders reach the kitchen screen, and waste is recorded, not guessed.",
          "الوصفات تحرّك المخزون، والطلبات تصل لشاشة المطبخ، والهدر يُسجَّل لا يُقدَّر.",
        ),
      },
    },
    lifecycleHeading: b(
      "Supplier to plate. One number through every stage.",
      "من المورد إلى الطبق، رقم واحد يمر بكل المراحل.",
    ),
    stages: [
      {
        title: b("Menu & recipes", "القائمة والوصفات"),
        description: b(
          "Every dish costed from its recipe, so the menu price covers the plate.",
          "كل طبق محسوب من وصفته، فيغطي سعر القائمة تكلفة الطبق.",
        ),
        modules: b("Inventory, recipes", "المخزون، الوصفات"),
        roles: ["owner", "kitchen"],
      },
      {
        title: b("Purchasing & receiving", "المشتريات والاستلام"),
        description: b(
          "Supplier orders built from par levels, received and checked at the branch.",
          "طلبات الموردين تُبنى من حدود المخزون، وتُستلم وتُفحص في الفرع.",
        ),
        modules: b("Purchasing, inventory", "المشتريات، المخزون"),
        roles: ["branch", "kitchen"],
      },
      {
        title: b("Central kitchen & transfers", "المطبخ المركزي والتحويلات"),
        description: b(
          "Prep made centrally and transferred to branches at its cost.",
          "التحضيرات تُجهَّز مركزيًا وتُحوَّل للفروع بتكلفتها.",
        ),
        modules: b("Production, transfers", "الإنتاج، التحويلات"),
        roles: ["owner", "kitchen"],
      },
      {
        title: b("Service & POS", "الخدمة ونقاط البيع"),
        description: b(
          "Orders go from the POS to the kitchen screen, and every sale reduces stock.",
          "الطلبات تنتقل من نقطة البيع إلى شاشة المطبخ، وكل بيع ينقص المخزون.",
        ),
        modules: b("POS, kitchen screen", "نقاط البيع، شاشة المطبخ"),
        roles: ["branch", "kitchen"],
      },
      {
        title: b("Shift close & cash", "إقفال الوردية والنقدية"),
        description: b(
          "Cash, card and delivery-app sales counted against the POS at every shift close.",
          "مبيعات النقد والشبكة وتطبيقات التوصيل تُطابق مع نقطة البيع عند إقفال كل وردية.",
        ),
        modules: b("POS, accounting", "نقاط البيع، الحسابات"),
        roles: ["owner", "branch"],
      },
      {
        title: b("Food cost & reporting", "تكلفة الطعام والتقارير"),
        description: b(
          "Actual against theoretical food cost per branch, with Fatoora e-invoices from the same system.",
          "تكلفة الطعام الفعلية مقابل المفترضة لكل فرع، والفواتير الإلكترونية من النظام نفسه.",
        ),
        modules: b("Accounting, reports", "الحسابات، التقارير"),
        roles: ["owner", "branch", "kitchen"],
      },
    ],
    summary: {
      owner: {
        headline: b(
          "Every morning: sales, food cost and cash for every branch.",
          "كل صباح: المبيعات وتكلفة الطعام والنقدية لكل فرع.",
        ),
        points: [
          b("Theoretical against actual food cost per branch", "تكلفة الطعام المفترضة مقابل الفعلية لكل فرع"),
          b("Best and worst dishes by margin, not only by sales", "أفضل وأسوأ الأطباق حسب الهامش، لا حسب المبيعات فقط"),
          b("Cash differences flagged at shift close", "فروقات النقدية تظهر عند إقفال الوردية"),
          b("A new branch opened on the same setup", "فرع جديد يُفتح على الإعداد نفسه"),
        ],
      },
      branch: {
        headline: b(
          "Run the branch from one screen: sales, stock, staff and cash.",
          "أدِر الفرع من شاشة واحدة: المبيعات والمخزون والموظفون والنقدية.",
        ),
        points: [
          b(
            "Shift close with cash, card and delivery sales side by side",
            "إقفال الوردية بالنقد والشبكة ومبيعات التوصيل جنبًا إلى جنب",
          ),
          b("Stock requests to the central kitchen or suppliers", "طلبات المخزون من المطبخ المركزي أو الموردين"),
          b("Waste and staff meals recorded, not hidden", "الهدر ووجبات الموظفين مسجّلة، لا مخفية"),
          b("Daily sales against target", "المبيعات اليومية مقابل المستهدف"),
        ],
      },
      kitchen: {
        headline: b(
          "Know what to prep, what to order and what was wasted.",
          "اعرف ماذا تحضّر، وماذا تطلب، وماذا هُدر.",
        ),
        points: [
          b("Recipes with quantities that reduce stock as dishes sell", "وصفات بكمياتها تنقص المخزون مع كل طبق يُباع"),
          b("Orders on the kitchen screen, not on paper tickets", "الطلبات على شاشة المطبخ، لا على أوراق"),
          b("Par levels that build the supplier order for you", "حدود مخزون تجهّز طلب المورد عنك"),
          b("Waste recorded by item and reason", "الهدر مسجّل حسب الصنف والسبب"),
        ],
      },
    },
    pains: {
      owner: {
        headline: b("Full tables. Thin margins.", "طاولات ممتلئة، وهامش رفيع."),
        items: [
          {
            pain: b("Food cost known once a month, if at all", "تكلفة الطعام تُعرف مرة في الشهر، إن عُرفت"),
            fix: b(
              "By then the waste and the oversized portions are already paid for.",
              "وحينها يكون الهدر وزيادة الكميات قد دُفع ثمنهما.",
            ),
          },
          {
            pain: b("Every branch reports differently", "كل فرع يرفع تقاريره بطريقته"),
            fix: b(
              "Comparing branches means rebuilding the numbers yourself.",
              "ومقارنة الفروع تعني أن تعيد بناء الأرقام بنفسك.",
            ),
          },
          {
            pain: b("Menu prices set once and forgotten", "أسعار القائمة تُحدَّد مرة وتُنسى"),
            fix: b(
              "Supplier prices moved; your menu didn't.",
              "أسعار الموردين تغيّرت، وقائمتك لم تتغير.",
            ),
          },
          {
            pain: b("Cash differences explained later, or never", "فروقات النقدية تُفسَّر لاحقًا، أو لا تُفسَّر"),
            fix: b(
              "Small gaps every shift add up over a year.",
              "فجوات صغيرة كل وردية تتراكم على مدار السنة.",
            ),
          },
        ],
      },
      branch: {
        headline: b("The shift ends. The counting starts.", "تنتهي الوردية، ويبدأ العدّ."),
        items: [
          {
            pain: b("Closing the till takes longer than the rush", "إقفال الصندوق أطول من وقت الذروة"),
            fix: b(
              "Cash, cards and delivery apps, each counted separately.",
              "النقد والشبكة وتطبيقات التوصيل، كل واحد يُعدّ وحده.",
            ),
          },
          {
            pain: b("Stock runs out mid-service", "المخزون ينفد في منتصف الخدمة"),
            fix: b(
              "Nobody saw it coming, so a dish comes off the menu.",
              "لم يتوقعه أحد، فيُشطب طبق من القائمة.",
            ),
          },
          {
            pain: b("Requests to the central kitchen by WhatsApp", "الطلبات من المطبخ المركزي بالواتساب"),
            fix: b(
              "What was sent and what arrived never quite match.",
              "ما أُرسل وما وصل لا يتطابقان تمامًا.",
            ),
          },
          {
            pain: b(
              "Head office asks for numbers you have to type up",
              "الإدارة تطلب أرقامًا عليك أن تكتبها بنفسك",
            ),
            fix: b("Again, at the end of a long day.", "مرة أخرى، في نهاية يوم طويل."),
          },
        ],
      },
      kitchen: {
        headline: b("Waste you can see. Cost you can't.", "هدر تراه، وتكلفة لا تراها."),
        items: [
          {
            pain: b("Recipes in the chef's head", "الوصفات في رأس الشيف"),
            fix: b("Portions drift, and so does the cost.", "فتتغير الكميات، وتتغير التكلفة معها."),
          },
          {
            pain: b("Paper tickets on a busy line", "أوراق الطلبات في وقت الزحمة"),
            fix: b("Orders get lost, remade or delayed.", "طلبات تضيع أو تُعاد أو تتأخر."),
          },
          {
            pain: b("Ordering by eye", "الطلب من الموردين بالنظر"),
            fix: b("Too much spoils, too little runs out.", "الكثير يتلف، والقليل ينفد."),
          },
          {
            pain: b("Waste thrown away, not written down", "الهدر يُرمى ولا يُسجَّل"),
            fix: b("So nobody knows what it really costs.", "فلا أحد يعرف تكلفته الحقيقية."),
          },
        ],
      },
    },
    fit: {
      odoo: {
        when: b(
          "If you run several concepts, or sell online as well as in branches",
          "إذا كان لديك أكثر من علامة، أو تبيع أونلاين إلى جانب الفروع",
        ),
        points: [
          b("POS, inventory and purchasing as connected apps", "نقاط البيع والمخزون والمشتريات تطبيقات مترابطة"),
          b("Add modules as you grow", "أضف الوحدات مع نمو عملك"),
          b("Custom features our developers build around your process", "مزايا خاصة يبنيها مطوّرونا حول إجراءاتك"),
        ],
      },
      falcon: {
        when: b(
          "If you run hotels, or want POS and accounts on your own server, in Arabic",
          "إذا كنت تدير فنادق، أو تريد نقاط البيع والحسابات على سيرفرك وبالعربية",
        ),
        points: [
          b(
            "POS for cash, card and credit sales, with cashier shifts closed against the cash box",
            "نقاط بيع بالنقد والشبكة والآجل، مع إقفال ورديات الكاشير على الصندوق",
          ),
          b(
            "Hotel rooms, reservations and housekeeping in the same system as the accounts",
            "غرف الفندق والحجوزات والإشراف الداخلي في النظام نفسه مع الحسابات",
          ),
          b("On your internal network, or Falcon Cloud in the browser", "على شبكتك الداخلية، أو فالكون كلاود من المتصفح"),
        ],
      },
    },
    plan: {
      assess: b(
        "We map your branch and kitchen cycle in one session: where food cost and cash leak.",
        "نرسم دورة الفرع والمطبخ في جلسة واحدة: أين تتسرّب تكلفة الطعام والنقدية.",
      ),
      setup: b(
        "We load your menu, recipes, items, suppliers and branches, and test them with you.",
        "ننقل قائمتك ووصفاتك وأصنافك ومورديك وفروعك، ونختبرها معك.",
      ),
      train: b(
        "Cashiers, branch managers and the kitchen train on your own menu, and we stay with you after go-live.",
        "الكاشير ومدراء الفروع والمطبخ يتدرّبون على قائمتك الحقيقية، ونبقى معك بعد التشغيل.",
      ),
    },
    quoteWho: b("a restaurant group", "مجموعة مطاعم"),
    faqHeading: b("What restaurant owners and managers ask", "ما يسأله أصحاب المطاعم ومدراؤها"),
    faqs: [
      {
        question: b("Why are there no prices on the site?", "لماذا لا توجد أسعار على الموقع؟"),
        answer: b(
          "Because a single café doesn't need what a group with a central kitchen needs. After the session you get a written proposal with scope, price and timeline.",
          "لأن مقهى واحدًا لا يحتاج ما تحتاجه مجموعة بمطبخ مركزي. بعد الجلسة تحصل على عرض مكتوب بالنطاق والسعر والجدول.",
        ),
      },
      {
        question: b("Do sales reduce stock by recipe?", "هل تنقص المبيعات المخزون حسب الوصفة؟"),
        answer: b(
          "Linking each dish to its recipe, so that sales reduce the ingredients, is something we configure in the blueprint to match how you work, in the system you choose, before we build.",
          "ربط كل طبق بوصفته لتنقص المبيعات مكوّناته أمر نضبطه في المخطط حسب طريقة عملك، في النظام الذي تختاره، قبل أن نبدأ البناء.",
        ),
      },
      FATOORA_FAQ,
      {
        question: b("Can we add branches later?", "هل يمكن إضافة فروع لاحقًا؟"),
        answer: b(
          "Yes. A new branch joins the same system with its own warehouse and reports, and we set it up the way your other branches work.",
          "نعم. ينضم الفرع الجديد إلى النظام نفسه بمستودعه وتقاريره، ونجهّزه على طريقة عمل فروعك الأخرى.",
        ),
      },
    ],
    booking: {
      heading: b("One session shows you where your food cost leaks.", "جلسة واحدة تكفي لترى أين تتسرّب تكلفة الطعام."),
      body: b(
        "A consultant maps your branches and kitchen with you, then sends a written recommendation: which system, what scope, how long.",
        "مستشار تطبيق يرسم معك دورة الفروع والمطبخ، ثم يرسل لك توصية مكتوبة: أي نظام، أي نطاق، وكم من الوقت.",
      ),
    },
  }),
);
