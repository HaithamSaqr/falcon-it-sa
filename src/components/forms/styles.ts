/**
 * v2 form styling shared by the demo and contact forms: white fields with a
 * hairline ring, brand ring on focus, a red ring and message on error.
 */

export const FIELD =
  "block h-12 w-full min-w-0 rounded-xl bg-surface px-4 text-[15px] text-ink shadow-[inset_0_0_0_1px_rgba(11,26,51,0.16)] outline-none transition-shadow duration-200 placeholder:text-muted focus:shadow-[inset_0_0_0_2px_var(--color-brand)] aria-[invalid=true]:shadow-[inset_0_0_0_2px_#B42318]";

/** Native select: same field plus room for the caret at the end. */
export const SELECT = `${FIELD} cursor-pointer appearance-none pe-11`;

export const TEXTAREA = FIELD.replace("h-12", "min-h-[112px]") + " resize-y py-3 leading-relaxed";

export const LABEL = "mb-1.5 block text-sm font-semibold text-ink";

export const ERROR = "mt-1.5 text-[13px] text-[#B42318]";

/** A choice chip (radio) whose ring and tint follow the checked input inside it. */
export const CHIP =
  "v2-press relative inline-flex h-11 cursor-pointer items-center rounded-full bg-surface px-4 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_rgba(11,26,51,0.16)] hover:bg-sky has-[:checked]:bg-sky has-[:checked]:text-brand-deep has-[:checked]:shadow-[inset_0_0_0_2px_var(--color-brand)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand";

export const CHECK = "mt-[3px] size-[18px] shrink-0 cursor-pointer accent-brand";

export const NOTE = "text-sm leading-relaxed text-body";

/** Links inside form copy (privacy policy). */
export const INLINE_LINK = "font-semibold text-brand underline underline-offset-4 transition-colors duration-200 hover:text-brand-deep";
