/** Services and professional sector page seed (EN + AR). */
import { b } from "../fields";
import { seedPage } from "./helpers";
import { sectorBlocks, FATOORA_FAQ } from "./common";

const roles = [
  { id: "partner", label: b("Partner", "الشريك") },
  { id: "pm", label: b("Project manager", "مدير المشروع") },
  { id: "fin", label: b("Finance", "المدير المالي") },
];

export const SECTOR_PROFESSIONAL_SERVICES_SEED = seedPage(
  "sector:professional-services",
  sectorBlocks({
    slug: "professional-services",
    roles,
    promise: {
      partner: {
        title: b("Know which clients and projects are worth your time.", "اعرف أي العملاء وأي المشاريع تستحق وقتك."),
        subtitle: b(
          "Hours, cost and billing per project in one system, so margin is visible before the project ends.",
          "الساعات والتكلفة والفوترة لكل مشروع في نظام واحد، فيظهر الهامش قبل نهاية المشروع.",
        ),
      },
      pm: {
        title: b("Deliver on time, on a budget you can see.", "سلّم في الموعد، وبميزانية تراها أمامك."),
        subtitle: b(
          "Tasks, timesheets and budget side by side, updated every week, not at the end.",
          "المهام وسجلات الوقت والميزانية جنبًا إلى جنب، محدّثة كل أسبوع لا في النهاية.",
        ),
      },
      fin: {
        title: b("Bill every hour you worked.", "فوتر كل ساعة عملتها."),
        subtitle: b(
          "Timesheets and milestones flow into Fatoora e-invoices, and nothing billable is left behind.",
          "سجلات الوقت والمراحل تتحول إلى فواتير إلكترونية، ولا يبقى عمل قابل للفوترة دون فاتورة.",
        ),
      },
    },
    lifecycleHeading: b(
      "Proposal to payment. One number through every stage.",
      "من العرض إلى التحصيل، رقم واحد يمر بكل المراحل.",
    ),
    stages: [
      {
        title: b("Proposal & engagement", "العرض والتعاقد"),
        description: b(
          "Proposals priced from real rates, and each engagement opened with its budget.",
          "عروض مسعّرة من أسعار الساعات الفعلية، وكل تعاقد يُفتح بميزانيته.",
        ),
        modules: b("CRM, sales", "CRM، المبيعات"),
        roles: ["partner", "fin"],
      },
      {
        title: b("Planning & staffing", "التخطيط وتوزيع الفريق"),
        description: b(
          "The right people on the right projects, with workload you can see.",
          "الأشخاص المناسبون على المشاريع المناسبة، وضغط العمل ظاهر أمامك.",
        ),
        modules: b("Projects, planning", "المشاريع، التخطيط"),
        roles: ["partner", "pm"],
      },
      {
        title: b("Delivery & tasks", "التنفيذ والمهام"),
        description: b(
          "Tasks, milestones and documents in one place for each project.",
          "المهام والمراحل والمستندات في مكان واحد لكل مشروع.",
        ),
        modules: b("Projects, tasks, documents", "المشاريع، المهام، المستندات"),
        roles: ["pm"],
      },
      {
        title: b("Timesheets & expenses", "سجلات الوقت والمصروفات"),
        description: b(
          "Hours and expenses logged against the project in the same week.",
          "الساعات والمصروفات تُسجَّل على المشروع في الأسبوع نفسه.",
        ),
        modules: b("Timesheets, expenses", "سجلات الوقت، المصروفات"),
        roles: ["pm", "fin"],
      },
      {
        title: b("Billing", "الفوترة"),
        description: b(
          "Invoices from milestones, retainers or hours, issued as Fatoora e-invoices.",
          "فواتير حسب المراحل أو الساعات أو الأتعاب الشهرية الثابتة، متوافقة مع منصة فاتورة.",
        ),
        modules: b("Accounting, e-invoicing", "الحسابات، الفوترة الإلكترونية"),
        roles: ["pm", "fin"],
      },
      {
        title: b("Profitability", "الربحية"),
        description: b(
          "Budget against actual, and margin per project, client and team.",
          "الميزانية مقابل الفعلي، والهامش لكل مشروع وعميل وفريق.",
        ),
        modules: b("Reports, accounting", "التقارير، الحسابات"),
        roles: ["partner", "pm", "fin"],
      },
    ],
    summary: {
      partner: {
        headline: b(
          "Every week: utilisation, margin and billing per project and client.",
          "كل أسبوع: نسبة إشغال الفريق والهامش والفوترة لكل مشروع وعميل.",
        ),
        points: [
          b("Margin per project and per client", "الهامش لكل مشروع ولكل عميل"),
          b("Team utilisation, billable against non-billable", "نسبة الساعات القابلة للفوترة مقابل غير القابلة لكل فريق"),
          b("Projects over budget flagged early", "المشاريع المتجاوزة للميزانية تظهر مبكرًا"),
          b("Work done but not yet billed", "الأعمال المنجزة غير المفوترة بعد"),
        ],
      },
      pm: {
        headline: b(
          "Your project's tasks, hours and budget in one view.",
          "مهام مشروعك وساعاته وميزانيته في شاشة واحدة.",
        ),
        points: [
          b("Tasks and milestones with owners and dates", "مهام ومراحل بأصحابها ومواعيدها"),
          b("Timesheets against the budget, every week", "سجلات الوقت مقابل الميزانية، كل أسبوع"),
          b("Team workload before you commit to dates", "ضغط العمل على الفريق قبل الالتزام بالمواعيد"),
          b("Documents and decisions kept with the project", "المستندات والقرارات محفوظة مع المشروع"),
        ],
      },
      fin: {
        headline: b("Invoices from the work itself, not from reminders.", "فواتير من العمل نفسه، لا من التذكير."),
        points: [
          b("Billing by milestone, retainer or hours", "فوترة حسب المراحل أو الساعات أو الأتعاب الشهرية الثابتة"),
          b("Unbilled time flagged before month-end", "الوقت غير المفوتر يظهر قبل نهاية الشهر"),
          b("Project expenses recharged to clients where agreed", "مصروفات المشروع تُحمَّل على العميل حيث اتُّفق"),
          b("Fatoora e-invoices issued from the same system", "الفواتير الإلكترونية تصدر من النظام نفسه"),
        ],
      },
    },
    pains: {
      partner: {
        headline: b("A busy team. A thin margin.", "فريق مشغول، وهامش رفيع."),
        items: [
          {
            pain: b("Every project looks profitable until it ends", "كل مشروع يبدو رابحًا حتى ينتهي"),
            fix: b(
              "Overruns show up after the last invoice.",
              "التجاوزات تظهر بعد آخر فاتورة.",
            ),
          },
          {
            pain: b(
              "Some clients take far more hours than they pay for",
              "بعض العملاء يأخذون ساعات أكثر بكثير مما يدفعون",
            ),
            fix: b(
              "Without time per client, you can't tell which.",
              "بلا وقت مسجّل لكل عميل، لا تعرف من هم.",
            ),
          },
          {
            pain: b("Senior people on low-value work", "الخبراء على أعمال قليلة القيمة"),
            fix: b(
              "Because nobody sees the workload across the firm.",
              "لأن أحدًا لا يرى ضغط العمل على مستوى الشركة.",
            ),
          },
          {
            pain: b("Pricing new work on instinct", "تسعير الأعمال الجديدة بالحدس"),
            fix: b(
              "Instead of on what similar projects really cost.",
              "بدلًا من التكلفة الفعلية للمشاريع المشابهة.",
            ),
          },
        ],
      },
      pm: {
        headline: b("Deadlines on one list. Hours on another.", "المواعيد في قائمة، والساعات في قائمة أخرى."),
        items: [
          {
            pain: b("Timesheets filled in on Thursday, from memory", "سجلات الوقت تُملأ يوم الخميس من الذاكرة"),
            fix: b(
              "So the budget picture is always a week late.",
              "فتأتي صورة الميزانية متأخرة أسبوعًا دائمًا.",
            ),
          },
          {
            pain: b("Tasks in chats and spreadsheets", "المهام في المحادثات وملفات Excel"),
            fix: b("Nobody is sure who owns what.", "لا أحد متأكد من المسؤول عن ماذا."),
          },
          {
            pain: b("The budget runs out before the work does", "الميزانية تنتهي قبل العمل"),
            fix: b("And you hear it from finance.", "وتعرف ذلك من المالية."),
          },
          {
            pain: b("Scope changes agreed by phone", "تغييرات النطاق تُتفق بالهاتف"),
            fix: b("Then argued over at invoicing.", "ثم يُختلف عليها عند الفوترة."),
          },
        ],
      },
      fin: {
        headline: b("Work done. Not yet billed.", "العمل منجز، والفاتورة لم تصدر."),
        items: [
          {
            pain: b("Chasing timesheets to send invoices", "تلاحق سجلات الوقت لتصدر الفواتير"),
            fix: b("Billing waits for the slowest person.", "الفوترة تنتظر أبطأ شخص."),
          },
          {
            pain: b(
              "Billable expenses that never reach the invoice",
              "مصروفات قابلة للفوترة لا تصل للفاتورة",
            ),
            fix: b(
              "Travel and printing absorbed by the firm.",
              "السفر والطباعة تتحملها الشركة.",
            ),
          },
          {
            pain: b("Retainers tracked in a spreadsheet", "الأتعاب الشهرية الثابتة في ملف Excel"),
            fix: b("How many hours are used against them, nobody knows.", "وكم استُهلك منها، لا أحد يعرف."),
          },
          {
            pain: b("Revenue recognised by guesswork", "الإيراد يُثبت بالتقدير"),
            fix: b(
              "Because progress on each project isn't recorded.",
              "لأن تقدّم كل مشروع غير مسجّل.",
            ),
          },
        ],
      },
    },
    fit: {
      odoo: {
        when: b(
          "If you want projects, timesheets and billing as flexible connected apps",
          "إذا أردت المشاريع وسجلات الوقت والفوترة تطبيقات مرنة مترابطة",
        ),
        points: [
          b("Projects, timesheets, planning and invoicing connected", "المشاريع وسجلات الوقت والتخطيط والفوترة مترابطة"),
          b("A portal where clients see documents and invoices", "بوابة يرى فيها العملاء المستندات والفواتير"),
          b("Custom features our developers build around your process", "مزايا خاصة يبنيها مطوّرونا حول إجراءاتك"),
        ],
      },
      falcon: {
        when: b(
          "If you want projects and accounts on your own server, in Arabic",
          "إذا أردت المشاريع والحسابات على سيرفرك، وبالعربية",
        ),
        points: [
          b(
            "Projects, tasks and documents in the same system as the accounts",
            "المشاريع والمهام والمستندات في النظام نفسه مع الحسابات",
          ),
          b("Arabic-first, quick for accountants to learn", "عربي أولًا، ويتعلّمه المحاسبون بسرعة"),
          b("On your internal network, or Falcon Cloud in the browser", "على شبكتك الداخلية، أو فالكون كلاود من المتصفح"),
        ],
      },
    },
    plan: {
      assess: b(
        "We map how your firm wins, delivers and bills work in one session.",
        "نرسم في جلسة واحدة كيف تكسب شركتك الأعمال وتنفّذها وتفوترها.",
      ),
      setup: b(
        "We load your clients, open projects, rates and balances, and reconcile them with you.",
        "ننقل عملاءك ومشاريعك المفتوحة وأسعار الساعات والأرصدة، ونطابقها معك.",
      ),
      train: b(
        "Your team trains on its own projects and timesheets, and we stay with you after go-live.",
        "فريقك يتدرّب على مشاريعه وسجلات وقته الحقيقية، ونبقى معك بعد التشغيل.",
      ),
    },
    quoteWho: b("a services firm", "شركة خدمات"),
    faqHeading: b(
      "What partners, project managers and finance teams ask",
      "ما يسأله الشركاء ومدراء المشاريع وفرق المالية",
    ),
    faqs: [
      {
        question: b("Why are there no prices on the site?", "لماذا لا توجد أسعار على الموقع؟"),
        answer: b(
          "Because a small consultancy doesn't need what a firm with several teams and offices needs. After the session you get a written proposal with scope, price and timeline.",
          "لأن مكتبًا استشاريًا صغيرًا لا يحتاج ما تحتاجه شركة بعدة فرق ومكاتب. بعد الجلسة تحصل على عرض مكتوب بالنطاق والسعر والجدول.",
        ),
      },
      {
        question: b(
          "We bill fixed fees, by the hour and on retainer. One system?",
          "نفوتر بمبلغ ثابت وبالساعة وبأتعاب شهرية ثابتة، هل يكفي نظام واحد؟",
        ),
        answer: b(
          "In Odoo, billing by milestone or by timesheet hours is standard, and retainers are set up as part of your scope. In Falcon ERP we confirm the billing setup for your contracts in the blueprint. Either way, everything lands in the same accounts.",
          "في أودو، الفوترة حسب المراحل أو حسب ساعات العمل المسجّلة متاحة بشكل أساسي، والأتعاب الشهرية الثابتة نجهّزها ضمن نطاق مشروعك. وفي فالكون ERP نؤكد إعداد الفوترة لعقودك في المخطط. وفي الحالتين تصل كلها إلى الحسابات نفسها.",
        ),
      },
      FATOORA_FAQ,
      {
        question: b("Can you move our open projects and balances?", "هل تنقلون مشاريعنا المفتوحة وأرصدتنا؟"),
        answer: b(
          "Yes. Clients, open projects, budgets and balances are part of the migration plan.",
          "نعم. العملاء والمشاريع المفتوحة والميزانيات والأرصدة جزء من خطة الترحيل.",
        ),
      },
    ],
    booking: {
      heading: b(
        "One session shows you where your billable hours leak.",
        "جلسة واحدة تكفي لترى أين تتسرّب ساعاتك القابلة للفوترة.",
      ),
      body: b(
        "A consultant maps how your firm sells, delivers and bills with you, then sends a written recommendation: which system, what scope, how long.",
        "مستشار تطبيق يرسم معك كيف تبيع شركتك وتنفّذ وتفوتر، ثم يرسل لك توصية مكتوبة: أي نظام، أي نطاق، وكم من الوقت.",
      ),
    },
  }),
);
