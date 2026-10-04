/**
 * Demo page seed. The form fields, calendar booking and API contract are fixed
 * in code; these blocks frame them. Rewritten from messages/*.json (demo).
 */
import { b } from "../fields";
import { seedPage } from "./helpers";
import { NO_PRICES_FAQ } from "./common";

export const DEMO_SEED = seedPage("demo", [
  {
    type: "demo_form",
    content: {
      heading: b("Book a demo", "احجز عرضًا تجريبيًا"),
      body: b(
        "Tell us how your business runs. A senior implementer shows you the ERP on your own processes, then sends a written recommendation: which system, what scope, how long.",
        "أخبرنا كيف يسير عملك. يعرض لك مستشار تطبيق خبير النظام على إجراءاتك أنت، ثم يرسل لك توصية مكتوبة: أي نظام، أي نطاق، وكم من الوقت.",
      ),
      submitLabel: b("Book a demo", "احجز عرضًا تجريبيًا"),
      privacyNote: b(
        "Free, no commitment. We use your details to arrange and prepare your demo, as our privacy policy explains.",
        "مجاني وبلا التزام. نستخدم بياناتك لترتيب عرضك التجريبي والتحضير له، كما توضح سياسة الخصوصية.",
      ),
    },
  },
  {
    type: "departments",
    content: {
      heading: b("What happens in the session.", "ماذا يحدث في الجلسة."),
      intro: b(""),
      items: [
        {
          icon: "Monitor",
          title: b("Your workflow, live", "دورة عملك، مباشرة"),
          line: b(
            "We show the ERP on your own processes, not a generic tour.",
            "نعرض النظام على إجراءاتك أنت، لا جولة عامة.",
          ),
        },
        {
          icon: "ListChecks",
          title: b("Your requirements", "متطلباتك"),
          line: b(
            "We go through how your team works today and what it needs.",
            "نراجع كيف يعمل فريقك اليوم وما الذي يحتاجه.",
          ),
        },
        {
          icon: "ClipboardText",
          title: b("A written recommendation", "توصية مكتوبة"),
          line: b(
            "Which system, what scope and how long, in writing after the session.",
            "أي نظام، وأي نطاق، وكم من الوقت، مكتوبة بعد الجلسة.",
          ),
        },
      ],
    },
  },
  {
    type: "faq_ref",
    content: {
      heading: b("Before you book", "قبل أن تحجز"),
      items: [
        {
          question: b("Is the demo free?", "هل العرض التجريبي مجاني؟"),
          answer: b(
            "Yes. The session is free and carries no commitment.",
            "نعم. الجلسة مجانية وبلا أي التزام.",
          ),
        },
        {
          question: b("Who will I talk to?", "مع من سأتحدث؟"),
          answer: b(
            "A senior implementer who works on Odoo and Falcon ERP projects.",
            "مستشار تطبيق خبير يعمل على مشاريع أودو وفالكون ERP.",
          ),
        },
        {
          question: b("What happens after I submit the form?", "ماذا يحدث بعد إرسال النموذج؟"),
          answer: b(
            "Our team contacts you to confirm a time and asks a few questions, so the session uses your own workflow.",
            "يتواصل معك فريقنا لتأكيد الموعد ويسألك بعض الأسئلة، لتكون الجلسة على دورة عملك أنت.",
          ),
        },
        NO_PRICES_FAQ,
      ],
    },
  },
]);
