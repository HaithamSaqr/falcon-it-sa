"use client";

import { useState, useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface TicketDetail {
  id: number;
  ticketNumber: string;
  name: string;
  description: string;
  stage: string;
  stageClosed: boolean;
  priority: string;
  categoryName: string;
  teamName: string;
  assignedTo: string;
  createdAt: string;
  closedAt: string | null;
  slaDeadline: string | null;
  slaStatus: string;
  rating: string;
  ratingComment: string;
}

interface Message {
  id: number;
  body: string;
  author: string;
  date: string;
  type: "comment" | "notification";
}

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("portal");
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState("");
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/portal/tickets/${id}`).then((r) => r.json()),
      fetch(`/api/portal/tickets/${id}/messages`).then((r) => r.json()),
    ])
      .then(([ticketRes, messagesRes]) => {
        if (ticketRes.data) setTicket(ticketRes.data);
        if (messagesRes.data) setMessages(messagesRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);

    try {
      const res = await fetch(`/api/portal/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply }),
      });
      const data = await res.json();
      if (data.success) {
        setReply("");
        // Refresh messages
        const msgs = await fetch(`/api/portal/tickets/${id}/messages`).then((r) => r.json());
        if (msgs.data) setMessages(msgs.data);
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  }

  async function handleRating(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    setRatingSubmitting(true);

    try {
      const res = await fetch(`/api/portal/tickets/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: ratingComment }),
      });
      const data = await res.json();
      if (data.success) {
        setRatingSubmitted(true);
      }
    } catch {
      // silently fail
    } finally {
      setRatingSubmitting(false);
    }
  }

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

  const slaColors: Record<string, string> = {
    on_track: "text-emerald-600",
    warning: "text-amber-600",
    failed: "text-red-600",
    achieved: "text-emerald-600",
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">
        {t("loading")}
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 text-sm text-gray-400">
        {t("ticketNotFound")}
        <Link href="/portal/tickets" className="text-primary-500 hover:underline">
          {t("backToTickets")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link href="/portal/tickets" className="hover:text-primary-500">
          {t("myTickets")}
        </Link>
        <span className="rtl:rotate-180">/</span>
        <span className="font-medium text-text-primary">{ticket.ticketNumber}</span>
      </div>

      {/* Ticket Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-mono text-text-secondary">{ticket.ticketNumber}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColors[ticket.priority]}`}>
                {priorityLabels[ticket.priority]}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                ticket.stageClosed ? "bg-gray-100 text-gray-600" : "bg-emerald-100 text-emerald-700"
              }`}>
                {ticket.stage}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-text-primary">{ticket.name}</h1>
          </div>
        </div>

        {/* Ticket Info Grid */}
        <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label={t("category")} value={ticket.categoryName || "—"} />
          <InfoItem label={t("team")} value={ticket.teamName || "—"} />
          <InfoItem label={t("assignedTo")} value={ticket.assignedTo || "—"} />
          <InfoItem
            label={t("created")}
            value={ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "—"}
          />
          {ticket.slaDeadline && (
            <InfoItem
              label={t("slaDeadline")}
              value={new Date(ticket.slaDeadline).toLocaleString()}
              className={slaColors[ticket.slaStatus] || ""}
            />
          )}
          {ticket.closedAt && (
            <InfoItem
              label={t("closedDate")}
              value={new Date(ticket.closedAt).toLocaleDateString()}
            />
          )}
        </div>
      </div>

      {/* Description */}
      {ticket.description && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            {t("description")}
          </h2>
          <div
            className="prose prose-sm max-w-none text-text-primary"
            dangerouslySetInnerHTML={{ __html: ticket.description }}
          />
        </div>
      )}

      {/* Messages / Conversation */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">{t("conversation")}</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {messages.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              {t("noMessages")}
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`px-6 py-4 ${msg.type === "notification" ? "bg-gray-50" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{msg.author}</span>
                  <span className="text-xs text-text-secondary">
                    {msg.date ? new Date(msg.date).toLocaleString() : ""}
                  </span>
                  {msg.type === "notification" && (
                    <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[9px] font-medium text-gray-600">
                      {t("system")}
                    </span>
                  )}
                </div>
                <div
                  className="mt-2 text-sm text-text-secondary prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: msg.body }}
                />
              </div>
            ))
          )}
        </div>

        {/* Reply Form */}
        {!ticket.stageClosed && (
          <div className="border-t border-gray-200 px-6 py-4">
            <form onSubmit={handleReply} className="flex gap-3">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={t("replyPlaceholder")}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-text-primary transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="shrink-0 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
              >
                {sending ? "..." : t("send")}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Rating Section (only for closed tickets) */}
      {ticket.stageClosed && !ratingSubmitted && ticket.rating === "0" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">{t("rateExperience")}</h2>
          <form onSubmit={handleRating} className="space-y-4">
            <div className="flex gap-2">
              {["1", "2", "3", "4", "5"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 text-lg transition-colors ${
                    rating === r
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {r === "1" ? "1" : r === "2" ? "2" : r === "3" ? "3" : r === "4" ? "4" : "5"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span>{t("veryDissatisfied")}</span>
              <span className="flex-1 border-t border-gray-200" />
              <span>{t("verySatisfied")}</span>
            </div>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder={t("ratingCommentPlaceholder")}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-text-primary transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <button
              type="submit"
              disabled={!rating || ratingSubmitting}
              className="rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              {ratingSubmitting ? "..." : t("submitRating")}
            </button>
          </form>
        </div>
      )}

      {/* Rating already submitted */}
      {(ratingSubmitted || (ticket.rating && ticket.rating !== "0")) && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-sm font-medium text-emerald-700">{t("ratingThanks")}</p>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</p>
      <p className={`mt-1 text-sm font-medium text-text-primary ${className}`}>{value}</p>
    </div>
  );
}
