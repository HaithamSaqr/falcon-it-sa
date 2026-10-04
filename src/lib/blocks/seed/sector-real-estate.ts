/**
 * Real estate and construction sector page seed.
 * Arabic transcribed from the approved desktop artboard
 * (mockups/Sector-Contracting-AR.dc.html); English from the approved mobile
 * artboard (mockups/Sector-Contracting-Mobile-EN.dc.html). Where one artboard
 * has copy the other lacks (stage modules, role summary, fourth pain, fit,
 * plan), the missing side is written to match.
 */
import { b, demoCta } from "../fields";
import { seedPage } from "./helpers";
import { V2_SECTORS } from "./sectors";

const realEstate = V2_SECTORS.find((s) => s.slug === "real-estate")!;

const roles = [
  { id: "dev", label: b("Developer", "مطوّر عقاري") },
  { id: "con", label: b("Contractor", "مقاول") },
  { id: "bro", label: b("Broker", "وسيط عقاري") },
];

export const SECTOR_REAL_ESTATE_SEED = seedPage("sector:real-estate", [
  {
    type: "sector_hero",
    content: {
      roles,
      rolePrompt: b("Your role", "دورك"),
      promise: {
        dev: {
          title: b("Know every unit's profit before you sell it.", "اعرف ربح كل وحدة قبل أن تبيعها."),
          subtitle: b(
            "From buying the land to handing over the keys: cost, sales and instalments in one system, every morning.",
            "من شراء الأرض إلى تسليم المفتاح: التكلفة والمبيعات والأقساط في نظام واحد، أمامك كل صباح.",
          ),
        },
        con: {
          title: b("Claims on time. Margin you can see from site.", "مستخلصك في موعده، وهامشك أمامك."),
          subtitle: b(
            "Measured quantities become your progress claim, and every material lands on the right project.",
            "الكميات المنفّذة تتحوّل إلى مستخلص، وكل مادة ومعدة تُحمَّل على مشروعها الصحيح.",
          ),
        },
        bro: {
          title: b("Never show a unit that sold yesterday.", "لا شقة مبيعة تُعرض، ولا عمولة تضيع."),
          subtitle: b(
            "Every owner's units with live status, every lead with an owner, commission calculated at close.",
            "وحدات كل الملاك بحالتها الحقيقية، وكل عميل له مسار، والعمولة محسوبة مع كل صفقة.",
          ),
        },
      },
      photo: realEstate.photo,
      photoAlt: realEstate.photoAlt,
      trustLine: b(""),
      primaryCta: demoCta(),
      secondaryCta: {
        label: b("See your stages in the cycle", "شاهد مراحلك في الدورة"),
        href: "/sectors/real-estate#cycle",
      },
    },
  },
  {
    type: "logo_wall",
    content: {
      heading: b(
        "Developers and contractors running on systems we implemented",
        "مطوّرون ومقاولون يعملون على أنظمة طبّقها فريقنا",
      ),
      intro: b(""),
      limit: 7,
      link: { label: b(""), href: "" },
    },
  },
  {
    type: "lifecycle",
    content: {
      heading: b(
        "Land to keys. One number through every stage.",
        "من الأرض إلى المفتاح، رقم واحد يمر بكل المراحل.",
      ),
      intro: b(
        "No spreadsheets in between. Switch your role above to light up the stages you live every day.",
        "لا جداول بين مرحلة وأخرى. غيّر دورك في الأعلى، وستضيء المراحل التي تعيشها كل يوم.",
      ),
      yourRoleLabel: b("Your role", "دورك هنا"),
      roles,
      stages: [
        {
          title: b("Land & feasibility", "الأرض والجدوى"),
          description: b(
            "Know if the project is worth it before the first riyal.",
            "اعرف هل يستحق المشروع قبل أول ريال: تكلفة الأرض والجدوى والميزانية معًا.",
          ),
          modules: b("Assets, budgets", "الأصول، الموازنات"),
          roles: ["dev"],
        },
        {
          title: b("Design & contracts", "التصميم والتعاقد"),
          description: b(
            "Quantities and contractor contracts, approved before digging starts.",
            "جداول الكميات وعقود المقاولين والموردين، معتمدة قبل أن يبدأ الحفر.",
          ),
          modules: b("Projects, contracts", "المشاريع، العقود"),
          roles: ["dev", "con"],
        },
        {
          title: b("Construction", "التنفيذ"),
          description: b(
            "Every claim against work actually done, every bag of cement on the right project.",
            "كل مستخلص مقابل ما نُفّذ فعلًا، وكل كيس إسمنت على مشروعه الصحيح.",
          ),
          modules: b("Progress claims, warehouses, equipment", "المستخلصات، المخازن، المعدات"),
          roles: ["dev", "con"],
        },
        {
          title: b("Units & pricing", "الوحدات والتسعير"),
          description: b(
            "Every unit's area, price and status, right now.",
            "كل شقة بمساحتها وسعرها وحالتها الآن: متاحة، محجوزة، مباعة.",
          ),
          modules: b("Property directory", "الدليل العقاري"),
          roles: ["dev", "bro"],
        },
        {
          title: b("Marketing & sales", "التسويق والبيع"),
          description: b(
            "From first call to signed contract, with instalments and broker commission.",
            "من أول اتصال إلى توقيع العقد، مع جدول الأقساط وعمولة الوسيط.",
          ),
          modules: b("CRM, sales contracts, collections", "CRM، عقود البيع، التحصيل"),
          roles: ["dev", "bro"],
        },
        {
          title: b("Handover & operations", "التسليم والتشغيل"),
          description: b(
            "Handover, warranty and maintenance, or leasing, collections and owner statements.",
            "تسليم وضمان وصيانة، أو إيجار وتحصيل وكشف حساب للمالك.",
          ),
          modules: b("Maintenance, lease contracts", "الصيانة، عقود الإيجار"),
          roles: ["dev", "con", "bro"],
        },
      ],
      summary: {
        dev: {
          headline: b(
            "Every morning: what you spent, sold, collected and earned on every unit.",
            "كل صباح: كم صرفت، كم بعت، كم حصّلت، وكم ربحت في كل وحدة.",
          ),
          points: [
            b(
              "Construction cost is spread across the units, so you see an apartment's profit before you price it",
              "تكلفة البناء تُوزَّع على الوحدات، فترى ربح الشقة قبل أن تحدد سعرها",
            ),
            b(
              "One status per unit for sales, admin and brokers, so no apartment takes two deposits",
              "حالة واحدة لكل وحدة عند المبيعات والإدارة والوسطاء، فلا عربونين على شقة واحدة",
            ),
            b(
              "Instalments, arrears and expected cash, without a side Excel file",
              "الأقساط والمتأخرات والسيولة المتوقعة، بلا ملف Excel جانبي",
            ),
            b(
              "You pay the contractor's claim for work actually done, not work requested",
              "تدفع مستخلص المقاول مقابل ما نُفّذ فعلًا، لا مقابل ما طُلب",
            ),
          ],
        },
        con: {
          headline: b(
            "Know each project's margin while it is still on site, not on handover day.",
            "تعرف هامش كل مشروع وهو ما زال في الموقع، لا يوم التسليم.",
          ),
          points: [
            b("Actual against budget for every line item, every day", "الفعلي مقابل الميزانية لكل بند، كل يوم"),
            b(
              "Claims built from measured quantities, so they reach the client faster",
              "المستخلص يُبنى من الكميات المنفّذة، فيصل للعميل أسرع",
            ),
            b(
              "Subcontractor payments and retentions calculated, not kept in someone's notebook",
              "دفعات مقاولي الباطن ومحتجزاتهم محسوبة، لا في دفتر أحدهم",
            ),
            b(
              "Every tonne of steel and every equipment hour on the project that used it",
              "كل طن حديد وساعة معدة على المشروع الذي استهلكها",
            ),
          ],
        },
        bro: {
          headline: b(
            "No unit shown after it sells, no lead lost, no commission late.",
            "لا شقة تُعرض بعد بيعها، ولا عميل يضيع، ولا عمولة تتأخر.",
          ),
          points: [
            b(
              "Every owner's and developer's units in one directory, with their status now",
              "وحدات كل الملاك والمطوّرين في دليل واحد، بحالتها الآن",
            ),
            b(
              "Every lead has an owner and a path, from first call to contract",
              "كل عميل له صاحب ومسار، من أول اتصال إلى العقد",
            ),
            b(
              "Commission calculated when the deal closes, not at month-end",
              "العمولة تُحسب مع إغلاق الصفقة، لا آخر الشهر",
            ),
            b(
              "A reminder before every rent instalment and every contract renewal",
              "تنبيه قبل كل قسط إيجار وكل تجديد عقد",
            ),
          ],
        },
      },
    },
  },
  {
    type: "role_pains",
    content: {
      heading: b("Sound familiar?", "هل يبدو هذا مألوفًا؟"),
      intro: b(""),
      roles,
      pains: {
        dev: {
          headline: b(
            "You sold the unit. Do you know what you made?",
            "بعت الوحدة، وما زلت لا تعرف كم ربحت فيها؟",
          ),
          items: [
            {
              pain: b(
                "Cost with accounting, sales with the sales team",
                "التكلفة عند المحاسب، والمبيعات عند فريق البيع",
              ),
              fix: b(
                "Nobody can tell you unit 1204's profit without a week of digging.",
                "ولا أحد يستطيع أن يقول لك ربح الشقة 1204 دون أسبوع من التجميع.",
              ),
            },
            {
              pain: b("Same apartment, two buyers, two deposits", "نفس الشقة، عميلان، وعربونان"),
              fix: b(
                "Sales, admin and brokers see different statuses. The deal ends in an apology.",
                "حالة الوحدات تختلف بين المبيعات والإدارة والوسطاء، فتنتهي الصفقة باعتذار.",
              ),
            },
            {
              pain: b("Instalments in a file nobody opens", "الأقساط في ملف لا يراه أحد"),
              fix: b(
                "Arrears surface late, and cash planning is guesswork.",
                "تكتشف المتأخرات بعد أن تتراكم، وتخطط سيولتك بالتخمين.",
              ),
            },
            {
              pain: b(
                "The contractor wants his claim paid. How much was actually built?",
                "المقاول يطالب بمستخلص، نُفّذ منه كم؟",
              ),
              fix: b(
                "With no link to approved quantities, you pay first and check later.",
                "بلا ربط بالكميات المعتمدة، تدفع أولًا وتراجع لاحقًا.",
              ),
            },
          ],
        },
        con: {
          headline: b("Profitable on paper. Losing money on site.", "المشروع رابح على الورق، وخاسر في الموقع."),
          items: [
            {
              pain: b("Claims wait for weeks", "المستخلص ينتظر أسابيع"),
              fix: b(
                "Quantities sit in engineers' files, and your cash waits with them.",
                "الكميات في ملفات المهندسين، والمستخلص لا يخرج قبل التجميع، والسيولة تنتظر معه.",
              ),
            },
            {
              pain: b("Steel issued to one project, charged to another", "حديد يُصرف لمشروع ويُحمَّل على آخر"),
              fix: b(
                "So a losing project looks profitable, and the other way round.",
                "فيبدو مشروع رابحًا وهو خاسر، والعكس.",
              ),
            },
            {
              pain: b("Retentions in someone's notebook", "محتجزات مقاولي الباطن في دفتر أحدهم"),
              fix: b(
                "Every payment mistake comes out of your margin.",
                "وكل خطأ في الدفعات أو الخصومات يخرج من هامشك أنت.",
              ),
            },
            {
              pain: b("You find the loss on handover day", "تكتشف الخسارة يوم التسليم"),
              fix: b("When it is too late to fix anything.", "حين يكون الوقت قد فات لتصحيح أي شيء."),
            },
          ],
        },
        bro: {
          headline: b("Units on WhatsApp. Commissions in memory.", "الوحدات في الواتساب، والعمولات في الذاكرة."),
          items: [
            {
              pain: b("You showed a unit that sold yesterday", "تعرض شقة بيعت أمس"),
              fix: b(
                "Listings live in files and chats from many owners, often out of date.",
                "القوائم في ملفات ورسائل من ملاك مختلفين، وحالتها قديمة غالبًا.",
              ),
            },
            {
              pain: b("The client called your colleague first", "العميل اتصل بزميلك قبلك"),
              fix: b(
                "Nobody knows who followed up, or where it stopped.",
                "لا أحد يعرف من تابعه، ومتى، وأين توقف.",
              ),
            },
            {
              pain: b(
                "Commission settled at month-end, and argued over",
                "العمولة تُحسب آخر الشهر، ويُختلف عليها",
              ),
              fix: b(
                "Inside the team and with owners, while the next deal waits.",
                "داخل الفريق ومع الملاك، والصفقة القادمة تنتظر.",
              ),
            },
            {
              pain: b("A lease ends, and nobody calls", "عقد إيجار ينتهي، ولا أحد يتصل"),
              fix: b(
                "Collections and renewals depend on one person's memory.",
                "التحصيل والتجديد يعتمدان على ذاكرة شخص واحد.",
              ),
            },
          ],
        },
      },
    },
  },
  {
    type: "fit",
    content: {
      heading: b("Odoo or Falcon? We will tell you plainly.", "أودو أم فالكون؟ سنقولها لك بصراحة."),
      intro: b(
        "We implement both, so we gain nothing by pushing either one. The recommendation comes from your own cycle.",
        "نطبّق النظامين، فلا مصلحة لنا في ترشيح أحدهما. التوصية تأتي من دورتك أنت.",
      ),
      odoo: {
        name: b("Odoo", "أودو"),
        when: b("If sales and brokers are the heart of your business", "إذا كانت المبيعات والوسطاء قلب عملك"),
        points: [
          b("Strong CRM and a portal for clients and brokers", "CRM قوي وبوابة للعملاء والوسطاء"),
          b("Site engineers work from their phones", "مهندس الموقع يعمل من الجوال"),
          b(
            "Custom development for units, contracts and commissions, built around your procedures",
            "تطوير خاص للوحدات والعقود والعمولات حسب إجراءاتك",
          ),
        ],
      },
      falcon: {
        name: b("Falcon ERP", "فالكون ERP"),
        when: b(
          "If you want real estate and contracting on your own server",
          "إذا أردت العقارات والمقاولات على سيرفرك",
        ),
        points: [
          b(
            "Real estate module: properties and units, lease and sale contracts, instalment collection",
            "وحدة العقارات: العقارات والوحدات، وعقود الإيجار والبيع، وتحصيل الأقساط",
          ),
          b(
            "Tenders, project budgets and subcontractor extracts in the same system",
            "العطاءات وموازنات المشاريع ومستخلصات مقاولي الباطن في النظام نفسه",
          ),
          b(
            "On your internal network, or Falcon Cloud in the browser",
            "على شبكتك الداخلية، أو فالكون كلاود من المتصفح",
          ),
        ],
      },
      closing: b(""),
    },
  },
  {
    type: "plan",
    content: {
      heading: b("Four steps, no surprises.", "أربع خطوات، ولا مفاجآت."),
      intro: b(""),
      steps: [
        {
          title: b("Assess", "التقييم"),
          description: b(
            "We map your cycle in one session: where the numbers leak, and who needs what.",
            "نرسم دورتك في جلسة واحدة: أين تتسرّب الأرقام، ومن يحتاج ماذا.",
          ),
          duration: b("1 day", "يوم واحد"),
        },
        {
          title: b("Blueprint", "المخطط"),
          description: b(
            "A written scope and timeline you sign before we start.",
            "نطاق مكتوب وجدول زمني توقّع عليه قبل أن نبدأ.",
          ),
          duration: b("1 to 2 weeks", "من أسبوع إلى أسبوعين"),
        },
        {
          title: b("Setup and migration", "الإعداد والترحيل"),
          description: b(
            "We move your projects, units, contracts and balances, and reconcile them with you figure by figure.",
            "ننقل مشاريعك ووحداتك وعقودك وأرصدتك، ونطابقها معك رقمًا برقم.",
          ),
          duration: b("4 to 8 weeks", "من 4 إلى 8 أسابيع"),
        },
        {
          title: b("Training and go-live", "التدريب والتشغيل"),
          description: b(
            "Your team trains on its real apartments and contracts, and we stay with you after go-live.",
            "فريقك يتدرّب على شققه وعقوده الحقيقية، ونبقى معك بعد التشغيل.",
          ),
          duration: b("1 to 2 weeks", "من أسبوع إلى أسبوعين"),
        },
      ],
    },
  },
  {
    type: "quote",
    // Ships disabled until a real, approved client quote is entered in admin.
    enabled: false,
    content: {
      text: b(
        "[One real sentence from a developer, contractor or broker about a specific result, approved by them.]",
        "[جملة واحدة حقيقية من مطوّر أو مقاول أو وسيط عن نتيجة محددة، بعد موافقته.]",
      ),
      name: b("[Name]", "[الاسم]"),
      role: b("[Role]", "[المنصب]"),
      company: b("[Company]", "[الشركة]"),
      logo: "",
      logoAlt: b(""),
    },
  },
  {
    type: "faq_ref",
    content: {
      heading: b("What developers, contractors and brokers ask", "ما يسأله المطوّرون والمقاولون والوسطاء"),
      items: [
        {
          question: b("Why are there no prices on the site?", "لماذا لا توجد أسعار على الموقع؟"),
          answer: b(
            "Because a developer with three projects doesn't need what a broker with a hundred units needs. After the session you get a written proposal with scope, price and timeline.",
            "لأن مطوّرًا بثلاثة مشاريع لا يحتاج ما يحتاجه وسيط بمئة وحدة. بعد الجلسة تحصل على عرض مكتوب بالنطاق والسعر والجدول، ولا شيء مخفي.",
          ),
        },
        {
          question: b(
            "We develop, build, sell and lease. One system?",
            "نطوّر ونبني ونبيع ونؤجّر، هل يكفي نظام واحد؟",
          ),
          answer: b(
            "Yes, one system can hold the whole cycle. How build cost reaches the units, and how each unit then goes to sale or lease, we configure in the blueprint to match how you work.",
            "نعم، يمكن أن تكون الدورة كلها في نظام واحد. أما كيف تصل تكلفة البناء إلى الوحدات، وكيف تنتقل كل وحدة بعدها إلى البيع أو الإيجار، فنضبط ذلك في المخطط حسب طريقة عملك.",
          ),
        },
        {
          question: b("We are brokers only. Is it for us?", "نحن وسطاء فقط، هل يناسبنا؟"),
          answer: b(
            "Yes. We implement only what you need, such as units, deals, commissions and leasing, without the construction stages, and we configure it in the blueprint to match how you work.",
            "نعم. نطبّق ما تحتاجه فقط، مثل الوحدات والصفقات والعمولات والإيجار، دون مراحل البناء، ونضبط ذلك في المخطط حسب طريقة عملك.",
          ),
        },
        {
          question: b("Can you move our units and contracts?", "هل تنقلون وحداتنا وعقودنا الحالية؟"),
          answer: b(
            "Yes. Open projects, units, contracts, instalments and balances are part of the migration plan.",
            "نعم. المشاريع المفتوحة والوحدات والعقود والأقساط والأرصدة جزء من الخطة، ونطابقها معك قبل التشغيل.",
          ),
        },
      ],
    },
  },
  {
    type: "booking",
    content: {
      heading: b(
        "One session shows you where your numbers leak.",
        "جلسة واحدة تكفي لترى أين تتسرّب أرقامك.",
      ),
      body: b(
        "A consultant who has worked with developers, contractors and brokers maps your cycle, then sends a written recommendation.",
        "مستشار تطبيق عمل مع مطوّرين ومقاولين ووسطاء يرسم دورتك معك، ثم يرسل لك توصية مكتوبة: أي نظام، أي نطاق، وكم من الوقت.",
      ),
      cta: demoCta(),
      noteTitle: b("Free, no commitment.", "مجانية وبلا التزام."),
      note: b(
        "No prices online because every cycle is different; your proposal comes in writing after the session.",
        "لا أسعار على الموقع لأن لكل دورة احتياجاتها؛ وعرضك يصلك مكتوبًا بعد الجلسة.",
      ),
    },
  },
]);
