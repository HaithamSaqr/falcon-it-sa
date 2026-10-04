"use client";

import { useState, type ReactNode } from "react";
import { emptyValue, itemTitle, type FormNode } from "@/lib/blocks/form-schema";
import { ControlIcon, FieldErrors, FieldHint, fieldDomId, issuesAt, joinPath, labelClass, smallButton, useFormCtx } from "./shared";

type Props = {
  path: string;
  label: string;
  name: string;
  node: Extract<FormNode, { kind: "list" }>;
  value: unknown[] | undefined;
  hint?: string;
  onChange: (v: unknown[]) => void;
  /** Renders one item's editor. `name` is the accessible prefix for its inputs. */
  renderItem: (args: { path: string; name: string; value: unknown; onChange: (v: unknown) => void }) => ReactNode;
};

function hasContent(v: unknown): boolean {
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.some(hasContent);
  if (v && typeof v === "object") return Object.values(v).some(hasContent);
  return false;
}

/** A list with add, remove and move up/down, respecting the schema's min and max. */
export default function ListField({ path, label, name, node, value, hint, onChange, renderItem }: Props) {
  const { idPrefix, issues } = useFormCtx();
  const items = Array.isArray(value) ? value : [];
  const isObject = node.item.kind === "object";
  // Object items fold; open the ones that have problems, and new ones.
  const [open, setOpen] = useState<Set<number>>(() => new Set(items.length <= 2 ? items.map((_, i) => i) : []));
  const errors = issuesAt(issues, path);
  const atMax = node.max !== undefined && items.length >= node.max;
  const atMin = items.length <= node.min;

  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen((prev) => {
      const s = new Set<number>();
      prev.forEach((k) => s.add(k === i ? j : k === j ? i : k));
      return s;
    });
  }

  function remove(i: number) {
    if (atMin) return;
    if (isObject && hasContent(items[i]) && !window.confirm(`Remove item ${i + 1} from "${label}"?`)) return;
    onChange(items.filter((_, k) => k !== i));
    setOpen((prev) => {
      const s = new Set<number>();
      prev.forEach((k) => {
        if (k < i) s.add(k);
        else if (k > i) s.add(k - 1);
      });
      return s;
    });
  }

  function add() {
    if (atMax) return;
    onChange([...items, emptyValue(node.item)]);
    setOpen((prev) => new Set(prev).add(items.length));
  }

  const count = `${items.length}${node.max !== undefined ? ` of ${node.max}` : ""}`;

  return (
    <div id={fieldDomId(idPrefix, path)} className="scroll-mt-28">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={labelClass}>
          {label} <span className="text-xs font-normal text-slate-500">({count}{node.min > 0 ? `, at least ${node.min}` : ""})</span>
        </span>
      </div>
      <FieldHint text={hint} />
      <FieldErrors messages={errors} />

      <ol className="mt-2 space-y-2">
        {items.map((item, i) => {
          const itemPath = joinPath(path, i);
          const itemName = `${name} item ${i + 1}`;
          const problems = issuesAt(issues, itemPath, true).length;
          const isOpen = !isObject || open.has(i) || problems > 0;
          const title = itemTitle(node.item, item);
          const controls = (
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" className={smallButton} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${itemName} up`} title="Move up">
                <ControlIcon name="up" />
              </button>
              <button type="button" className={smallButton} onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${itemName} down`} title="Move down">
                <ControlIcon name="down" />
              </button>
              <button
                type="button"
                className={`${smallButton} hover:border-red-200 hover:bg-red-50 hover:text-red-600`}
                onClick={() => remove(i)}
                disabled={atMin}
                aria-label={`Remove ${itemName}`}
                title={atMin ? `At least ${node.min} needed` : "Remove"}
              >
                <ControlIcon name="trash" />
              </button>
            </div>
          );

          if (!isObject) {
            return (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-7 w-5 shrink-0 text-end text-xs tabular-nums text-slate-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  {renderItem({ path: itemPath, name: itemName, value: item, onChange: (v) => onChange(items.map((x, k) => (k === i ? v : x))) })}
                </div>
                <div className="mt-6">{controls}</div>
              </li>
            );
          }

          return (
            <li key={i} className={`rounded-lg border ${problems ? "border-red-300" : "border-slate-200"} bg-slate-50/60`}>
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setOpen((prev) => {
                    const s = new Set(prev);
                    if (s.has(i)) s.delete(i);
                    else s.add(i);
                    return s;
                  })}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 items-center gap-2 text-start text-sm"
                >
                  <span className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>
                    <ControlIcon name="chevron" />
                  </span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">{i + 1}</span>
                  <span className={`truncate ${title ? "text-slate-800" : "italic text-slate-400"}`} dir="auto">
                    {title || "Untitled"}
                  </span>
                  {problems > 0 && (
                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                      {problems} to fix
                    </span>
                  )}
                </button>
                {controls}
              </div>
              {isOpen && (
                <div className="border-t border-slate-200 bg-white px-3 py-3">
                  {renderItem({ path: itemPath, name: itemName, value: item, onChange: (v) => onChange(items.map((x, k) => (k === i ? v : x))) })}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-2 flex items-center gap-3">
        <button type="button" onClick={add} disabled={atMax} className={smallButton} aria-label={`Add to ${name}`}>
          <ControlIcon name="plus" /> Add
        </button>
        {atMax && <span className="text-xs text-slate-500">Maximum of {node.max} reached.</span>}
        {items.length === 0 && <span className="text-xs text-slate-500">No items yet.</span>}
      </div>
    </div>
  );
}
