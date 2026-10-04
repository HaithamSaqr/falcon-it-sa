/**
 * Contact page seed. Phone, WhatsApp, email and branches come from site
 * settings at render time; this block only frames them. Opening hours are
 * hidden because no hours are stored anywhere yet.
 */
import { b, demoCta } from "../fields";
import { seedPage } from "./helpers";

export const CONTACT_SEED = seedPage("contact", [
  {
    type: "contact_info",
    content: {
      heading: b("Talk to our team.", "تحدّث مع فريقنا."),
      intro: b(
        "Questions about Odoo, Falcon ERP or a project you are planning? Reach us directly, or book a demo and we will come prepared.",
        "عندك سؤال عن أودو أو فالكون ERP أو مشروع تخطط له؟ تواصل معنا مباشرة، أو احجز عرضًا تجريبيًا ونأتيك مستعدين.",
      ),
      show: {
        phone: true,
        whatsapp: true,
        email: true,
        address: true,
        hours: false,
        branches: true,
        social: false,
      },
    },
  },
  {
    type: "booking",
    content: {
      heading: b("Rather see it working?", "تفضّل أن تراه يعمل؟"),
      body: b(
        "Book a demo on your own workflow. A senior implementer takes you through it, then sends a written recommendation.",
        "احجز عرضًا تجريبيًا على دورة عملك. يعرضه عليك مستشار تطبيق خبير، ثم يرسل لك توصية مكتوبة.",
      ),
      cta: demoCta(),
      noteTitle: b("Free, no commitment.", "مجانية وبلا التزام."),
      note: b(""),
    },
  },
]);
