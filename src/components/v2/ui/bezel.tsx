import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BezelRadius = 32 | 26;
export type BezelTone = "tint" | "card" | "glass";

// Static class names so Tailwind can see them. Inner radius is outer minus 7.
const RADII: Record<BezelRadius, { outer: string; inner: string }> = {
  32: { outer: "rounded-[32px]", inner: "rounded-[25px]" },
  26: { outer: "rounded-[26px]", inner: "rounded-[19px]" },
};

const SHELLS: Record<BezelTone, string> = {
  tint: "bg-ink/[0.035] shadow-[inset_0_0_0_1px_rgba(11,26,51,0.06)]",
  card: "bg-[#EAEFF5] shadow-[inset_0_0_0_1px_rgba(11,26,51,0.05)]",
  // For use on the brand-blue band.
  glass: "bg-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]",
};

type BezelProps = {
  radius?: BezelRadius;
  tone?: BezelTone;
  className?: string;
  /** Classes for the inner frame (the content holder). */
  innerClassName?: string;
  children: ReactNode;
  as?: ElementType;
};

/** Double-bezel frame: an 8px tinted shell around an inner frame that clips its content. */
export default function Bezel({
  radius = 32,
  tone = "tint",
  className,
  innerClassName,
  children,
  as: Tag = "div",
}: BezelProps) {
  const r = RADII[radius];
  return (
    <Tag className={cn("p-2", r.outer, SHELLS[tone], className)}>
      <div
        className={cn(
          "overflow-hidden bg-surface shadow-[0_40px_80px_-40px_rgba(12,60,120,0.4)]",
          r.inner,
          innerClassName,
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
