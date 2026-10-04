"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BlockForm, { fieldDomId } from "@/components/admin/block-form";
import { ControlIcon, smallButton } from "@/components/admin/block-form/shared";
import PageSeoEditor from "@/components/admin/page-seo-editor";
import { BLOCKS } from "@/lib/blocks/registry";
import { BLOCK_TYPES, isBlockType, type BlockType } from "@/lib/blocks/types";
import { blockForm, contentIssues, fieldLabel, itemTitle, parseSaveError, type ContentIssue } from "@/lib/blocks/form-schema";
import { arabicPath, isSeoOnlyPage, pageLabel, publicPath } from "@/lib/admin/page-keys";

/** A block as the admin API returns it (a stored block that no longer validates comes back as stored). */
type EditorBlock = { id: string; page: string; type: string; sortOrder: number; enabled: boolean; content: unknown };
type Row = { key: string; block: EditorBlock };
type ServerIssue = { key: string; path: string; message: string };

let keySeq = 0;
const newKey = () => `row-${Date.now().toString(36)}-${(keySeq++).toString(36)}`;

const snapshot = (rows: Row[]) => JSON.stringify(rows.map((r) => [r.block.id, r.block.type, r.block.enabled, r.block.content]));

function typeLabel(type: string): string {
  return isBlockType(type) ? BLOCKS[type].label.en : `Unknown block "${type}"`;
}

function blockTitle(b: EditorBlock): string {
  return isBlockType(b.type) ? itemTitle(blockForm(b.type), b.content) : "";
}

/** "primaryCta.href" -> "Primary button, Link"; "stages.2.title" -> "Stages, item 3, Title". */
function pathLabel(path: string): string {
  if (!path) return "Block";
  return path
    .split(".")
    .map((p) => (/^\d+$/.test(p) ? `item ${Number(p) + 1}` : fieldLabel(p)))
    .join(", ");
}

const idPrefix = (key: string) => `b-${key}`;

