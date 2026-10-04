"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
 * Once hydrated it also carries the query string and hash, so
 * `/demo?sector=retail&role=owner` becomes `/ar/demo?sector=retail&role=owner`.
 */
export default function LanguageToggle(props: LanguageToggleProps) {
  // useSearchParams needs a Suspense boundary; the fallback is the plain path link.
  return (
    <Suspense fallback={<ToggleLink {...props} />}>
      <WithQuery {...props} />
    </Suspense>
  );
}

function WithQuery(props: LanguageToggleProps) {
  const params = useSearchParams();
  const hash = useHash();
  // Repeated keys become arrays so they all survive the switch.
  const query: Record<string, string | string[]> = {};
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key);
    query[key] = all.length === 1 ? all[0] : all;
  }
  return <ToggleLink {...props} query={query} hash={hash} />;
}

/** The current URL hash ("" on the server and before hydration); follows hashchange. */
function useHash(): string {
  const [hash, setHash] = useState("");
  const pathname = usePathname();
  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [pathname]);
  return hash;
}

function ToggleLink({
  className,
  onClick,
  query,
  hash,
}: LanguageToggleProps & { query?: Record<string, string | string[]>; hash?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const target = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={{ pathname, query: query && Object.keys(query).length > 0 ? query : undefined, hash: hash || undefined }}
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
