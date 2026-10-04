"use client";

import { isSafeLink } from "@/lib/blocks/links";
import { FieldErrors, FieldHint, fieldDomId, inputBorder, inputClass, issuesAt, labelClass, useFormCtx } from "./shared";

type Props = {
  path: string;
  label: string;
  name: string;
  value: string | undefined;
  allowEmpty: boolean;
  hint?: string;
  onChange: (v: string) => void;
};

/** A site path ("/demo") or https link, checked as you type. */
export default function LinkField({ path, label, name, value, allowEmpty, hint, onChange }: Props) {
  const { idPrefix, issues } = useFormCtx();
  const v = typeof value === "string" ? value : "";
  const errors = issuesAt(issues, path, true);
  const looksWrong = v !== "" && !isSafeLink(v);
  const id = fieldDomId(idPrefix, path);

  return (
    <label id={id} className="block scroll-mt-28">
      <span className={labelClass}>{label}</span>
      <input
        type="text"
        dir="ltr"
        aria-label={name}
        value={v}
        placeholder={allowEmpty ? "Empty, /page or https://..." : "/demo or https://..."}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 ${inputClass} ${inputBorder(errors.length > 0 || looksWrong)} font-mono text-[13px]`}
      />
      {looksWrong && errors.length === 0 && (
        <p className="mt-1 text-xs text-amber-700">Use a path on this site starting with / or a full https:// link.</p>
      )}
      <FieldHint text={hint ?? (v.startsWith("/") && !v.startsWith("/ar") ? "Site paths open in the visitor's language automatically, so no /ar is needed." : undefined)} />
      <FieldErrors messages={errors} />
    </label>
  );
}