export default function PageEditor({ page }: { page: string }) {
  const seoOnly = isSeoOnlyPage(page);
  const [tab, setTab] = useState<"blocks" | "seo">(seoOnly ? "seo" : "blocks");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [savedSnap, setSavedSnap] = useState("");
  const [loadError, setLoadError] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [showIssues, setShowIssues] = useState(false);
  const [serverIssue, setServerIssue] = useState<ServerIssue | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [addType, setAddType] = useState<BlockType>("rich_text");
  const alertRef = useRef<HTMLDivElement>(null);

  const path = publicPath(page);

  useEffect(() => {
    if (seoOnly) return;
    let live = true;
    fetch(`/api/admin/pages/${encodeURIComponent(page)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        if (!d.success) {
          setLoadError(d.error || "Could not load the page.");
          return;
        }
        const loaded = (d.data as EditorBlock[]).map((block) => ({ key: newKey(), block }));
        setRows(loaded);
        setSavedSnap(snapshot(loaded));
        if (loaded.some((r) => contentIssues(r.block.type, r.block.content).length > 0)) setShowIssues(true);
      })
      .catch(() => live && setLoadError("Could not load the page. Check the connection and reload."));
    return () => {
      live = false;
    };
  }, [page, seoOnly]);

  const dirty = rows !== null && snapshot(rows) !== savedSnap;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const issues = useMemo(() => {
    const map = new Map<string, ContentIssue[]>();
    for (const r of rows ?? []) {
      const list = showIssues ? contentIssues(r.block.type, r.block.content) : [];
      if (serverIssue?.key === r.key && !list.some((i) => i.path === serverIssue.path)) {
        list.push({ path: serverIssue.path, message: serverIssue.message });
      }
      map.set(r.key, list);
    }
    return map;
  }, [rows, showIssues, serverIssue]);

  const allIssues = useMemo(
    () =>
      (rows ?? []).flatMap((r, i) =>
        (issues.get(r.key) ?? []).map((issue) => ({ ...issue, key: r.key, index: i, type: r.block.type })),
      ),
    [rows, issues],
  );

  const update = useCallback((key: string, fn: (b: EditorBlock) => EditorBlock) => {
    setRows((prev) => prev && prev.map((r) => (r.key === key ? { ...r, block: fn(r.block) } : r)));
    setServerIssue((s) => (s?.key === key ? null : s));
    setStatus((s) => (s === "saving" ? s : "idle"));
  }, []);

  function toggle(key: string, force?: boolean) {
    setOpen((prev) => {
      const s = new Set(prev);
      const isOpen = force ?? !s.has(key);
      if (isOpen) s.add(key);
      else s.delete(key);
      return s;
    });
  }

  function move(i: number, d: -1 | 1) {
    setRows((prev) => {
      if (!prev) return prev;
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setStatus((s) => (s === "saved" ? "idle" : s));
  }

  function duplicate(i: number) {
    if (!rows) return;
    const src = rows[i];
    // A copy never keeps the source id; the server assigns a new one.
    const copy: Row = { key: newKey(), block: { ...src.block, id: "", content: structuredClone(src.block.content) } };
    setRows([...rows.slice(0, i + 1), copy, ...rows.slice(i + 1)]);
    toggle(copy.key, true);
  }

  function remove(i: number) {
    if (!rows) return;
    const r = rows[i];
    const title = blockTitle(r.block);
    if (!window.confirm(`Delete block ${i + 1} (${typeLabel(r.block.type)}${title ? `: ${title}` : ""})?\n\nIt is removed from the page when you save.`)) return;
    setRows(rows.filter((_, k) => k !== i));
    if (serverIssue?.key === r.key) setServerIssue(null);
  }

  function add() {
    const row: Row = {
      key: newKey(),
      block: { id: "", page, type: addType, sortOrder: rows?.length ?? 0, enabled: true, content: BLOCKS[addType].defaults() },
    };
    setRows((prev) => [...(prev ?? []), row]);
    toggle(row.key, true);
    setTimeout(() => document.getElementById(`block-${row.key}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function jumpTo(key: string, fieldPath: string) {
    toggle(key, true);
    setTimeout(() => {
      const el = document.getElementById(fieldDomId(idPrefix(key), fieldPath)) ?? document.getElementById(`block-${key}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("input, textarea, select")?.focus({ preventScroll: true });
    }, 60);
  }

  async function save() {
    if (!rows) return;
    const problems = rows.filter((r) => contentIssues(r.block.type, r.block.content).length > 0);
    if (problems.length > 0) {
      setShowIssues(true);
      setStatus("error");
      setMessage("Nothing was saved. Fix the fields marked in red, then save again.");
      setOpen((prev) => new Set([...prev, ...problems.map((r) => r.key)]));
      setTimeout(() => alertRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
      return;
    }
    setStatus("saving");
    setServerIssue(null);
    try {
      const res = await fetch(`/api/admin/pages/${encodeURIComponent(page)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: rows.map((r, i) => ({ ...r.block, page, sortOrder: i })),
        }),
      });
      const d = await res.json().catch(() => null);
      if (res.ok && d?.success) {
        const fresh = d.data as EditorBlock[];
        const next = fresh.map((block, i) => ({ key: rows[i]?.key ?? newKey(), block }));
        setRows(next);
        setSavedSnap(snapshot(next));
        setShowIssues(false);
        setStatus("saved");
        setMessage("Saved. The public page now shows these changes.");
        return;
      }
      const error = String(d?.error ?? `Save failed (${res.status}).`);
      const parsed = parseSaveError(error);
      if (parsed && rows[parsed.index]) {
        setServerIssue({ key: rows[parsed.index].key, path: parsed.path, message: parsed.message });
        toggle(rows[parsed.index].key, true);
      }
      setStatus("error");
      setMessage(res.status === 401 ? "Your session has expired. Log in again in another tab, then save." : `Nothing was saved. ${parsed ? "Fix the field marked in red." : error}`);
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Nothing was saved.");
    }
  }

  const tabs = seoOnly ? (["seo"] as const) : (["blocks", "seo"] as const);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/admin/pages" className="text-xs font-medium text-cyan-700 hover:underline">
            All pages
          </Link>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{pageLabel(page)}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            <code className="rounded bg-slate-100 px-1.5 py-0.5">{page}</code>
            {path && <span className="ms-2">{path}</span>}
          </p>
        </div>
        {path && (
          <div className="flex flex-wrap gap-2">
            <a href={path} target="_blank" rel="noopener noreferrer" className={`${smallButton} px-3 py-1.5`}>
              View English page
            </a>
            <a href={arabicPath(path)} target="_blank" rel="noopener noreferrer" className={`${smallButton} px-3 py-1.5`}>
              View Arabic page
            </a>
          </div>
        )}
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t === "blocks" ? "Page content" : "Search and sharing (SEO)"}
          </button>
        ))}
      </div>

      {seoOnly && tab === "seo" && (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          The layout of this page is built from other admin sections, so only its search and sharing details are edited here.
        </p>
      )}

      {tab === "seo" && <PageSeoEditor page={page} />}

      {tab === "blocks" && (
        <>
          {loadError && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}
          {!rows && !loadError && <p className="p-6 text-center text-sm text-slate-500">Loading blocks...</p>}

          {rows && (
            <>
              <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
                <div className="text-sm text-slate-600">
                  {rows.length} block{rows.length === 1 ? "" : "s"}
                  {dirty ? (
                    <span className="ms-3 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Unsaved changes</span>
                  ) : (
                    <span className="ms-3 text-xs text-slate-400">No unsaved changes</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {status === "saved" && (
                    <span role="status" className="text-sm font-medium text-emerald-700">
                      {message}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={save}
                    disabled={status === "saving" || (!dirty && !showIssues)}
                    className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {status === "saving" ? "Saving..." : "Save page"}
                  </button>
                </div>
              </div>

              {(status === "error" || allIssues.length > 0) && (
                <div ref={alertRef} role="alert" className="scroll-mt-24 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-800">
                    {status === "error" ? message : `${allIssues.length} field${allIssues.length === 1 ? "" : "s"} to fix. Blocks with problems are not shown on the site.`}
                  </p>
                  {allIssues.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {allIssues.slice(0, 12).map((i, n) => (
                        <li key={`${i.key}-${i.path}-${n}`}>
                          <button type="button" onClick={() => jumpTo(i.key, i.path)} className="text-start text-sm text-red-800 underline-offset-2 hover:underline">
                            Block {i.index + 1} ({typeLabel(i.type)}), {pathLabel(i.path)}: {i.message}
                          </button>
                        </li>
                      ))}
                      {allIssues.length > 12 && <li className="text-xs text-red-700">and {allIssues.length - 12} more</li>}
                    </ul>
                  )}
                </div>
              )}

              {rows.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                  This page has no blocks yet. Add the first one below.
                </p>
              )}

              <ol className="space-y-3">
                {rows.map((r, i) => {
                  const b = r.block;
                  const known = isBlockType(b.type);
                  const isOpen = open.has(r.key);
                  const blockIssues = issues.get(r.key) ?? [];
                  const title = blockTitle(b);
                  const label = typeLabel(b.type);
                  return (
                    <li
                      key={r.key}
                      id={`block-${r.key}`}
                      data-editor-block={b.type}
                      className={`scroll-mt-24 rounded-xl border bg-white shadow-sm ${blockIssues.length ? "border-red-300" : "border-slate-200"} ${b.enabled ? "" : "opacity-80"}`}
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggle(r.key)}
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Close" : "Edit"} block ${i + 1}: ${label}`}
                          className="flex min-w-0 flex-1 items-center gap-3 text-start"
                        >
                          <span className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>
                            <ControlIcon name="chevron" />
                          </span>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold tabular-nums text-slate-600">
                            {i + 1}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-800">{label}</span>
                            {title && (
                              <span className="block truncate text-xs text-slate-500" dir="auto">
                                {title}
                              </span>
                            )}
                          </span>
                          {!b.enabled && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">Hidden</span>}
                          {blockIssues.length > 0 && (
                            <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                              {blockIssues.length} to fix
                            </span>
                          )}
                        </button>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <label className="me-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                            <span className="relative inline-flex">
                              <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={b.enabled}
                                aria-label={`Show block ${i + 1} (${label}) on the page`}
                                onChange={(e) => update(r.key, (x) => ({ ...x, enabled: e.target.checked }))}
                              />
                              <span className="h-5 w-9 rounded-full bg-slate-300 transition-colors peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500/40" />
                              <span className="absolute start-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4 rtl:peer-checked:-translate-x-4" />
                            </span>
                            {b.enabled ? "Shown" : "Hidden"}
                          </label>
                          <button type="button" className={smallButton} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move block ${i + 1} up`} title="Move up">
                            <ControlIcon name="up" />
                          </button>
                          <button type="button" className={smallButton} onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={`Move block ${i + 1} down`} title="Move down">
                            <ControlIcon name="down" />
                          </button>
                          {known && (
                            <button type="button" className={smallButton} onClick={() => duplicate(i)} aria-label={`Duplicate block ${i + 1}`} title="Duplicate">
                              <ControlIcon name="copy" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`${smallButton} hover:border-red-200 hover:bg-red-50 hover:text-red-600`}
                            onClick={() => remove(i)}
                            aria-label={`Delete block ${i + 1}`}
                            title="Delete"
                          >
                            <ControlIcon name="trash" />
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="border-t border-slate-100 px-4 py-5">
                          {known ? (
                            <BlockForm
                              type={b.type as BlockType}
                              content={b.content}
                              issues={blockIssues}
                              idPrefix={idPrefix(r.key)}
                              onChange={(content) => update(r.key, (x) => ({ ...x, content }))}
                            />
                          ) : (
                            <p className="text-sm text-slate-600">
                              This block type is not known to this version of the site and is never shown. Delete it to save the page.
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>

              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3">
                <label htmlFor="add-block-type" className="text-sm font-medium text-slate-700">
                  Add a block
                </label>
                <select
                  id="add-block-type"
                  value={addType}
                  onChange={(e) => setAddType(e.target.value as BlockType)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800"
                >
                  {BLOCK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {BLOCKS[t].label.en}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={add} className={`${smallButton} px-3 py-1.5`}>
                  <ControlIcon name="plus" /> Add at the end
                </button>
                <span className="text-xs text-slate-500">New blocks start with sample text. Use the arrows to move them.</span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
