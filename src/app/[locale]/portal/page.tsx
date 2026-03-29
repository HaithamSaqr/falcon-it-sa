"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePortalUser } from "./layout";

interface TicketCounts {
  open: number;
  closed: number;
  total: number;
}

interface RecentTicket {
  id: number;
  ticketNumber: string;
  name: string;
  stage: string;
  stageClosed: boolean;
  priority: string;
  createdAt: string;
}

export default function PortalDashboard() {
  const t = useTranslations("portal");
  const { user } = usePortalUser();
  const [counts, setCounts] = useState<TicketCounts>({ open: 0, closed: 0, total: 0 });
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/tickets?limit=5")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setCounts(d.data.counts);
          setRecentTickets(d.data.tickets);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const priorityColors: Record<string, string> = {
    "0": "bg-gray-100 text-gray-700",
    "1": "bg-blue-100 text-blue-700",
    "2": "bg-amber-100 text-amber-700",
    "3": "bg-red-100 text-red-700",
  };

  const priorityLabels: Record<string, string> = {
    "0": t("priorityLow"),
    "1": t("priorityMedium"),
    "2": t("priorityHigh"),
    "3": t("priorityUrgent"),
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t("welcome", { name: user?.name || "" })}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{t("dashboardSubtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-text-secondary">{t("openTickets")}</p>
          <p className="mt-2 text-3xl font-bold text-primary-600">
            {loading ? "..." : counts.open}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-text-secondary">{t("closedTickets")}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {loading ? "..." : counts.closed}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-text-secondary">{t("totalTickets")}</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            {loading ? "..." : counts.total}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/portal/tickets/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("createTicket")}
        </Link>
        <Link
          href="/portal/tickets"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          {t("viewAllTickets")}
        </Link>
      </div>

      {/* Recent Tickets */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">{t("recentTickets")}</h2>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400">
            {t("loading")}
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-gray-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
            {t("noTickets")}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/portal/tickets/${ticket.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-secondary">
                      {ticket.ticketNumber}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColors[ticket.priority]}`}>
                      {priorityLabels[ticket.priority]}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-text-primary">
                    {ticket.name}
                  </p>
                </div>
                <div className="ms-4 flex shrink-0 items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    ticket.stageClosed ? "bg-gray-100 text-gray-600" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {ticket.stage}
                  </span>
                  <svg className="h-4 w-4 text-gray-400 rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
