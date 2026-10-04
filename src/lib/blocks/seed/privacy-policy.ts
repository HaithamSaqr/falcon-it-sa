/**
 * Website privacy policy for falcon-it.sa (owner answer 2026-10-03: the
 * Falcon Valley app policy stays at /privacy; this one lives at
 * /privacy-policy). Factual description of what the site does; not legal advice.
 * Owner decisions 2026-10-04: lead and contact data kept one year from the last
 * contact; the Snap Pixel loads only after consent in the cookie banner.
 */
import { b } from "../fields";
import { seedPage } from "./helpers";

export const PRIVACY_POLICY_SEED = seedPage("privacy-policy", [
  {
    type: "rich_text",
    content: {
      heading: b("Website privacy policy", "سياسة خصوصية الموقع"),
      paragraphs: [
        b("Last updated: 4 October 2026", "آخر تحديث: 4 أكتوبر 2026"),
        b(
          "This policy explains how Falcon Smart Solutions (unified national number 7049432656) handles personal data collected through falcon-it.sa. It covers this website only; the Falcon Valley app has its own policy at /privacy.",
          "توضح هذه السياسة كيف تتعامل فالكون للحلول الذكية (الرقم الوطني الموحد 7049432656) مع البيانات الشخصية التي تُجمع عبر موقع falcon-it.sa. وهي تخص هذا الموقع فقط؛ ولتطبيق Falcon Valley سياسة خاصة به على الرابط /privacy.",
        ),
        b(
          "**What we collect.** When you fill in a form on this site (demo booking, contact or newsletter), we collect what you enter: your name, company, email, phone or WhatsApp number, sector, role and message, and any other details the form asks for, such as country or company size. We also record technical data such as your IP address, the page and language you used, the page that referred you, and any campaign (UTM) parameters in the link you followed.",
          "**ما نجمعه.** عندما تعبّئ نموذجًا على الموقع (حجز عرض تجريبي أو تواصل أو نشرة بريدية)، نجمع ما تدخله: اسمك وشركتك وبريدك الإلكتروني ورقم جوالك أو واتساب والقطاع والدور والرسالة، وأي بيانات أخرى يطلبها النموذج مثل الدولة أو حجم الشركة. كما نسجّل بيانات تقنية مثل عنوان IP، والصفحة واللغة التي استخدمتها، والصفحة التي أحالتك إلينا، وأي معاملات حملات تسويقية (UTM) في الرابط الذي فتحته.",
        ),
        b(
          "**Why we use it.** To reply to you, to schedule and prepare your demo, and to manage our relationship with you. Form submissions are stored in this website's database and in our CRM (Odoo), which Falcon operates. If you book a demo, we create a calendar appointment for it.",
          "**لماذا نستخدمها.** للرد عليك، ولجدولة عرضك التجريبي والتحضير له، ولإدارة علاقتنا معك. تُحفظ النماذج في قاعدة بيانات الموقع وفي نظام إدارة علاقات العملاء لدينا (أودو) الذي تشغّله فالكون. وإذا حجزت عرضًا تجريبيًا، ننشئ له موعدًا في التقويم.",
        ),
        b(
          "**Cookies and tracking.** We use Google Tag Manager, Google Analytics 4 and Google Ads to measure visits and the results of our advertising. These tools may set cookies and receive data such as your IP address, device and the pages you view. The Snap Pixel, which measures our Snapchat advertising, loads only after you accept it in the cookie banner; if you decline, it does not load. We remember your choice in a cookie on this site for 12 months, and you can change it at any time through Cookie settings at the bottom of the page. You can also block or delete cookies in your browser settings.",
          "**ملفات تعريف الارتباط والتتبّع.** نستخدم Google Tag Manager وGoogle Analytics 4 وGoogle Ads لقياس الزيارات ونتائج إعلاناتنا. قد تضع هذه الأدوات ملفات تعريف ارتباط وتستقبل بيانات مثل عنوان IP والجهاز والصفحات التي تشاهدها. أما Snap Pixel، الذي يقيس إعلاناتنا على سناب شات، فلا يُحمَّل إلا بعد موافقتك عليه في شريط ملفات تعريف الارتباط، وإذا رفضت فلن يُحمَّل. نحفظ اختيارك في ملف تعريف ارتباط خاص بهذا الموقع لمدة 12 شهرًا، ويمكنك تغييره في أي وقت من رابط إعدادات ملفات تعريف الارتباط أسفل الصفحة. ويمكنك أيضًا حظر ملفات تعريف الارتباط أو حذفها من إعدادات متصفحك.",
        ),
        b(
          "**Who we share it with.** We do not sell your personal data. We share it only with service providers that process it for us, such as Resend, which sends our emails, our hosting provider and the analytics and advertising tools listed above, or where the law requires it.",
          "**مع من نشاركها.** لا نبيع بياناتك الشخصية. نشاركها فقط مع مقدّمي خدمات يعالجونها نيابة عنا، مثل Resend الذي يرسل رسائلنا الإلكترونية، ومزوّد الاستضافة، وأدوات التحليل والإعلان المذكورة أعلاه، أو حين يُلزمنا النظام بذلك.",
        ),
        b(
          "**How long we keep it.** We keep lead and contact data, such as demo bookings, enquiries and newsletter sign-ups, for one year from the last contact with you, then delete or anonymise it, unless a contract or the law requires us to keep it longer.",
          "**مدة الاحتفاظ.** نحتفظ ببيانات الطلبات والتواصل، مثل حجوزات العروض التجريبية والاستفسارات والاشتراك في النشرة البريدية، لمدة سنة واحدة من آخر تواصل معك، ثم نحذفها أو نُخفي هويتها، ما لم يُلزمنا عقد أو نظام بالاحتفاظ بها مدة أطول.",
        ),
        b(
          "**How we protect it.** Access to submissions is limited to our team, and we apply technical and organisational measures suited to the data.",
          "**كيف نحميها.** يقتصر الوصول إلى النماذج على فريقنا، ونطبّق تدابير تقنية وتنظيمية تناسب طبيعة البيانات.",
        ),
        b(
          "**Your rights.** Under the Saudi Personal Data Protection Law (PDPL), you can ask to be told how we process your data, to access it, to have it corrected, to have it destroyed when it is no longer needed, and to withdraw your consent. To use these rights, email us at info@falcon-v.com. If you are not satisfied with our reply, you can complain to the Saudi Data and AI Authority (SDAIA).",
          "**حقوقك.** بموجب نظام حماية البيانات الشخصية في المملكة العربية السعودية، يحق لك أن تعرف كيف نعالج بياناتك، وأن تطّلع عليها، وأن تطلب تصحيحها، وأن تطلب إتلافها حين لا تعود هناك حاجة إليها، وأن تسحب موافقتك. لممارسة هذه الحقوق، راسلنا على info@falcon-v.com. وإن لم يرضك ردّنا، يمكنك تقديم شكوى إلى الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).",
        ),
        b(
          "**Changes.** If we change this policy, we update it on this page and change the date above.",
          "**التعديلات.** إذا عدّلنا هذه السياسة، نحدّثها في هذه الصفحة ونغيّر التاريخ أعلاه.",
        ),
        b(
          "**Contact.** Falcon Smart Solutions, unified national number 7049432656. Email: info@falcon-v.com.",
          "**التواصل.** فالكون للحلول الذكية، الرقم الوطني الموحد 7049432656. البريد الإلكتروني: info@falcon-v.com.",
        ),
      ],
    },
  },
]);
