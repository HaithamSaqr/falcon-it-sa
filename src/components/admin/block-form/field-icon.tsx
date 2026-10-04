"use client";

import {
  ArrowsClockwise,
  ArrowsLeftRight,
  Bank,
  Briefcase,
  Broom,
  Buildings,
  Calculator,
  ChartBar,
  ChartLineUp,
  ClipboardText,
  Clock,
  Cloud,
  Code,
  Database,
  Desktop,
  DeviceMobile,
  Factory,
  Gear,
  Globe,
  GraduationCap,
  Handshake,
  HardDrives,
  Invoice,
  Kanban,
  Lifebuoy,
  ListChecks,
  Monitor,
  Package,
  PaintBrush,
  Plugs,
  PuzzlePiece,
  Receipt,
  Rocket,
  ShieldCheck,
  ShoppingCart,
  Storefront,
  Translate,
  Truck,
  Users,
  UsersThree,
  Wallet,
  Warehouse,
  Wrench,
  type Icon,
} from "@phosphor-icons/react";
import { useId } from "react";
import { FieldErrors, FieldHint, fieldDomId, inputBorder, inputClass, issuesAt, labelClass, useFormCtx } from "./shared";

/**
 * The icons used by the seeded pages plus a few likely additions. Only these
 * are bundled into the admin for the preview; any other Phosphor name still
 * works on the site if typed exactly.
 */
const ICONS: Partial<Record<string, Icon>> = {
  ArrowsClockwise,
  ArrowsLeftRight,
  Bank,
  Briefcase,
  Broom,
  Buildings,
  Calculator,
  ChartBar,
  ChartLineUp,
  ClipboardText,
  Clock,
  Cloud,
  Code,
  Database,
  Desktop,
  DeviceMobile,
  Factory,
  Gear,
  Globe,
  GraduationCap,
  Handshake,
  HardDrives,
  Invoice,
  Kanban,
  Lifebuoy,
  ListChecks,
  Monitor,
  Package,
  PaintBrush,
  Plugs,
  PuzzlePiece,
  Receipt,
  Rocket,
  ShieldCheck,
  ShoppingCart,
  Storefront,
  Translate,
  Truck,
  Users,
  UsersThree,
  Wallet,
  Warehouse,
  Wrench,
};

const NAMES = Object.keys(ICONS);

type Props = {
  path: string;
  label: string;
  name: string;
  value: string | undefined;
  hint?: string;
  onChange: (v: string) => void;
};

/** Phosphor icon name with a live preview and a list of suggestions. */
export default function IconField({ path, label, name, value, hint, onChange }: Props) {
  const { idPrefix, issues } = useFormCtx();
  const listId = useId();
  const v = typeof value === "string" ? value : "";
  const errors = issuesAt(issues, path, true);
  const Glyph = Object.hasOwn(ICONS, v) ? ICONS[v] : undefined;

  return (
    <div id={fieldDomId(idPrefix, path)} className="scroll-mt-28">
      <span className={labelClass}>{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
          title={Glyph ? v : "No preview for this name"}
        >
          {Glyph ? <Glyph size={22} weight="light" aria-hidden /> : <span className="text-[10px] text-slate-400">?</span>}
        </span>
        <input
          type="text"
          dir="ltr"
          list={listId}
          aria-label={name}
          value={v}
          placeholder="Calculator"
          onChange={(e) => onChange(e.target.value.trim())}
          className={`${inputClass} ${inputBorder(errors.length > 0)} font-mono text-[13px]`}
        />
        <datalist id={listId}>
          {NAMES.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>
      {!Glyph && v !== "" && errors.length === 0 && (
        <p className="mt-1 text-xs text-amber-700">
          No preview for this name. It shows on the site only if it matches a Phosphor icon name exactly.
        </p>
      )}
      <FieldHint text={hint} />
      <FieldErrors messages={errors} />
    </div>
  );
}
