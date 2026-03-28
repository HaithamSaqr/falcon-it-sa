"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import StatusBadge from "@/components/admin/status-badge";
import type { Lead, LeadStatus, LeadType, LeadsResponse } from "@/types/admin";

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "demo", label: "Demo" },
  { value: "contact", label: "Contact" },
  { value: "newsletter", label: "Newsletter" },
  { value: "calculator", label: "Calculator" },
  { value: "trial", label: "Trial" },
  { value: "partner", label: "Partner" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filters
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", "20");

    const res = await fetch(`/api/admin/leads?${params}`);
    const data = await res.json();
    if (data.success) {
      const r = data.data as LeadsResponse;
      setLeads(r.leads);
      setTotal(r.total);
      setTotalPages(r.totalPages);
    }
    setLoading(false);
  }, [type, status, search, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function handleBulkStatus(newStatus: LeadStatus) {
    if (selected.size === 0) return;
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), status: newStatus }),
    });
    setSelected(new Set());
    fetchLeads();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === leads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(leads.map((l) => l.id)));
    }
  }

  function exportCSV() {
    const headers = ["Date", "Type", "Status", "Name", "Email", "Phone", "Company", "Country", "Industry"];
    const rows = leads.map((l) => [
      new Date(l.createdAt).toLocaleDateString(),
      l.type,
      l.status,
      (l.data.fullName as string) || (l.data.name as string) || "",
      (l.data.email as string) || "",
      (l.data.phone as string) || "",
      (l.data.company as string) || "",
      (l.data.country as string) || "",
      (l.data.industry as string) || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `falcon-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const selectClasses =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name, email, company..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
        />
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className={selectClasses}
        >
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className={selectClasses}
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-slate-500">{total} leads</span>
          <button onClick={exportCSV} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Export CSV
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-cyan-50 px-4 py-2.5">
          <span className="text-sm font-medium text-cyan-700">{selected.size} selected</span>
          <div className="flex gap-2">
            {(["contacted", "qualified", "converted", "lost"] as LeadStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => handleBulkStatus(s)}
                className="rounded bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                Mark {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={leads.length > 0 && selected.size === leads.length}
                    onChange={toggleAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Contact</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Source</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/${lead.id}`} className="group">
                        <p className="font-medium text-slate-900 group-hover:text-cyan-600">
                          {(lead.data.fullName as string) || (lead.data.name as string) || (lead.data.email as string) || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(lead.data.email as string) || ""}
                          {lead.data.company ? ` · ${lead.data.company}` : ""}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                        {lead.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{lead.source || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
