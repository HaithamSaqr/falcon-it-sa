"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface Ticket {
  id: number;
  ticketNumber: string;
  name: string;
  stage: string;
  stageClosed: boolean;
  priority: string;
  categoryName: string;
  teamName: string;
  assignedTo: string;
  createdAt: string;
  closedAt: string | null;
}

export default function TicketsListPage() {
  const t = useTranslations("portal");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ open: 0, closed: 0, total: 0 });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/portal/tickets?filter=${filter}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setTickets(d.data.tickets);
          setCounts(d.data.counts);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t("myTickets")}</h1>
        <Link
          href="/portal/tickets/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("createTicket")}
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {(["all", "open", "closed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-white text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t(`filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
            <span className="ms-1.5 text-xs opacity-60">
              ({f === "all" ? counts.total : f === "open" ? counts.open : counts.closed})
            </span>
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">
            {t("loading")}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 text-sm text-gray-400">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
            {t("noTicketsFilter")}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wide text-text-secondary">#</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("subject")}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("priority")}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("status")}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("category")}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("date")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/portal/tickets/${ticket.id}`} className="text-xs font-mono text-primary-600 hover:underline">
                          {ticket.ticketNumber}
                        </Link>
                      </td>
                      <td className="max-w-xs truncate px-6 py-4">
                        <Link href={`/portal/tickets/${ticket.id}`} className="text-sm font-medium text-text-primary hover:text-primary-600">
                          {ticket.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColors[ticket.priority]}`}>
                          {priorityLabels[ticket.priority]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          ticket.stageClosed ? "bg-gray-100 text-gray-600" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {ticket.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-secondary">
                        {ticket.categoryName || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-text-secondary">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-gray-100 md:hidden">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/portal/tickets/${ticket.id}`}
                  className="block px-4 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-text-secondary">{ticket.ticketNumber}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColors[ticket.priority]}`}>
                          {priorityLabels[ticket.priority]}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-text-primary">{ticket.name}</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ""}
                        {ticket.categoryName && ` · ${ticket.categoryName}`}
                      </p>
                    </div>
                    <span className={`ms-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      ticket.stageClosed ? "bg-gray-100 text-gray-600" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {ticket.stage}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
