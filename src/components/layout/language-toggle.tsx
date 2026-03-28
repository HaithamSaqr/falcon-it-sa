"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className }: LanguageToggleProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const isArabic = locale === "ar";
  const label = isArabic ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064A\u0629";

  function handleToggle() {
    router.replace(pathname, { locale: isArabic ? "en" : "ar" });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isArabic ? "Switch to English" : "\u0627\u0644\u062A\u0628\u062F\u064A\u0644 \u0625\u0644\u0649 \u0627\u0644\u0639\u0631\u0628\u064A\u0629"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
        "text-sm font-medium text-text-secondary",
        "transition-colors duration-200",
        "hover:bg-primary-50 hover:text-primary-500",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
        "cursor-pointer select-none",
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M7.171 4.146l1.947 4.5a.75.75 0 01-1.376.596L7.05 7.75H4.95l-.692 1.492a.75.75 0 11-1.376-.596l1.947-4.5a.75.75 0 011.342 0zM6 5.588L5.28 7.25h1.44L6 5.588zM14.846 5.602a.75.75 0 01.528.918l-.003.012a5.773 5.773 0 01-.396 1.078 6.28 6.28 0 01-.738 1.11c.3.252.627.476.977.67a.75.75 0 11-.73 1.31 7.771 7.771 0 01-1.2-.846 7.768 7.768 0 01-1.2.845.75.75 0 01-.73-1.31c.35-.193.676-.417.977-.669a6.283 6.283 0 01-.738-1.11 5.774 5.774 0 01-.396-1.078l-.003-.012a.75.75 0 011.446-.39l.003.009a4.268 4.268 0 00.289.747c.207.39.469.743.782 1.053a4.776 4.776 0 00.782-1.053 4.27 4.27 0 00.29-.747l.002-.01a.75.75 0 01.918-.527z"
          clipRule="evenodd"
        />
        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM1.5 10a8.5 8.5 0 1117 0 8.5 8.5 0 01-17 0z" />
      </svg>
      {label}
    </button>
  );
}
