"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FORM_MESSAGES_EN, type FormMessages } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { ERROR, INLINE_LINK, LABEL } from "./styles";

/** Validation messages in the page language (messages `validation.*`), for the client-side schemas. */
export function useFormMessages(): FormMessages {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      Object.fromEntries(Object.keys(FORM_MESSAGES_EN).map((k) => [k, t(k as keyof FormMessages)])) as FormMessages,
    [t],
  );
}

/** Label, control and error message of one field. */
export function Field({
  id,
  label,
  required,
  error,
  className,
  children,
}: {
  id: string;
  label: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className={LABEL}>
        {label}
        {required && (
          <span aria-hidden="true" className="ms-0.5 text-brand">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={ERROR}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Native select with a caret at the inline end (RTL aware). */
export function SelectShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 256 256"
        className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted"
      >
        <path
          d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

/**
 * The website privacy policy link used inside consent copy (`<link>` in
 * messages). Opens in a new tab so a half-filled form is never lost.
 */
export function privacyLink(chunks: ReactNode) {
  return (
    <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={INLINE_LINK}>
      {chunks}
    </Link>
  );
}

/** Confirmation shown in place of a sent form. */
export function SentNotice({ title, body, ...rest }: { title: string; body: string } & Record<`data-${string}`, string>) {
  return (
    <div role="status" className="flex flex-col items-start gap-4 py-4" {...rest}>
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-sky text-brand">
        <svg aria-hidden="true" viewBox="0 0 256 256" className="size-6">
          <path
            d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <p className="text-[22px] font-extrabold leading-tight text-ink rtl:font-bold">{title}</p>
      <p className="v2-copy text-base text-body">{body}</p>
    </div>
  );
}

/** Server or network error above the form. */
export function FormError({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-xl bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
      {message}
    </p>
  );
}
