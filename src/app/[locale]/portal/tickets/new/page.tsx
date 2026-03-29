"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Category {
  id: number;
  name: string;
}

export default function NewTicketPage() {
  const t = useTranslations("portal");
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [priority, setPriority] = useState("1");
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/portal/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setCategories(d.data);
      })
      .catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (subject.length < 3) {
      setError(t("subjectRequired"));
      return;
    }
    if (description.length < 10) {
      setError(t("descriptionRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description, categoryId, priority }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/portal/tickets/${data.data.ticketId}`);
      } else {
        setError(data.error || t("createFailed"));
      }
    } catch {
      setError(t("networkError"));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-text-primary transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20";
  const labelClasses = "mb-1.5 block text-sm font-medium text-text-primary";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t("createTicket")}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t("createTicketSubtitle")}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subject */}
          <div>
            <label htmlFor="subject" className={labelClasses}>
              {t("subject")} *
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClasses}
              placeholder={t("subjectPlaceholder")}
              required
            />
          </div>

          {/* Category & Priority */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className={labelClasses}>
                {t("category")}
              </label>
              <select
                id="category"
                value={categoryId || ""}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                className={inputClasses}
              >
                <option value="">{t("selectCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className={labelClasses}>
                {t("priority")}
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputClasses}
              >
                <option value="0">{t("priorityLow")}</option>
                <option value="1">{t("priorityMedium")}</option>
                <option value="2">{t("priorityHigh")}</option>
                <option value="3">{t("priorityUrgent")}</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClasses}>
              {t("description")} *
            </label>
            <textarea
              id="description"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClasses} resize-none`}
              placeholder={t("descriptionPlaceholder")}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              {submitting ? "..." : t("submitTicket")}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
