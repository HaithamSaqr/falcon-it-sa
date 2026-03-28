"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/admin/status-badge";
import type { Lead, LeadStatus } from "@/types/admin";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "converted", "lost"];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/leads/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setLead(data.data);
          setNotes(data.data.notes || "");
        }
        setLoading(false);
      });
  }, [id]);

  async function handleStatusChange(status: LeadStatus) {
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) setLead(data.data);
    setSaving(false);
  }

  async function handleSaveNotes() {
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    const data = await res.json();
    if (data.success) setLead(data.data);
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    router.push("/admin/leads");
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><p className="text-slate-400">Loading...</p></div>;
  }

  if (!lead) {
    return <div className="flex h-64 items-center justify-center"><p className="text-slate-400">Lead not found</p></div>;
  }

  // Get display fields from lead data
  const fields = Object.entries(lead.data)
    .filter(([key]) => !["consent", "newsletter", "locale"].includes(key))
    .map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      value: String(value ?? "—"),
    }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-cyan-600">
        &larr; Back to leads
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {(lead.data.fullName as string) || (lead.data.name as string) || (lead.data.email as string) || "Lead"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {lead.type.toUpperCase()} lead · Created {new Date(lead.createdAt).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      {/* Status changer */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Status</h3>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={saving || lead.status === s}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                lead.status === s
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              } disabled:opacity-50`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lead Data */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Lead Information</h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-xs font-medium uppercase text-slate-400">{f.label}</dt>
              <dd className="mt-0.5 text-sm text-slate-900">{f.value}</dd>
            </div>
          ))}
        </dl>
        {lead.source && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <dt className="text-xs font-medium uppercase text-slate-400">Source URL</dt>
            <dd className="mt-0.5 text-sm text-slate-600">{lead.source}</dd>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Admin Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add internal notes about this lead..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
        />
        <button
          onClick={handleSaveNotes}
          disabled={saving}
          className="mt-3 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Notes"}
        </button>
      </div>

      {/* Delete */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
        <p className="mt-1 text-sm text-red-600">
          Deleting this lead is permanent and cannot be undone.
        </p>
        <button
          onClick={handleDelete}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Delete Lead
        </button>
      </div>
    </div>
  );
}
