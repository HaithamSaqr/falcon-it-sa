"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PAGE_GROUPS,
  SEO_ONLY_PAGES,
  adminPageHref,
  arabicPath,
  pageGroup,
  pageLabel,
  publicPath,
  type PageGroup,
} from "@/lib/admin/page-keys";

type PageRow = { page: string; count: number };

const GROUP_NOTES: Partial<Record<PageGroup, string>> = {
  Sectors: "Sector names, photos and on/off live in Sectors. The landing page content is edited here.",
  "Index pages (SEO only)": "Built from other admin sections. Only the search and sharing details are edited here.",
};

export default function AdminPagesList() {
  const [pages, setPages] = useState<PageRow[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPages(d.data);
        else setError(d.error || "Could not load the pages.");
      })
      .catch(() => setError("Could not load the pages."));
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!pages) return <div className="flex h-64 items-center justify-center text-slate-400">Loading...</div>;

  const all: PageRow[] = [...pages, ...SEO_ONLY_PAGES.map((page) => ({ page, count: -1 }))];
  const q = query.trim().toLowerCase();
  const shown = all.filter((p) => !q || `${p.page} ${pageLabel(p.page)}`.toLowerCase().includes(q));

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Pages</h2>
        <p className="text-sm text-slate-500">
          Edit the text, images and order of the sections on each page, in English and Arabic, and each page&apos;s search details.
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find a page..."
        aria-label="Find a page"
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
      />

      {PAGE_GROUPS.map((group) => {
        const rows = shown.filter((p) => pageGroup(p.page) === group);
        if (rows.length === 0) return null;
        return (
          <section key={group} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-800">{group}</h3>
              {GROUP_NOTES[group] && <p className="text-xs text-slate-500">{GROUP_NOTES[group]}</p>}
            </header>
            <ul className="divide-y divide-slate-100">
              {rows.map((p) => {
                const path = publicPath(p.page);
                const label = pageLabel(p.page);
                return (
                  <li key={p.page} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <Link href={adminPageHref(p.page)} className="text-sm font-medium text-slate-900 hover:text-cyan-700">
                        {label}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {path ?? p.page}
                        <span className="mx-2 text-slate-300">|</span>
                        {p.count < 0 ? "SEO only" : p.count === 0 ? "No blocks yet" : `${p.count} block${p.count === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {path && (
                        <>
                          <a href={path} target="_blank" rel="noopener noreferrer" className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label={`View ${label} in English`}>
                            View EN
                          </a>
                          <a href={arabicPath(path)} target="_blank" rel="noopener noreferrer" className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label={`View ${label} in Arabic`}>
                            View AR
                          </a>
                        </>
                      )}
                      <Link
                        href={adminPageHref(p.page)}
                        aria-label={`Edit ${label}`}
                        className="rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-cyan-700"
                      >
                        Edit
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
