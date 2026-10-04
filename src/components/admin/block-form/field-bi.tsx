"use client";

import type { Bi } from "@/lib/blocks/bi";
import { FieldErrors, FieldHint, fieldDomId, inputBorder, inputClass, issuesAt, labelClass, subLabelClass, useFormCtx } from "./shared";

type Props = {
  path: string;
  label: string;
  /** Accessible prefix, e.g. "Sector pills item 2, Label". */
  name: string;
  value: Bi | undefined;
  required: boolean;
  multiline: boolean;
  hint?: string;
  onChange: (v: Bi) => void;
  /** Hide the visible label (list rows that already carry one). */
  bare?: boolean;
};

/** A bilingual text: English and Arabic side by side (Arabic right-to-left). */
export default function BiField({ path, label, name, value, required, multiline, hint, onChange, bare }: Props) {
  const { idPrefix, issues } = useFormCtx();
  const v: Bi = { en: typeof value?.en === "string" ? value.en : "", ar: typeof value?.ar === "string" ? value.ar : "" };
  const errors = issuesAt(issues, path, true);
  const id = fieldDomId(idPrefix, path);
  const bothEmpty = v.en.trim() === "" && v.ar.trim() === "";
  const oneEmpty = !bothEmpty && (v.en.trim() === "" || v.ar.trim() === "");

  const sides = [
    { lang: "en" as const, title: "English", dir: "ltr" as const, aria: `${name} (English)` },
    { lang: "ar" as const, title: "العربية", dir: "rtl" as const, aria: `${name} (Arabic)` },
  ];

  return (
    <div id={id} className="scroll-mt-28">
      {!bare && (
        <span className={labelClass}>
          {label}
          {required && <span className="ms-1 text-xs font-normal text-slate-500">(required in at least one language)</span>}
        </span>
      )}
      <div className="mt-1 grid gap-2 md:grid-cols-2">
        {sides.map((s) => {
          const common = {
            "aria-label": s.aria,
            dir: s.dir,
            lang: s.lang,
            value: v[s.lang],
            className: `${inputClass} ${inputBorder(errors.length > 0)}`,
          };
          return (
            <label key={s.lang} className="block">
              <span className={subLabelClass}>{s.title}</span>
              {multiline ? (
                <textarea
                  {...common}
                  rows={Math.min(8, Math.max(2, Math.ceil(v[s.lang].length / 70)))}
                  onChange={(e) => onChange({ ...v, [s.lang]: e.target.value })}
                />
              ) : (
                <input {...common} type="text" onChange={(e) => onChange({ ...v, [s.lang]: e.target.value })} />
              )}
            </label>
          );
        })}
      </div>
      {oneEmpty && (
        <p className="mt-1 text-xs text-amber-700">
          {v.ar.trim() === "" ? "Arabic is empty: the Arabic page shows the English text." : "English is empty: the English page shows the Arabic text."}
        </p>
      )}
      <FieldHint text={hint} />
      <FieldErrors messages={errors} />
    </div>
  );
}
