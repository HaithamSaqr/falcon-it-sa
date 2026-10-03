import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// The demo page is a client component and cannot export metadata, so its
// metadata lives in this pass-through layout.
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    page: "demo",
    path: "/demo",
    locale,
    fallbackTitle: { en: "Book a demo", ar: "احجز عرضًا تجريبيًا" },
    fallbackDescription: {
      en: "See the ERP running on your own processes. Free, no commitment.",
      ar: "شاهد النظام يعمل على إجراءاتك أنت. مجاني وبلا التزام.",
    },
  });
}

export default function DemoLayout({ children }: Pick<Props, "children">) {
  return children;
}
