"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  dir?: "ltr" | "rtl";
}

/** Lightweight contentEditable rich-text editor with image upload. */
export default function RichTextEditor({ value, onChange, dir = "ltr" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        ref.current?.focus();
        document.execCommand("insertHTML", false, `<img src="${data.data.url}" alt="" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
        onChange(ref.current?.innerHTML ?? "");
      }
    } finally {
      setUploading(false);
    }
  }

  const btn = "rounded px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200";

  return (
    <div className="rounded-lg border border-slate-300">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1.5">
        <button type="button" className={btn} onClick={() => exec("bold")}><b>B</b></button>
        <button type="button" className={btn} onClick={() => exec("italic")}><i>I</i></button>
        <button type="button" className={btn} onClick={() => exec("underline")}><u>U</u></button>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <button type="button" className={btn} onClick={() => exec("formatBlock", "<h2>")}>H2</button>
        <button type="button" className={btn} onClick={() => exec("formatBlock", "<h3>")}>H3</button>
        <button type="button" className={btn} onClick={() => exec("formatBlock", "<p>")}>P</button>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <button type="button" className={btn} onClick={() => exec("insertUnorderedList")}>• List</button>
        <button type="button" className={btn} onClick={() => exec("insertOrderedList")}>1. List</button>
        <button type="button" className={btn} onClick={addLink}>🔗 Link</button>
        <button type="button" className={btn} onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? "…" : "🖼 Image"}
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
      <div
        ref={ref}
        contentEditable
        dir={dir}
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        className="prose prose-sm min-h-[240px] max-w-none px-4 py-3 text-sm text-slate-800 focus:outline-none"
        suppressContentEditableWarning
      />
    </div>
  );
}
