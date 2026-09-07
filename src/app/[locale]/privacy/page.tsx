import Container from "@/components/ui/container";

const sectionHeading = "mt-10 text-2xl font-bold text-text-primary";
const paragraph = "mt-4 leading-8 text-text-secondary";

export default function PrivacyPage() {
  return (
    <section className="bg-surface py-16 sm:py-20 lg:py-24">
      <Container>
        <article className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10 lg:p-14">
          <section lang="ar" dir="rtl" className="text-right">
            <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
              سياسة الخصوصية
            </h1>
            <p className="mt-3 font-semibold text-primary" dir="ltr">Falcon Valley</p>
            <p className={paragraph}>آخر تحديث: ٧ سبتمبر ٢٠٢٦</p>
            <p className={paragraph}>
              توضح هذه السياسة كيفية التعامل مع البيانات عند استخدام تطبيق فالكون فالي للوصول إلى أنظمة إدارة الأعمال الخاصة بمؤسستك. تختلف البيانات المتاحة بحسب الخادم الذي تختاره وصلاحيات حسابك والخدمات التي تستخدمها.
            </p>

            <h2 className={sectionHeading}>البيانات التي يعالجها التطبيق</h2>
            <ul className="mt-4 list-disc space-y-3 pr-6 leading-8 text-text-secondary">
              <li>بيانات الاتصال بالخادم والحساب، مثل اسم المستخدم والاسم والبريد الإلكتروني ورقم الهاتف والصورة الشخصية عند توفيرها.</li>
              <li>بيانات العمل التي تعرضها أو تدخلها، مثل العملاء والفواتير والمخزون والمشاريع والمهام وطلبات الموظفين والحضور وكشوف الرواتب. تُرسل العمليات ذات الصلة إلى خادم المؤسسة المحدد في التطبيق.</li>
              <li>موقع الجهاز عند منح الإذن واستخدام ميزات تعتمد عليه، مثل تحديد موقع العمل والتحقق من الحضور.</li>
              <li>الصور والملفات وبيانات الكاميرا عند استخدام المرفقات أو مسح الباركود. وقد تتطلب الخدمات المضمنة أذونات إضافية، مثل الميكروفون، بحسب الوظيفة التي تختارها.</li>
              <li>معرّفات الجهاز أو تثبيت التطبيق ورموز الإشعارات والبيانات التقنية التي تعالجها خدمات الطرف الثالث المستخدمة في التطبيق.</li>
            </ul>

            <h2 className={sectionHeading}>أغراض الاستخدام</h2>
            <p className={paragraph}>
              تستخدم البيانات لتسجيل الدخول، وتنفيذ العمليات التي تطلبها، وعرض بيانات مؤسستك، وتشغيل الإشعارات والميزات المرتبطة بالموقع والمرفقات، ومعالجة مشكلات التشغيل. قد يحتفظ التطبيق محليًا بإعدادات الاتصال والجلسة والتفضيلات لتسهيل الاستخدام.
            </p>

            <h2 className={sectionHeading}>الخوادم والأطراف الثالثة</h2>
            <p className={paragraph}>
              تعالج مؤسستك ومشغّل الخادم الذي تتصل به بيانات أعمالك وفق إعداداتهما وسياساتهما. يتضمن التطبيق خدمات جوجل للإشعارات والإعلانات؛ وقد تعالج هذه الخدمات معرّفات الجهاز وعنوان الإنترنت والبيانات التقنية والتفاعلات وفق إعداداتها وسياسات جوجل. تتأثر إتاحة الإعلانات بإعدادات التطبيق والخدمة. وقد تُنقل البيانات إلى خوادم خارج بلدك.
            </p>
            <p className={paragraph}><a className="font-semibold text-primary underline underline-offset-4" href="https://policies.google.com/privacy">سياسة خصوصية جوجل</a></p>

            <h2 className={sectionHeading}>الأذونات وخياراتك</h2>
            <p className={paragraph}>
              يمكنك إدارة أذونات الموقع والكاميرا والملفات والميكروفون والإشعارات من إعدادات جهازك. قد لا تعمل الميزة المرتبطة بإذن مرفوض. استخدم خادمًا تثق به، ولا تشارك بيانات الدخول مع الآخرين.
            </p>

            <h2 className={sectionHeading}>الاحتفاظ بالبيانات وحذفها</h2>
            <p className={paragraph}>
              تحدد مؤسستك ومشغّل الخادم مدة الاحتفاظ بسجلات العمل وفق متطلباتهما والالتزامات النظامية. حذف التطبيق أو بياناته المحلية لا يحذف السجلات الموجودة على خادم المؤسسة. لطلب الوصول إلى بياناتك أو تصحيحها أو حذفها، تواصل مع مسؤول نظام مؤسستك أو معنا عبر البريد أدناه؛ وقد يلزم التحقق من هويتك وتحديد المؤسسة أو الخادم المعني، وقد تخضع بعض السجلات لمتطلبات احتفاظ إلزامية.
            </p>

            <h2 className={sectionHeading}>الأطفال</h2>
            <p className={paragraph}>
              التطبيق مخصص لاستخدام الأعمال وحسابات المؤسسات، وليس موجّهًا للأطفال. إذا أُرسلت بيانات طفل دون تفويض، يرجى التواصل معنا لبحث إزالتها مع الجهة المسؤولة عن البيانات.
            </p>

            <h2 className={sectionHeading}>التحديثات والتواصل</h2>
            <p className={paragraph}>
              قد تُحدّث هذه السياسة عند تغير ميزات التطبيق أو ممارسات معالجة البيانات، ويُذكر تاريخ التحديث أعلى الصفحة. للاستفسارات وطلبات الخصوصية:
            </p>
            <p className={paragraph} dir="ltr">
              <a className="text-primary underline underline-offset-4" href="mailto:info@falcon-v.com">info@falcon-v.com</a><br />
              <a className="text-primary underline underline-offset-4" href="https://www.falcon-v.com/">www.falcon-v.com</a>
            </p>
          </section>

          <section lang="en" dir="ltr" className="mt-14 border-t border-slate-200 pt-10 text-left">
            <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">Privacy Policy — Falcon Valley</h1>
            <p className={paragraph}>Last updated: September 7, 2026</p>
            <p className={paragraph}>
              Falcon Valley connects to your organization&apos;s business systems. Available information depends on your selected server, account permissions, and the features you use.
            </p>

            <h2 className={sectionHeading}>Information processed</h2>
            <p className={paragraph}>
              The app processes server and account details; names, email addresses, phone numbers and profile images when provided; and business records such as customers, invoices, inventory, projects, tasks, employee requests, attendance and payroll. Related actions are sent to your selected organization server. The app may store connection details, session information and preferences locally.
            </p>
            <p className={paragraph}>
              When you grant permission and use the corresponding feature, the app may access your location for workplace and attendance functions, camera data for barcode scanning, and selected images or files for attachments. Embedded services may request additional permissions, such as microphone access, depending on the feature you use.
            </p>

            <h2 className={sectionHeading}>Use and service providers</h2>
            <p className={paragraph}>
              Information supports authentication, requested business operations, notifications and app features. Your organization and selected server operator process business records under their own settings and policies. The app includes Google notification and advertising services, which may process device or installation identifiers, notification tokens, IP addresses, technical information and interactions under Google&apos;s policies and service configuration. Advertising availability depends on app and service settings. Data may be processed outside your country.
            </p>
            <p className={paragraph}><a className="font-semibold text-primary underline underline-offset-4" href="https://policies.google.com/privacy">Google Privacy Policy</a></p>

            <h2 className={sectionHeading}>Your choices, retention and deletion</h2>
            <p className={paragraph}>
              You can manage location, camera, files, microphone and notification permissions in device settings. Declining a permission may prevent the corresponding feature from working. Connect only to a server you trust.
            </p>
            <p className={paragraph}>
              Your organization and server operator determine business-record retention according to their requirements and applicable obligations. Removing the app or local app data does not delete server records. Contact your organization administrator or the address below to request access, correction or deletion. We may need to verify your identity and identify the relevant organization or server. Some records may be subject to mandatory retention.
            </p>

            <h2 className={sectionHeading}>Children and changes</h2>
            <p className={paragraph}>
              This business app is intended for organizational accounts, not children. Contact us about any unauthorized child data so that removal can be addressed with the responsible data operator. This policy may change as features or processing practices change; its update date appears above.
            </p>

            <h2 className={sectionHeading}>Contact</h2>
            <p className={paragraph}>
              <a className="text-primary underline underline-offset-4" href="mailto:info@falcon-v.com">info@falcon-v.com</a><br />
              <a className="text-primary underline underline-offset-4" href="https://www.falcon-v.com/">www.falcon-v.com</a>
            </p>
          </section>
        </article>
      </Container>
    </section>
  );
}
