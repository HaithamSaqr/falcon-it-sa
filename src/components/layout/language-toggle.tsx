"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  onClick?: () => void;
}

/**
 * Plain link to the same page in the other language (works without
 * JavaScript): `/sectors/real-estate` and `/ar/sectors/real-estate`.
 * The label is written in the target language and tagged with its `lang`.
 */
export default function LanguageToggle({ className, onClick }: LanguageToggleProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const target = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={pathname}
      locale={target}
      lang={target}
      hrefLang={target}
      onClick={onClick}
      className={cn(
        "inline-flex items-center text-[15px] leading-none text-ink no-underline transition-colors duration-200 hover:text-brand",
        "rounded-full outline-brand focus-visible:outline-3 focus-visible:outline-offset-3",
        target === "ar" ? "font-arabic" : "font-sans font-semibold",
        className,
      )}
    >
      {target === "ar" ? "العربية" : "English"}
    </Link>
  );
}
