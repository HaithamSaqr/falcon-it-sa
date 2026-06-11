"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/types/admin";

type Tab = "hero" | "testimonials" | "faqs";

export default function ContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setContent(data.data);
      });
  }, []);

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!content) {
    return <div className="flex h-64 items-center justify-center"><p className="text-slate-400">Loading...</p></div>;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "hero", label: "Hero Section" },
    { key: "testimonials", label: "Testimonials" },
    { key: "faqs", label: "FAQs" },
  ];

  const inputClasses =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const labelClasses = "mb-1 block text-xs font-medium uppercase text-slate-400";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {/* Hero */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-slate-700">Hero Section (English)</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClasses}>Title</label>
                <input
                  value={content.hero.en.title}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, en: { ...content.hero.en, title: e.target.value } } })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Subtitle</label>
                <input
                  value={content.hero.en.subtitle}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, en: { ...content.hero.en, subtitle: e.target.value } } })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>CTA 1 Text</label>
                <input
                  value={content.hero.en.cta1Text}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, en: { ...content.hero.en, cta1Text: e.target.value } } })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>CTA 2 Text</label>
                <input
                  value={content.hero.en.cta2Text}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, en: { ...content.hero.en, cta2Text: e.target.value } } })}
                  className={inputClasses}
                />
              </div>
            </div>

            <h3 className="mt-8 text-sm font-semibold text-slate-700">Hero Section (Arabic)</h3>
            <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={`${labelClasses} text-right`}>العنوان</label>
                <input
                  value={content.hero.ar.title}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, ar: { ...content.hero.ar, title: e.target.value } } })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={`${labelClasses} text-right`}>العنوان الفرعي</label>
                <input
                  value={content.hero.ar.subtitle}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, ar: { ...content.hero.ar, subtitle: e.target.value } } })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={`${labelClasses} text-right`}>زر 1</label>
                <input
                  value={content.hero.ar.cta1Text}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, ar: { ...content.hero.ar, cta1Text: e.target.value } } })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={`${labelClasses} text-right`}>زر 2</label>
                <input
                  value={content.hero.ar.cta2Text}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, ar: { ...content.hero.ar, cta2Text: e.target.value } } })}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        )}

        {/* FAQs */}
        {activeTab === "faqs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">FAQs</h3>
              <button
                onClick={() => {
                  setContent({
                    ...content,
                    faqs: [
                      ...content.faqs,
                      { id: crypto.randomUUID(), question: { en: "", ar: "" }, answer: { en: "", ar: "" } },
                    ],
                  });
                }}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-700"
              >
                + Add FAQ
              </button>
            </div>
            {content.faqs.map((faq, i) => (
              <div key={faq.id} className="space-y-3 rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">FAQ #{i + 1}</span>
                  <button
                    onClick={() => {
                      setContent({ ...content, faqs: content.faqs.filter((_, j) => j !== i) });
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClasses}>Question (EN)</label>
                    <input
                      value={faq.question.en}
                      onChange={(e) => {
                        const updated = [...content.faqs];
                        updated[i] = { ...faq, question: { ...faq.question, en: e.target.value } };
                        setContent({ ...content, faqs: updated });
                      }}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Question (AR)</label>
                    <input
                      value={faq.question.ar}
                      onChange={(e) => {
                        const updated = [...content.faqs];
                        updated[i] = { ...faq, question: { ...faq.question, ar: e.target.value } };
                        setContent({ ...content, faqs: updated });
                      }}
                      className={inputClasses}
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Answer (EN)</label>
                    <textarea
                      value={faq.answer.en}
                      onChange={(e) => {
                        const updated = [...content.faqs];
                        updated[i] = { ...faq, answer: { ...faq.answer, en: e.target.value } };
                        setContent({ ...content, faqs: updated });
                      }}
                      rows={2}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Answer (AR)</label>
                    <textarea
                      value={faq.answer.ar}
                      onChange={(e) => {
                        const updated = [...content.faqs];
                        updated[i] = { ...faq, answer: { ...faq.answer, ar: e.target.value } };
                        setContent({ ...content, faqs: updated });
                      }}
                      rows={2}
                      className={inputClasses}
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            ))}
            {content.faqs.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No FAQs yet. Click &quot;Add FAQ&quot; to get started.</p>
            )}
          </div>
        )}

        {/* Testimonials */}
        {activeTab === "testimonials" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Testimonials</h3>
              <button
                onClick={() => {
                  setContent({
                    ...content,
                    testimonials: [
                      ...content.testimonials,
                      { id: crypto.randomUUID(), name: "", role: "", company: "", quote: { en: "", ar: "" } },
                    ],
                  });
                }}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-700"
              >
                + Add Testimonial
              </button>
            </div>
            {content.testimonials.map((t, i) => (
              <div key={t.id} className="space-y-3 rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Testimonial #{i + 1}</span>
                  <button
                    onClick={() => {
                      setContent({ ...content, testimonials: content.testimonials.filter((_, j) => j !== i) });
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={labelClasses}>Name</label>
                    <input
                      value={t.name}
                      onChange={(e) => {
                        const updated = [...content.testimonials];
                        updated[i] = { ...t, name: e.target.value };
                        setContent({ ...content, testimonials: updated });
                      }}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Role</label>
                    <input
                      value={t.role}
                      onChange={(e) => {
                        const updated = [...content.testimonials];
                        updated[i] = { ...t, role: e.target.value };
                        setContent({ ...content, testimonials: updated });
                      }}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Company</label>
                    <input
                      value={t.company}
                      onChange={(e) => {
                        const updated = [...content.testimonials];
                        updated[i] = { ...t, company: e.target.value };
                        setContent({ ...content, testimonials: updated });
                      }}
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClasses}>Quote (EN)</label>
                    <textarea
                      value={t.quote.en}
                      onChange={(e) => {
                        const updated = [...content.testimonials];
                        updated[i] = { ...t, quote: { ...t.quote, en: e.target.value } };
                        setContent({ ...content, testimonials: updated });
                      }}
                      rows={2}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Quote (AR)</label>
                    <textarea
                      value={t.quote.ar}
                      onChange={(e) => {
                        const updated = [...content.testimonials];
                        updated[i] = { ...t, quote: { ...t.quote, ar: e.target.value } };
                        setContent({ ...content, testimonials: updated });
                      }}
                      rows={2}
                      className={inputClasses}
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            ))}
            {content.testimonials.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No testimonials yet. Click &quot;Add Testimonial&quot; to get started.</p>
            )}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-emerald-600">Saved successfully!</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
