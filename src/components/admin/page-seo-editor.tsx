"use client";

import { useEffect, useState } from "react";
import type { Bi } from "@/lib/blocks/bi";
import BiField from "@/components/admin/block-form/field-bi";
import ImageField from "@/components/admin/block-form/field-image";
import { BlockFormContext } from "@/components/admin/block-form/shared";
import type { ContentIssue } from "@/lib/blocks/form-schema";

type PageSeo = { page: string; title: Bi; description: Bi; ogImage: string };

function Counter({ value, ideal }: { value: Bi; ideal: number }) {
  const parts = (["en", "ar"] as const).map((l) => {
    const n = value[l].length;
    return (
      <span key={l} className={n > ideal ? "text-amber-700" : "text-slate-500"}>
        {l === "en" ? "English" : "Arabic"} {n}/{ideal}
      </span>
    );
  });
  return <p className="mt-1 flex gap-4 text-xs tabular-nums">{parts}</p>;
}

/** Search title, description and share image of one page (`page_seo`). Empty means the site default. */
export default function PageSeoEditor({ page }: { page: string }) {
  const [seo, setSeo] = useState<PageSeo | null>(null);
  const [loadError, setLoadError] = useState("");
  const [issues, setIssues] = useState<ContentIssue[]>([]);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let live = true;
    fetch(`/api/admin/page-seo?page=${encodeURIComponent(page)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        if (d.success) setSeo(d.data);
        else setLoadError(d.error || "Could not load the page SEO.");
      })
      .catch(() => live && setLoadError("Could not load the page SEO."));
    return () => {
      live = false;
    };
  }, [page]);

  async function save() {
    if (!seo) return;
    setState("saving");
    setIssues([]);
    try {
      const res = await fetch("/api/admin/page-seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seo),
      });
      const d = await res.json();
      if (d.success) {
        setState("saved");
        setMessage("SEO saved.");
      } else {
        const m = /^(\w+): ([\s\S]*)$/.exec(d.error ?? "");
        if (m) setIssues([{ path: m[1], message: m[2] }]);
        setState("error");
        setMessage(d.error || "Could not save.");
      }
    } catch {
      setState("error");
      setMessage("Could not reach the server. Nothing was saved.");
    }
  }

  if (loadError) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{loadError}</p>;
  if (!seo) return <p className="p-4 text-sm text-slate-500">Loading SEO...</p>;

  const patch = (p: Partial<PageSeo>) => {
    setSeo({ ...seo, ...p });
    if (state !== "saving") setState("idle");
  };

  return (
    <BlockFormContext.Provider value={{ idPrefix: "seo", issues, roles: [] }}>
      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Search and sharing</h3>
          <p className="text-xs text-slate-500">
            Shown by Google and when the page is shared. Leave a field empty to use the default for this page.
          </p>
        </div>
        <div>
          <BiField path="title" label="Page title" name="SEO title" value={seo.title} required={false} multiline={false} onChange={(title) => patch({ title })} />
          <Counter value={seo.title} ideal={60} />
        </div>
        <div>
          <BiField
            path="description"
            label="Description"
            name="SEO description"
            value={seo.description}
            required={false}
            multiline
            onChange={(description) => patch({ description })}
          />
          <Counter value={seo.description} ideal={160} />
        </div>
        <ImageField
          path="ogImage"
          label="Share image"
          name="Share image"
          value={seo.ogImage}
          hint="Shown when the page is shared on social media. 1200 by 630 pixels works best. Empty uses the site image."
          onChange={(ogImage) => patch({ ogImage })}
        />
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          {state === "saved" && (
            <span role="status" className="text-sm text-emerald-700">
              {message}
            </span>
          )}
          {state === "error" && (
            <span role="alert" className="text-sm text-red-700">
              {message}
            </span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={state === "saving"}
            className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {state === "saving" ? "Saving..." : "Save SEO"}
          </button>
        </div>
      </div>
    </BlockFormContext.Provider>
  );
}
