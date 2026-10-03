/**
 * Home page seed. English transcribed from the approved home artboard
 * (mockups/Main.dc.html); Arabic written to match it.
 */
import { b, demoCta, noCta } from "../fields";
import { seedPage } from "./helpers";
import { V2_SECTORS } from "./sectors";

const sector = (slug: string) => {
  const s = V2_SECTORS.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown v2 sector ${slug}`);
  return s;
};

const card = (slug: string, withPhoto = true) => {
  const s = sector(slug);
  return {
    title: s.name,
    line: s.promise,
    image: withPhoto ? s.photo : "",
    imageAlt: withPhoto ? s.photoAlt : b(""),
    href: `/sectors/${slug}`,
  };
};

const pill = (slug: string, label: { en: string; ar: string }, subtitle: { en: string; ar: string }) => {
  const s = sector(slug);
  return {
    label,
    subtitle,
    image: s.photo,
    alt: s.photoAlt,
    caption: s.name,
    href: `/sectors/${slug}`,
  };
};

export const HOME_SEED = seedPage("home", [
  {
    type: "hero",
    content: {
      title: b("One ERP for your whole company.", "نظام واحد لشركتك كلها."),
      subtitle: b(
        "Accounting, inventory, sales, projects and e-invoicing in one system, set up around how you already work.",
        "المحاسبة والمخزون والمبيعات والمشاريع والفوترة الإلكترونية في نظام واحد، مضبوط على طريقة عملك الحالية.",
      ),
      primaryCta: demoCta(),
      secondaryCta: { label: b("Talk on WhatsApp", "تحدث معنا على واتساب"), href: "https://wa.me/966568406006" },
      sectorsLabel: b("See it for", "شاهده لقطاع"),
      card: {
        image: "/images/v2/photo-hero-laptop.jpg",
        alt: b(
          "Falcon ERP sales dashboard in Arabic on a laptop, in an office overlooking Riyadh at dusk",
          "لوحة مبيعات فالكون ERP بالعربية على لابتوب، في مكتب يطل على الرياض وقت الغروب",
        ),
        caption: b("Every department, one system", "كل الأقسام، نظام واحد"),
      },
      sectorPills: [
        pill(
          "real-estate",
          b("Real estate", "العقارات"),
          b(
            "For developers, contractors and brokers: projects, units, instalments and leases in one system.",
            "للمطوّرين والمقاولين والوسطاء: المشاريع والوحدات والأقساط والإيجارات في نظام واحد.",
          ),
        ),
        pill(
          "manufacturing",
          b("Manufacturing", "التصنيع"),
          b(
            "For factories: materials, production orders and the real cost of every product in one system.",
            "للمصانع: المواد وأوامر الإنتاج والتكلفة الحقيقية لكل منتج في نظام واحد.",
          ),
        ),
        pill(
          "trading",
          b("Trading", "التجارة"),
          b(
            "For distributors: price lists, credit limits and stock across every warehouse in one system.",
            "للموزّعين: قوائم الأسعار وحدود الائتمان والمخزون في كل المستودعات في نظام واحد.",
          ),
        ),
        pill(
          "hospitality",
          b("Restaurants", "المطاعم"),
          b(
            "For restaurants: recipes, branches, POS and food cost in one system.",
            "للمطاعم: الوصفات والفروع ونقاط البيع وتكلفة الطعام في نظام واحد.",
          ),
        ),
      ],
    },
  },
  {
    type: "logo_wall",
    content: {
      heading: b(
        "Companies across Saudi Arabia and Egypt run on ERPs our team implemented",
        "شركات في السعودية ومصر تعمل على أنظمة ERP طبّقها فريقنا",
      ),
      intro: b(""),
      limit: 8,
      link: noCta(),
    },
  },
  {
    type: "departments",
    content: {
      heading: b("One system. Every department.", "نظام واحد. كل الأقسام."),
      intro: b(
        "Stop copying numbers between Excel, WhatsApp and three different programs.",
        "توقّف عن نقل الأرقام بين Excel وواتساب وثلاثة برامج مختلفة.",
      ),
      items: [
        {
          icon: "Calculator",
          title: b("Accounting & e-invoicing", "المحاسبة والفوترة الإلكترونية"),
          line: b("Month-end in days, with Fatoora e-invoicing connected.", "إقفال الشهر في أيام، مع الربط بمنصة فاتورة."),
        },
        {
          icon: "Package",
          title: b("Inventory & warehouses", "المخزون والمستودعات"),
          line: b("One stock number every branch trusts.", "رقم مخزون واحد تثق به كل الفروع."),
        },
        {
          icon: "Handshake",
          title: b("Sales & CRM", "المبيعات وإدارة العملاء"),
          line: b("Every lead, quote and invoice in one pipeline.", "كل عميل محتمل وعرض سعر وفاتورة في مسار واحد."),
        },
        {
          icon: "ShoppingCart",
          title: b("Purchasing", "المشتريات"),
          line: b("Requests, approvals and supplier bills that match.", "طلبات واعتمادات وفواتير موردين متطابقة."),
        },
        {
          icon: "Kanban",
          title: b("Projects", "المشاريع"),
          line: b("Cost and progress per project, every day.", "تكلفة كل مشروع وتقدّمه، يومًا بيوم."),
        },
        {
          icon: "UsersThree",
          title: b("HR & payroll", "الموارد البشرية والرواتب"),
          line: b("Attendance and payroll charged where they belong.", "الحضور والرواتب محمّلة على مكانها الصحيح."),
        },
        {
          icon: "Factory",
          title: b("Manufacturing", "التصنيع"),
          line: b("Real cost per product, from raw material up.", "التكلفة الحقيقية لكل منتج، بدءًا من المادة الخام."),
        },
        {
          icon: "ChartBar",
          title: b("Reports & dashboards", "التقارير ولوحات المتابعة"),
          line: b("The numbers you need, every morning, on your phone.", "الأرقام التي تحتاجها، كل صباح، على جوالك."),
        },
      ],
    },
  },
  {
    type: "sector_grid",
    content: {
      heading: b("The same ERP, set up for your sector.", "نفس النظام، مضبوط لقطاعك."),
      intro: b(
        "Pick yours to see the problems we solve and how the system is configured for them.",
        "اختر قطاعك لترى المشكلات التي نحلّها، وكيف نضبط النظام لها.",
      ),
      cards: [
        card("real-estate"),
        card("manufacturing"),
        card("trading"),
        card("hospitality"),
        card("retail"),
        card("logistics"),
        card("professional-services", false),
      ],
      otherCard: {
        title: b("Don't see your sector?", "لا ترى قطاعك؟"),
        line: b(
          "Tell us how your business runs. We'll show you the ERP set up for it.",
          "أخبرنا كيف يسير عملك، وسنريك النظام مضبوطًا عليه.",
        ),
        ctaLabel: demoCta().label,
        href: "/demo",
      },
    },
  },
  {
    type: "setup_list",
    content: {
      heading: b("An ERP is only as good as its setup.", "قوة النظام في إعداده."),
      intro: b(
        "Most ERP projects fail on configuration, data and training, not software. That is the part we do.",
        "معظم مشاريع ERP تتعثر في الإعداد والبيانات والتدريب، لا في البرنامج نفسه. وهذا بالضبط ما نتولّاه.",
      ),
      points: [
        {
          problem: b("Month-end still takes weeks", "إقفال الشهر ما زال يأخذ أسابيع"),
          fix: b(
            "We configure closing around how your accounts actually work.",
            "نضبط الإقفال على طريقة عمل حساباتك فعلًا.",
          ),
        },
        {
          problem: b("Nobody trusts the stock count", "لا أحد يثق برقم المخزون"),
          fix: b(
            "We connect warehouses, branches and sales into one flow.",
            "نربط المستودعات والفروع والمبيعات في دورة واحدة.",
          ),
        },
        {
          problem: b("The team went back to Excel", "الفريق رجع إلى Excel"),
          fix: b("We train on your own data, weeks before go-live.", "ندرّب فريقك على بياناتك أنت، قبل التشغيل بأسابيع."),
        },
      ],
      link: { label: b("How we set it up", "كيف نُعدّ النظام"), href: "/#how" },
    },
  },
  {
    type: "erp_compare",
    content: {
      heading: b("Two ERPs. One honest recommendation.", "نظامان. توصية صريحة واحدة."),
      intro: b(
        "We implement Odoo and our own Falcon ERP, so we recommend the one that fits you, not the one we sell.",
        "نطبّق أودو ونظامنا فالكون ERP، لذلك نرشّح لك ما يناسبك، لا ما نريد بيعه.",
      ),
      odoo: {
        logo: "/images/v2/logo-odoo.png",
        logoAlt: b("Odoo", "أودو"),
        title: b("The global ERP, set up for you", "النظام العالمي، مضبوط لك"),
        body: b(""),
        chips: [
          b("Accounting", "المحاسبة"),
          b("Inventory", "المخزون"),
          b("CRM", "CRM"),
          b("Manufacturing", "التصنيع"),
          b("eCommerce", "المتجر الإلكتروني"),
          b("HR", "الموارد البشرية"),
        ],
        points: [
          b("Many connected apps in one system", "تطبيقات كثيرة مترابطة في نظام واحد"),
          b("Add modules as you grow", "أضف الوحدات مع نمو عملك"),
          b("Custom features our developers build", "مزايا خاصة يبنيها مطوّرونا"),
        ],
        link: { label: b("Our Odoo services", "خدماتنا في أودو"), href: "/erp/odoo" },
      },
      falcon: {
        logo: "/images/v2/logo-falcon-erp.png",
        logoAlt: b("Falcon ERP", "فالكون ERP"),
        title: b("Our own ERP, built in-house", "نظامنا الخاص، طوّرناه بأنفسنا"),
        body: b(""),
        chips: [
          b("Accounting", "المحاسبة"),
          b("Inventory", "المخزون"),
          b("Projects", "المشاريع"),
          b("Real estate", "العقارات"),
          b("POS", "نقاط البيع"),
          b("HR", "الموارد البشرية"),
        ],
        points: [
          b("On your own servers, inside your network", "على سيرفراتك، داخل شبكتك"),
          b("Arabic-first, quick for accountants to learn", "عربي أولًا، وسريع التعلّم على المحاسبين"),
          b("Desktop, Cloud in the browser, or hybrid", "سطح المكتب، أو كلاود من المتصفح، أو الاثنان معًا"),
        ],
        link: { label: b("Explore Falcon ERP", "اكتشف فالكون ERP"), href: "/erp/falcon" },
      },
    },
  },
  {
    type: "process",
    content: {
      heading: b("From first call to a live ERP, one team.", "من أول اتصال إلى نظام يعمل، فريق واحد."),
      intro: b(""),
      steps: [
        {
          title: b("Assess", "التقييم"),
          description: b(
            "A demo on your own workflow, and where it leaks today.",
            "عرض على دورة عملك أنت، وأين تتسرّب الأرقام اليوم.",
          ),
          duration: b("1 day", "يوم واحد"),
        },
        {
          title: b("Blueprint", "المخطط"),
          description: b(
            "A written scope and timeline, agreed before we build.",
            "نطاق مكتوب وجدول زمني، نتفق عليهما قبل أن نبدأ البناء.",
          ),
          duration: b("1 to 2 weeks", "من أسبوع إلى أسبوعين"),
        },
        {
          title: b("Build", "البناء"),
          description: b(
            "Configure, develop what's missing, migrate your data.",
            "نضبط النظام، ونطوّر ما ينقصه، وننقل بياناتك.",
          ),
          duration: b("4 to 8 weeks", "من 4 إلى 8 أسابيع"),
        },
        {
          title: b("Train", "التدريب"),
          description: b(
            "Your team practises on its own data before switching.",
            "فريقك يتدرّب على بياناته قبل الانتقال.",
          ),
          duration: b("1 to 2 weeks", "من أسبوع إلى أسبوعين"),
        },
        {
          title: b("Support", "الدعم"),
          description: b(
            "We stay after go-live for fixes, modules and branches.",
            "نبقى معك بعد التشغيل للإصلاحات والوحدات الجديدة والفروع.",
          ),
          duration: b("Ongoing", "مستمر"),
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
        "[One real sentence from a client about a specific result, approved by them.]",
        "[جملة واحدة حقيقية من عميل عن نتيجة محددة، بعد موافقته.]",
      ),
      name: b("[Name]", "[الاسم]"),
      role: b("[Role]", "[المنصب]"),
      company: b("[Company]", "[الشركة]"),
      logo: "",
      logoAlt: b(""),
    },
  },
  {
    type: "booking",
    content: {
      heading: b("See your own workflow running in the ERP.", "شاهد دورتك تعمل داخل النظام."),
      body: b(
        "In one session, a senior implementer shows you the ERP on your processes, then sends a written recommendation: which system, what scope, how long.",
        "في جلسة واحدة، يعرض لك مستشار تطبيق خبير النظام على إجراءاتك، ثم يرسل لك توصية مكتوبة: أي نظام، أي نطاق، وكم من الوقت.",
      ),
      cta: demoCta(),
      noteTitle: b("Why no prices here?", "لماذا لا توجد أسعار هنا؟"),
      note: b(
        "A 20-user distributor and a 3-project developer need different ERPs. Your proposal comes in writing after the demo.",
        "موزّع بعشرين مستخدمًا ومطوّر بثلاثة مشاريع يحتاجان نظامين مختلفين. عرضك يصلك مكتوبًا بعد العرض التجريبي.",
      ),
    },
  },
]);
