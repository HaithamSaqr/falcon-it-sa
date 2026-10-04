/** Terms page seed. Rewritten from messages/*.json (legal.terms*) in the v2 voice. */
import { b } from "../fields";
import { seedPage } from "./helpers";

export const TERMS_SEED = seedPage("terms", [
  {
    type: "rich_text",
    content: {
      heading: b("Terms and conditions", "الشروط والأحكام"),
      paragraphs: [
        b(
          "These terms govern your use of the Falcon Smart Solutions website. By using the site, you agree to them.",
          "تحكم هذه الشروط استخدامك لموقع فالكون للحلول الذكية، وباستخدامك للموقع فإنك توافق عليها.",
        ),
        b(
          "**Use of the website.** The site gives information about our ERP services and lets you contact us or book a demo. Use it lawfully, and do not interfere with its operation or security.",
          "**استخدام الموقع.** يقدّم الموقع معلومات عن خدماتنا في أنظمة ERP، ويتيح لك التواصل معنا أو حجز عرض تجريبي. استخدمه بشكل نظامي، ولا تتدخل في تشغيله أو أمنه.",
        ),
        b(
          "**Intellectual property.** The content on this site, including text, graphics, logos and software, belongs to Falcon Smart Solutions or its licensors. Do not reproduce, distribute or adapt it without our written consent.",
          "**الملكية الفكرية.** محتوى هذا الموقع، بما فيه النصوص والرسومات والشعارات والبرمجيات، مملوك لفالكون للحلول الذكية أو للجهات المرخِّصة لها. لا يجوز نسخه أو توزيعه أو تعديله دون موافقتنا الكتابية.",
        ),
        b(
          "**Third-party names and logos.** Odoo is a trademark of Odoo S.A. Client logos are shown with their owners' approval.",
          "**أسماء وشعارات الغير.** Odoo علامة تجارية مملوكة لشركة Odoo S.A. وتُعرض شعارات العملاء بموافقة أصحابها.",
        ),
        b(
          "**Information on this site.** We describe our services as accurately as we can, but the site is provided as is. Scope, price and timeline are agreed in writing in your proposal.",
          "**المعلومات على الموقع.** نصف خدماتنا بأدق ما نستطيع، لكن الموقع مقدَّم كما هو. ويُتفق على النطاق والسعر والجدول الزمني كتابيًا في عرضك.",
        ),
        b(
          "**Limitation of liability.** We are not liable for indirect, incidental or consequential damage arising from your use of the website.",
          "**حدود المسؤولية.** لا نتحمّل مسؤولية أي أضرار غير مباشرة أو عرضية أو تبعية تنشأ عن استخدامك للموقع.",
        ),
        b(
          "**Privacy.** How we handle personal data is described in our website privacy policy.",
          "**الخصوصية.** نوضّح طريقة تعاملنا مع البيانات الشخصية في سياسة خصوصية الموقع.",
        ),
        b(
          "**Contact.** Falcon Smart Solutions, unified national number 7049432656. Email: info@falcon-v.com.",
          "**التواصل.** فالكون للحلول الذكية، الرقم الوطني الموحد 7049432656. البريد الإلكتروني: info@falcon-v.com.",
        ),
      ],
    },
  },
]);
