"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/admin/stat-card";
import StatusBadge from "@/components/admin/status-badge";
import { BarChart, LineChart } from "@/components/admin/chart";
import type { AnalyticsData, Lead } from "@/types/admin";

const TYPE_COLORS: Record<string, string> = {
  demo: "#0891b2",
  contact: "#6366f1",
  newsletter: "#10b981",
  calculator: "#f59e0b",
  trial: "#ec4899",
  partner: "#8b5cf6",
};

const TYPE_LABELS: Record<string, string> = {
  demo: "Demo",
  contact: "Contact",
  newsletter: "Newsletter",
  calculator: "Calculator",
  trial: "Trial",
  partner: "Partner",
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/analytics").then((r) => r.json()),
      fetch("/api/admin/leads?limit=8").then((r) => r.json()),
    ]).then(([analyticsRes, leadsRes]) => {
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (leadsRes.success) setRecentLeads(leadsRes.data.leads);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    );
  }

  if (!analytics) return null;

  const weekChange =
    analytics.lastWeek > 0
      ? Math.round(((analytics.thisWeek - analytics.lastWeek) / analytics.lastWeek) * 100)
      : analytics.thisWeek > 0
        ? 100
        : 0;

  const barData = Object.entries(analytics.byType || {}).map(([key, value]) => ({
    label: TYPE_LABELS[key] || key,
    value: value as number,
    color: TYPE_COLORS[key] || "#94a3b8",
  }));

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={analytics.totalLeads} />
        <StatCard
          label="This Week"
          value={analytics.thisWeek}
          change={{
            value: weekChange,
            trend: weekChange > 0 ? "up" : weekChange < 0 ? "down" : "neutral",
          }}
        />
        <StatCard label="Conversion Rate" value={`${analytics.conversionRate}%`} />
        <StatCard
          label="Most Popular"
          value={
            barData.length > 0
              ? barData.reduce((a, b) => (a.value > b.value ? a : b)).label
              : "N/A"
          }
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Type */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Leads by Type</h3>
          {barData.length > 0 ? (
            <BarChart data={barData} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No data yet</p>
          )}
        </div>

        {/* Over Time */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Leads Over Time (30 Days)
          </h3>
          {analytics.byDay?.length > 0 ? (
            <LineChart data={analytics.byDay.map((d) => ({ label: d.date.slice(5), value: d.count }))} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No data yet</p>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-700">Recent Leads</h3>
          <Link
            href="/admin/leads"
            className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentLeads.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-400">
              No leads yet. They will appear here when forms are submitted.
            </p>
          ) : (
            recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {(lead.data.fullName as string) ||
                      (lead.data.name as string) ||
                      (lead.data.email as string) ||
                      "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(lead.data.email as string) || ""}{" "}
                    {lead.data.company ? `· ${lead.data.company}` : ""}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-500">
                    {lead.type}
                  </span>
                  <StatusBadge status={lead.status} />
                  <span className="text-xs text-slate-400">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Top Countries & Industries */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Top Countries</h3>
          {analytics.topCountries.length > 0 ? (
            <div className="space-y-2">
              {analytics.topCountries.map((c) => (
                <div key={c.country} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 capitalize">{c.country}</span>
                  <span className="text-sm font-medium text-slate-900">{c.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No data yet</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Top Industries</h3>
          {analytics.topIndustries.length > 0 ? (
            <div className="space-y-2">
              {analytics.topIndustries.map((i) => (
                <div key={i.industry} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 capitalize">{i.industry}</span>
                  <span className="text-sm font-medium text-slate-900">{i.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
