/** Logistics and fleet sector page seed (EN + AR). */
import { b } from "../fields";
import { seedPage } from "./helpers";
import { sectorBlocks, FATOORA_FAQ } from "./common";

const roles = [
  { id: "owner", label: b("Owner", "المالك") },
  { id: "fleet", label: b("Fleet manager", "مدير الأسطول") },
  { id: "fin", label: b("Finance", "المدير المالي") },
];

export const SECTOR_LOGISTICS_SEED = seedPage(
  "sector:logistics",
  sectorBlocks({
    slug: "logistics",
    roles,
    promise: {
      owner: {
        title: b("Know which contracts and trucks actually make money.", "اعرف أي العقود وأي الشاحنات تربحك فعلًا."),
        subtitle: b(
          "Trips, fuel and maintenance costed per contract and per vehicle, every morning.",
          "الرحلات والوقود والصيانة بتكلفتها على كل عقد وكل مركبة، كل صباح.",
        ),
      },
      fleet: {
        title: b("Keep every vehicle moving, and know what it costs.", "أبقِ كل مركبة تعمل، واعرف كم تكلّف."),
        subtitle: b(
          "Maintenance before breakdowns, fuel per trip, and every driver and vehicle on one schedule.",
          "الصيانة قبل الأعطال، والوقود لكل رحلة، وكل سائق ومركبة على جدول واحد.",
        ),
      },
      fin: {
        title: b("Bill every trip, and see the cost behind it.", "فوتر كل رحلة، واعرف التكلفة خلفها."),
        subtitle: b(
          "Trips flow into Fatoora e-invoices, and fuel and maintenance land on the right contract.",
          "الرحلات تتحول إلى فواتير إلكترونية، والوقود والصيانة تُحمَّل على العقد الصحيح.",
        ),
      },
    },
    lifecycleHeading: b(
      "Contract to invoice. One number through every stage.",
      "من العقد إلى الفاتورة، رقم واحد يمر بكل المراحل.",
    ),
    stages: [
      {
        title: b("Contracts & rates", "العقود والأسعار"),
        description: b(
          "Customer contracts and rates set up once, so every trip is billed right.",
          "عقود العملاء وأسعارها تُضبط مرة واحدة، فتُفوتر كل رحلة بشكل صحيح.",
        ),
        modules: b("Sales, contracts", "المبيعات، العقود"),
        roles: ["owner", "fin"],
      },
      {
        title: b("Trip planning", "تخطيط الرحلات"),
        description: b(
          "Trips assigned to vehicles and drivers, against each customer's contract.",
          "الرحلات تُسند للمركبات والسائقين، مقابل عقد كل عميل.",
        ),
        modules: b("Planning, fleet", "التخطيط، الأسطول"),
        roles: ["owner", "fleet"],
      },
      {
        title: b("Fuel & running cost", "الوقود وتكاليف التشغيل"),
        description: b(
          "Fuel and driver expenses recorded against the vehicle and the trip.",
          "الوقود ومصاريف السائق تُسجَّل على المركبة والرحلة.",
        ),
        modules: b("Fleet, expenses", "الأسطول، المصروفات"),
        roles: ["fleet", "fin"],
      },
      {
        title: b("Maintenance", "الصيانة"),
        description: b(
          "Service schedules, repairs and spare parts per vehicle, before the breakdown.",
          "جداول الصيانة والإصلاحات وقطع الغيار لكل مركبة، قبل أن تتعطل.",
        ),
        modules: b("Maintenance, inventory", "الصيانة، المخزون"),
        roles: ["fleet"],
      },
      {
        title: b("Delivery & proof", "التسليم والإثبات"),
        description: b(
          "Each delivery confirmed and its documents filed, ready to invoice.",
          "كل تسليم مؤكَّد ومستنداته محفوظة، جاهز للفوترة.",
        ),
        modules: b("Delivery, documents", "التسليم، المستندات"),
        roles: ["owner", "fleet"],
      },
      {
        title: b("Invoicing & profit per contract", "الفوترة وربح كل عقد"),
        description: b(
          "Fatoora e-invoices per trip or per month, and profit per contract and per vehicle.",
          "فواتير إلكترونية لكل رحلة أو شهريًا، وربح كل عقد وكل مركبة.",
        ),
        modules: b("Accounting, e-invoicing", "الحسابات، الفوترة الإلكترونية"),
        roles: ["owner", "fin"],
      },
    ],
    summary: {
      owner: {
        headline: b(
          "Every morning: trips done, cost per contract and the money owed to you.",
          "كل صباح: الرحلات المنفّذة، وتكلفة كل عقد، وما لك عند العملاء.",
        ),
        points: [
          b("Profit per contract, per customer and per vehicle", "ربح كل عقد وكل عميل وكل مركبة"),
          b("Vehicles idle, in the workshop or on the road", "المركبات المتوقفة والتي في الورشة والتي على الطريق"),
          b("Unbilled trips flagged before month-end", "الرحلات غير المفوترة تظهر قبل نهاية الشهر"),
          b("Receivables by customer and by age", "الذمم المدينة لكل عميل وحسب العمر"),
        ],
      },
      fleet: {
        headline: b(
          "Every vehicle's schedule, cost and condition in one place.",
          "جدول كل مركبة وتكلفتها وحالتها في مكان واحد.",
        ),
        points: [
          b("Preventive maintenance by date or kilometres", "صيانة وقائية حسب التاريخ أو الكيلومترات"),
          b("Fuel per vehicle and per trip", "الوقود لكل مركبة ولكل رحلة"),
          b("Spare parts stock for the workshop", "مخزون قطع الغيار للورشة"),
          b("Registration and insurance renewals flagged ahead", "تنبيه مسبق بتجديد الاستمارة والتأمين"),
        ],
      },
      fin: {
        headline: b(
          "Revenue and cost per trip, without rebuilding it from drivers' papers.",
          "إيراد وتكلفة كل رحلة، دون إعادة بنائها من أوراق السائقين.",
        ),
        points: [
          b("Trips invoiced from contract rates", "الرحلات تُفوتر من أسعار العقود"),
          b(
            "Fuel and maintenance charged to the right vehicle and contract",
            "الوقود والصيانة على المركبة والعقد الصحيحين",
          ),
          b("Driver advances and expenses settled against trips", "سلف السائقين ومصاريفهم تُسوّى مقابل الرحلات"),
          b("Fatoora e-invoices issued from the same system", "الفواتير الإلكترونية تصدر من النظام نفسه"),
        ],
      },
    },
    pains: {
      owner: {
        headline: b("Trucks on the road. Profit unknown.", "الشاحنات على الطريق، والربح مجهول."),
        items: [
          {
            pain: b(
              "Revenue known per contract, cost known by nobody",
              "الإيراد معروف لكل عقد، والتكلفة لا يعرفها أحد",
            ),
            fix: b(
              "Some contracts lose money on every trip and look fine on the invoice.",
              "بعض العقود تخسر في كل رحلة، وتبدو سليمة في الفاتورة.",
            ),
          },
          {
            pain: b("Trips done but never billed", "رحلات نُفّذت ولم تُفوتر"),
            fix: b(
              "The paperwork came back late, or not at all.",
              "الأوراق رجعت متأخرة، أو لم ترجع.",
            ),
          },
          {
            pain: b("Vehicles parked, waiting for repairs", "مركبات متوقفة بانتظار الإصلاح"),
            fix: b(
              "Every idle day is a contract you can't serve.",
              "كل يوم توقف هو عقد لا تستطيع خدمته.",
            ),
          },
          {
            pain: b("Buying trucks by feel", "قرار شراء الشاحنات بالإحساس"),
            fix: b(
              "Without cost per vehicle, you can't tell which ones earn their keep.",
              "بلا تكلفة لكل مركبة، لا تعرف أيها يغطي تكلفته.",
            ),
          },
        ],
      },
      fleet: {
        headline: b("Breakdowns you could have seen coming.", "أعطال كان يمكن توقعها."),
        items: [
          {
            pain: b("Maintenance when something breaks", "الصيانة حين يتعطل شيء"),
            fix: b(
              "Instead of on a schedule, before the trip.",
              "بدلًا من جدول منتظم قبل الرحلة.",
            ),
          },
          {
            pain: b("Fuel receipts in a drawer", "فواتير الوقود في درج"),
            fix: b(
              "So nobody can say which vehicle burns too much.",
              "فلا أحد يعرف أي مركبة تستهلك أكثر من اللازم.",
            ),
          },
          {
            pain: b("Spare parts bought twice, or not at all", "قطع غيار تُشترى مرتين، أو لا تُشترى"),
            fix: b(
              "The workshop and the store keep different lists.",
              "الورشة والمستودع لكل منهما قائمته.",
            ),
          },
          {
            pain: b("An expired registration found at a checkpoint", "استمارة منتهية تُكتشف عند نقطة تفتيش"),
            fix: b(
              "Renewals depend on one person's calendar.",
              "التجديد يعتمد على تقويم شخص واحد.",
            ),
          },
        ],
      },
      fin: {
        headline: b("Month-end starts with a pile of trip sheets.", "إقفال الشهر يبدأ بكومة أوراق رحلات."),
        items: [
          {
            pain: b("Invoices built from drivers' papers", "الفواتير تُبنى من أوراق السائقين"),
            fix: b("A missing sheet is missing revenue.", "الورقة الناقصة إيراد ناقص."),
          },
          {
            pain: b("Fuel and repairs in one big expense line", "الوقود والإصلاحات في بند مصروف واحد كبير"),
            fix: b(
              "Never charged to the vehicle or the contract that caused them.",
              "لا تُحمَّل على المركبة أو العقد الذي تسبّب بها.",
            ),
          },
          {
            pain: b("Driver advances settled by hand", "سلف السائقين تُسوّى يدويًا"),
            fix: b("And the balances never quite agree.", "والأرصدة لا تتطابق تمامًا."),
          },
          {
            pain: b("E-invoicing separate from the trips", "الفوترة الإلكترونية منفصلة عن الرحلات"),
            fix: b("Every invoice typed twice.", "كل فاتورة تُكتب مرتين."),
          },
        ],
      },
    },
    fit: {
      odoo: {
        when: b(
          "If you want fleet and field apps that grow with you",
          "إذا أردت تطبيقات أسطول وعمل ميداني تكبر مع عملك",
        ),
        points: [
          b("Fleet, inventory and accounting as connected apps", "الأسطول والمخزون والحسابات تطبيقات مترابطة"),
          b("Drivers and supervisors work from their phones", "السائقون والمشرفون يعملون من الجوال"),
          b("Custom features our developers build around your contracts", "مزايا خاصة يبنيها مطوّرونا حول عقودك"),
        ],
      },
      falcon: {
        when: b(
          "If you want fleet costs and accounts on your own server",
          "إذا أردت تكاليف الأسطول والحسابات على سيرفرك",
        ),
        points: [
          b(
            "Equipment, maintenance and rental modules in the same system as the accounts",
            "وحدات المعدات والصيانة والتأجير في النظام نفسه مع الحسابات",
          ),
          b("Arabic-first, quick for accountants to learn", "عربي أولًا، وسريع التعلّم على المحاسبين"),
          b("On your internal network, or Falcon Cloud in the browser", "على شبكتك الداخلية، أو فالكون كلاود من المتصفح"),
        ],
      },
    },
    plan: {
      assess: b(
        "We map your contracts, trips and fleet in one session: where cost and revenue leak.",
        "نرسم عقودك ورحلاتك وأسطولك في جلسة واحدة: أين تتسرّب التكلفة والإيراد.",
      ),
      setup: b(
        "We load your vehicles, customers, contract rates and balances, and reconcile them with you.",
        "ننقل مركباتك وعملاءك وأسعار العقود والأرصدة، ونطابقها معك.",
      ),
      train: b(
        "Dispatchers, the workshop and finance train on your own trips and vehicles, and we stay with you after go-live.",
        "فريق التشغيل والورشة والمالية يتدرّبون على رحلاتك ومركباتك الحقيقية، ونبقى معك بعد التشغيل.",
      ),
    },
    quoteWho: b("a logistics company", "شركة نقل"),
    faqHeading: b("What transport and fleet operators ask", "ما يسأله مشغّلو النقل والأساطيل"),
    faqs: [
      {
        question: b("Why are there no prices on the site?", "لماذا لا توجد أسعار على الموقع؟"),
        answer: b(
          "Because a company with a handful of vehicles doesn't need what a fleet across several cities needs. After the session you get a written proposal with scope, price and timeline.",
          "لأن شركة ببضع مركبات لا تحتاج ما يحتاجه أسطول في عدة مدن. بعد الجلسة تحصل على عرض مكتوب بالنطاق والسعر والجدول.",
        ),
      },
      {
        question: b("Can we see cost per vehicle and per contract?", "هل نرى التكلفة لكل مركبة ولكل عقد؟"),
        answer: b(
          "Yes. Fuel, maintenance and driver costs are recorded against the vehicle and the trip, so both views come from the same data.",
          "نعم. الوقود والصيانة وتكاليف السائق تُسجَّل على المركبة والرحلة، فتأتي الصورتان من البيانات نفسها.",
        ),
      },
      FATOORA_FAQ,
      {
        question: b("Can you move our vehicles and customer balances?", "هل تنقلون مركباتنا وأرصدة العملاء؟"),
        answer: b(
          "Yes. Vehicles, customers, contract rates, open balances and spare parts stock are part of the migration plan.",
          "نعم. المركبات والعملاء وأسعار العقود والأرصدة المفتوحة ومخزون قطع الغيار جزء من خطة الترحيل.",
        ),
      },
    ],
    booking: {
      heading: b("One session shows you where your trips lose money.", "جلسة واحدة تكفي لترى أين تخسر رحلاتك."),
      body: b(
        "A consultant maps your contracts, trips and fleet with you, then sends a written recommendation: which system, what scope, how long.",
        "مستشار تطبيق يرسم معك عقودك ورحلاتك وأسطولك، ثم يرسل لك توصية مكتوبة: أي نظام، أي نطاق، وكم من الوقت.",
      ),
    },
  }),
);
