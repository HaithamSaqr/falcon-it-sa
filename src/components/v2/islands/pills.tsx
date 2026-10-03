"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PillOption = { id: string; label: ReactNode };

type PillGroupProps = {
  /** Visible label beside (or above) the pills; also the group's accessible name. */
  label: ReactNode;
  /** Accessible name when there is no visible label. */
  fallbackLabel?: string;
  options: PillOption[];
  /** Selected id, or null for none. */
  value: string | null;
  onChange: (id: string | null) => void;
  /** Picking the selected pill again clears the selection (hero sector pills). */
  allowClear?: boolean;
  /** `md` = 42px pills (hero), `lg` = 44px (role switcher). */
  size?: "md" | "lg";
  /** Label above the pills on phones, beside them from `sm` (role switcher). */
  stackOnPhone?: boolean;
  className?: string;
};

const SIZES = {
  md: "min-h-[42px] px-[18px]",
  lg: "min-h-11 px-[18px] sm:px-5",
};

/**
 * Pill radio group (role="radiogroup" with role="radio" buttons). Roving
 * tabindex: Tab lands on the selected pill (or the first), arrow keys move and
 * select, mirrored under RTL.
 */
export default function PillGroup({
  label,
  fallbackLabel,
  options,
  value,
  onChange,
  allowClear = false,
  size = "md",
  stackOnPhone = false,
  className,
}: PillGroupProps) {
  const labelId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndex = Math.max(
    0,
    options.findIndex((o) => o.id === value),
  );

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const forward = e.key === "ArrowDown" || e.key === (rtl ? "ArrowLeft" : "ArrowRight");
    const back = e.key === "ArrowUp" || e.key === (rtl ? "ArrowRight" : "ArrowLeft");
    if (!forward && !back) return;
    e.preventDefault();
    const next = (index + (forward ? 1 : -1) + options.length) % options.length;
    refs.current[next]?.focus();
    onChange(options[next].id);
  }

  if (options.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        stackOnPhone && "flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-3",
        className,
      )}
    >
      {label && (
        <span
          id={labelId}
          className={cn(
            "text-[15px] font-medium text-body",
            stackOnPhone && "text-sm font-semibold sm:text-[15px] sm:font-medium",
          )}
        >
          {label}
        </span>
      )}
      <div
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : fallbackLabel}
        className="flex flex-wrap gap-2"
      >
        {options.map((o, i) => {
          const checked = o.id === value;
          return (
            <button
              key={o.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={i === focusIndex ? 0 : -1}
              onClick={() => onChange(checked && allowClear ? null : o.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "v2-press max-w-full cursor-pointer rounded-full py-1.5 text-[15px] leading-tight [overflow-wrap:anywhere] outline-brand focus-visible:outline-3 focus-visible:outline-offset-3",
                SIZES[size],
                checked
                  ? "bg-ink font-semibold text-white"
                  : "bg-surface font-medium text-ink shadow-[inset_0_0_0_1px_rgba(11,26,51,0.12)] hover:bg-sky",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
