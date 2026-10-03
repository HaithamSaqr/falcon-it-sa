/**
 * About page seed. Rewritten from messages/*.json (about) in the v2 voice.
 * The old stats (clients, years, users) are left out until confirmed.
 */
import { b, demoCta } from "../fields";
import { seedPage } from "./helpers";
import { clientsWall, generalBookingBlock, processBlock } from "./common";

export const ABOUT_SEED = seedPage("about", [
  {
    type: "hero",
    content: {
      title: b("An ERP team that builds its own ERP.", "فريق ERP يطوّر نظامه الخاص."),
      subtitle: b(
        "Falcon Smart Solutions implements Odoo and develops Falcon ERP for companies in Saudi Arabia and Egypt. We recommend the system that fits you, then set it up, move your data, train your team and stay after go-live.",
        "فالكون للحلول الذكية تطبّق أودو وتطوّر فالكون ERP للشركات في السعودية ومصر. نرشّح لك النظام المناسب، ثم نجهّزه وننقل بياناتك وندرّب فريقك ونبقى معك بعد التشغيل.",
      ),
      primaryCta: demoCta(),
      secondaryCta: { label: b("Contact us", "تواصل معنا"), href: "/contact" },
      sectorsLabel: b(""),
      card: {
        image: "/images/v2/photo-hero-office.jpg",
        alt: b(
          "Falcon ERP sales dashboard on an office monitor, Riyadh skyline behind",
          "لوحة مبيعات فالكون ERP على شاشة مكتب، وخلفها أفق الرياض",
        ),
        caption: b(""),
      },
      sectorPills: [],
    },
  },
  {
    type: "departments",
    content: {
      heading: b("What we stand for.", "ما نلتزم به."),
      intro: b(""),
      items: [
        {
          icon: "Handshake",
          title: b("An honest recommendation", "توصية صريحة"),
          line: b(
            "We implement Odoo and our own Falcon ERP, so we recommend the one that fits you, not the one we sell.",
            "نطبّق أودو ونظامنا فالكون ERP، لذلك نرشّح لك ما يناسبك، لا ما نريد بيعه.",
          ),
        },
        {
          icon: "Translate",
          title: b("Arabic first", "العربية أولًا"),
          line: b(
            "Screens, reports and training designed for Arabic-speaking teams.",
            "شاشات وتقارير وتدريب مصمّمة لفرق تعمل بالعربية.",
          ),
        },
        {
          icon: "Receipt",
          title: b("Saudi requirements built in", "المتطلبات السعودية من الأساس"),
          line: b(
            "Fatoora e-invoicing and VAT set up as part of every implementation.",
            "الفوترة الإلكترونية عبر فاتورة وضريبة القيمة المضافة جزء من كل تطبيق.",
          ),
        },
        {
          icon: "ShieldCheck",
          title: b("Your data, your choice", "بياناتك، وقرارك"),
          line: b(
            "On your own servers or in the cloud. You decide where your data lives.",
            "على سيرفراتك أو في السحابة، وأنت من يقرر أين تُحفظ بياناتك.",
          ),
        },
      ],
    },
  },
  processBlock(),
  clientsWall(),
  generalBookingBlock(),
]);
