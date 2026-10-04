"use client";

import ImageUpload from "@/components/admin/image-upload";
import { isSafeImage } from "@/lib/blocks/links";
import { FieldErrors, FieldHint, fieldDomId, inputBorder, inputClass, issuesAt, labelClass, useFormCtx } from "./shared";

type Props = {
  path: string;
  label: string;
  name: string;
  value: string | undefined;
  hint?: string;
  onChange: (v: string) => void;
};

/** Image: upload (existing admin upload API), or type a path; with a preview. */
export default function ImageField({ path, label, name, value, hint, onChange }: Props) {
  const { idPrefix, issues } = useFormCtx();
  const v = typeof value === "string" ? value : "";
  const errors = issuesAt(issues, path, true);
  const looksWrong = !isSafeImage(v);

  return (
    <div id={fieldDomId(idPrefix, path)} className="scroll-mt-28">
      <span className={labelClass}>{label}</span>
      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {v && !looksWrong ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="px-2 text-center text-xs text-slate-400">{v ? "Invalid path" : "No image"}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            dir="ltr"
            aria-label={`${name} path`}
            value={v}
            placeholder="/api/uploads/... or /images/..."
            onChange={(e) => onChange(e.target.value.trim())}
            className={`${inputClass} ${inputBorder(errors.length > 0 || looksWrong)} font-mono text-[13px]`}
          />
          <ImageUpload value={v} onChange={onChange} showPreview={false} />
        </div>
      </div>
      {looksWrong && errors.length === 0 && (
        <p className="mt-1 text-xs text-amber-700">Upload an image, or use a path starting with /images/ or /api/uploads/, or an https:// link.</p>
      )}
      <FieldHint text={hint} />
      <FieldErrors messages={errors} />
    </div>
  );
}
