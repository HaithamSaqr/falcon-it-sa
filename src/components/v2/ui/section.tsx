import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionTone = "page" | "surface" | "brand";

const TONES: Record<SectionTone, string> = {
  page: "bg-page text-ink",
  surface: "bg-surface text-ink",
  brand: "bg-brand text-white",
};

type SectionProps = Omit<HTMLAttributes<HTMLElement>, "className" | "children"> & {
  tone?: SectionTone;
  /** Anchor target, e.g. `book` for `#book` links. */
  id?: string;
  className?: string;
  children: ReactNode;
  as?: ElementType;
};

/**
 * Full-bleed band with the v2 vertical rhythm (112px on desktop). Put a
 * `<Container>` inside it; the brand tone is for the single booking block.
 */
export default function Section({
  tone = "page",
  id,
  className,
  children,
  as: Tag = "section",
  ...rest
}: SectionProps) {
  return (
    <Tag id={id} className={cn("scroll-mt-24 py-16 md:py-24 lg:py-28", TONES[tone], className)} {...rest}>
      {children}
    </Tag>
  );
}
