"use client";

import { createContext, useContext } from "react";
import type { ContentIssue } from "@/lib/blocks/form-schema";
import type { Role } from "@/lib/blocks/roles";

/** Shared state of one block form: its issues and declared roles. */
export type FormCtx = {
  /** Unique per block on the page; prefixes DOM ids so errors can be scrolled to. */
  idPrefix: string;
  issues: ContentIssue[];
  roles: Role[];
};

export const BlockFormContext = createContext<FormCtx>({ idPrefix: "bf", issues: [], roles: [] });

export function useFormCtx(): FormCtx {
  return useContext(BlockFormContext);
}

/** DOM id of the field at `path` inside a block form. */
export function fieldDomId(idPrefix: string, path: string): string {
  return `${idPrefix}-${path ? path.replace(/[^A-Za-z0-9_-]/g, "-") : "root"}`;
}

export function joinPath(path: string, key: string | number): string {
  return path ? `${path}.${key}` : String(key);
}

/** Messages at `path` exactly, or (deep) at `path` and anything below it. */
export function issuesAt(issues: ContentIssue[], path: string, deep = false): string[] {
  return issues
    .filter((i) => i.path === path || (deep && (path === "" || i.path.startsWith(`${path}.`))))
    .map((i) => i.message);
}

export const inputClass =
  "w-full rounded-lg border px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";

export function inputBorder(hasError: boolean): string {
  return hasError ? "border-red-400 bg-red-50/40" : "border-slate-300 bg-white";
}

export const labelClass = "block text-sm font-medium text-slate-700";
export const subLabelClass = "mb-1 block text-xs font-medium text-slate-500";
export const smallButton =
  "inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40";

export function FieldErrors({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <ul className="mt-1 space-y-0.5">
      {[...new Set(messages)].map((m) => (
        <li key={m} className="text-xs font-medium text-red-600">
          {m}
        </li>
      ))}
    </ul>
  );
}

export function FieldHint({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mt-0.5 text-xs text-slate-500">{text}</p>;
}

/** Small arrow / action icons for list and block controls. */
export function ControlIcon({ name }: { name: "up" | "down" | "copy" | "trash" | "chevron" | "plus" }) {
  const d = {
    up: "M4.5 15.75l7.5-7.5 7.5 7.5",
    down: "M19.5 8.25l-7.5 7.5-7.5-7.5",
    chevron: "M8.25 4.5l7.5 7.5-7.5 7.5",
    plus: "M12 4.5v15m7.5-7.5h-15",
    copy: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75",
    trash:
      "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
  }[name];
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}
