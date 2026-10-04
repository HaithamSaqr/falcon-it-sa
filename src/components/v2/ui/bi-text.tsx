import type { ElementType } from "react";
import { getLocale } from "next-intl/server";
import { pickBi, type Bi } from "@/lib/blocks/bi";

/** Plain helper for places that already know the locale (attributes, metadata, checks). */
export function biText(value: Bi | null | undefined, locale: string): string {
  return pickBi(value, locale === "ar" ? "ar" : "en");
}

type BiTextProps = {
  value: Bi | null | undefined;
  /** Optional wrapper element; without it only the text node is rendered. */
  as?: ElementType;
  className?: string;
};

/**
 * Renders the request-locale side of a bilingual value, falling back to the
 * other language when it is empty. Renders nothing when both are empty.
 */
export default async function BiText({ value, as: Tag, className }: BiTextProps) {
  const text = biText(value, await getLocale());
  if (!text) return null;
  if (Tag) return <Tag className={className}>{text}</Tag>;
  return <>{text}</>;
}
