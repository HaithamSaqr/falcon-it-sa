"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  dir?: "ltr" | "rtl";
}

/** Lightweight contentEditable rich-text editor with image upload + HTML source mode. */
export default function RichTextEditor({ value, onChange, dir = "ltr" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showHtml, setShowHtml] = useState(false);

  // Seed initial content once (uncontrolled thereafter to preserve caret).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  }

  function addLink() {
    const url = prompt("Link URL:");
    if (url) exec("createLink", url);
  }

  function toggleHtml() {
    // Leaving HTML mode → re-seed the visual editor from the (possibly edited) value.
    if (showHtml && ref.current) {
      ref.current.innerHTML = value || "";
    }
    setShowHtml((s) => !s);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        const tag = `<img src="${data.data.url}" alt="" style="max-width:100%;border-radius:8px;margin:8px 0" />`;
        if (showHtml) {
          onChange((value || "") + tag);
        } else {
          ref.current?.focus();
          document.execCommand("insertHTML", false, tag);
          onChange(ref.current?.innerHTML ?? "");
        }
      }
    } finally {
      setUploading(false);
    }
  }

  const btn = "rounded px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="rounded-lg border border-slate-300">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1.5">
        <button type="button" className={btn} disabled={showHtml} onClick={() => exec("bold")}><b>B</b></button>
        <button type="button" className={btn} disabled={showHtml} onClick={() => exec("italic")}><i>I</i></button>
        <button type="button" className={btn} disabled={showHtml} onClick={() => exec("underline")}><u>U</u></button>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <button type="button" className={btn} disabled={showHtml} onClick={() => exec("formatBlock", "<h2>")}>H2</button>
        <button type="button" className={btn} disabled={showHtml} onClick={() => exec("formatBlock", "<h3>")}>H3</button>
        <button type="button" className={btn} disabled={showHtml} onClick={() => exec("formatBlock", "<p>")}>P</button>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <button type="button" className={btn} disabled={showHtml} onClick={() => exec("insertUnorderedList")}>• List</button>
        <button type="button" className={btn} disabled={showHtml} onClick={() => exec("insertOrderedList")}>1. List</button>
        <button type="button" className={btn} disabled={showHtml} onClick={addLink}>🔗 Link</button>
        <button type="button" className={btn} onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? "…" : "🖼 Image"}
        </button>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <button
          type="button"
          onClick={toggleHtml}
          className={`rounded px-2 py-1 font-mono text-sm font-medium ${
            showHtml ? "bg-cyan-600 text-white hover:bg-cyan-700" : "text-slate-700 hover:bg-slate-200"
          }`}
          title="Edit / paste raw HTML"
        >
          &lt;/&gt; HTML
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);
          }}
        />
      </div>

      {/* HTML source textarea (paste/edit raw HTML) */}
      <textarea
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="<p>Paste or write your HTML here…</p>"
        className={`min-h-[240px] w-full resize-y px-4 py-3 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none ${showHtml ? "block" : "hidden"}`}
      />

      {/* Visual editor (kept mounted so the caret/ref persist) */}
      <div
        ref={ref}
        contentEditable
        dir={dir}
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        className={`prose prose-sm min-h-[240px] max-w-none px-4 py-3 text-sm text-slate-800 focus:outline-none ${showHtml ? "hidden" : "block"}`}
        suppressContentEditableWarning
      />
    </div>
  );
}
