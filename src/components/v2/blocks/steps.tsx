import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { SectionTone } from "@/components/v2/ui/section";

export type Step = { title: string; description: string; duration: string };

// The dot's ring matches the band behind it, so the rail looks cut around each dot.
const RING: Record<SectionTone, string> = {
  page: "shadow-[0_0_0_6px_var(--color-page)]",
  surface: "shadow-[0_0_0_6px_var(--color-surface)]",
  brand: "shadow-[0_0_0_6px_var(--color-brand)]",
};

/**
 * Numbered phases on a rail (process and plan blocks): a horizontal rail with
 * one column per step on desktop (up to five a row), a vertical rail on phones.
 */
export default function Steps({ steps, tone, gap = "lg:gap-7" }: { steps: Step[]; tone: SectionTone; gap?: string }) {
  if (steps.length === 0) return null;
  const perRow = Math.min(steps.length, 5);
  return (
    <div className="relative">
      {/* Vertical rail on phones, horizontal on desktop (single row only). */}
      <span aria-hidden="true" className="absolute start-2 top-2 bottom-2 w-0.5 bg-[#D3E3F3] lg:hidden" />
      {steps.length <= 5 && (
        <span aria-hidden="true" className="absolute start-2 end-0 top-2 hidden h-0.5 bg-[#D3E3F3] lg:block" />
      )}
      <ol
        className={cn("relative grid gap-8 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))] lg:gap-y-12", gap)}
        style={{ "--n": perRow } as CSSProperties}
      >
        {steps.map((s, i) => (
          <li key={i} className="relative flex min-w-0 flex-col gap-2 ps-10 lg:gap-2.5 lg:ps-0">
            <span
              aria-hidden="true"
              className={cn("absolute start-0 top-1 size-[18px] rounded-full bg-brand lg:static", RING[tone])}
            />
            <span className="v2-title text-[19px] leading-tight lg:mt-3.5 lg:text-[21px] rtl:font-semibold rtl:leading-snug">
              {s.title}
            </span>
            {s.duration && <span className="text-sm font-medium text-brand">{s.duration}</span>}
            {s.description && <span className="v2-copy text-[15px] text-body lg:text-base">{s.description}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
