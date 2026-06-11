"use client";

import { useEffect, useState } from "react";
import type { HomeContent, HomeCard, BilingualText } from "@/types/admin";
import ImageUpload from "@/components/admin/image-upload";

type Tab = "hero" | "whyErpFails" | "whyChoose" | "cta" | "stats" | "newsletter";

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
const labelClasses = "mb-1 block text-xs font-medium uppercase text-slate-400";

function TextPair({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: BilingualText;
  onChange: (v: BilingualText) => void;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className={labelClasses}>{label} (EN)</label>
        {multiline ? (
          <textarea rows={3} className={inputClasses} value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
        ) : (
          <input className={inputClasses} value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
        )}
      </div>
      <div>
        <label className={labelClasses}>{label} (AR)</label>
        {multiline ? (
          <textarea rows={3} dir="rtl" className={inputClasses} value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} />
        ) : (
          <input dir="rtl" className={inputClasses} value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} />
        )}
      </div>
    </div>
  );
}

function CardsEditor({
  cards,
  onChange,
}: {
  cards: HomeCard[];
  onChange: (cards: HomeCard[]) => void;
}) {
  const update = (i: number, patch: Partial<HomeCard>) => {
    const next = [...cards];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <div className="space-y-4">
      {cards.map((card, i) => (
        <div key={card.id} className="space-y-3 rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Card #{i + 1}</span>
            <button onClick={() => onChange(cards.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700">
              Remove
            </button>
          </div>
          <div className="flex items-end gap-3">
            <div className="w-24">
              <label className={labelClasses}>Icon</label>
              <input
                className={`${inputClasses} text-center text-xl`}
                value={card.icon}
                onChange={(e) => update(i, { icon: e.target.value })}
                placeholder="💸"
              />
            </div>
            <p className="pb-2 text-xs text-slate-400">Tip: paste an emoji as the card icon.</p>
          </div>
          <TextPair label="Title" value={card.title} onChange={(v) => update(i, { title: v })} />
          <TextPair label="Description" value={card.desc} onChange={(v) => update(i, { desc: v })} multiline />
        </div>
      ))}
      <button
        onClick={() =>
          onChange([
            ...cards,
            { id: crypto.randomUUID(), icon: "⭐", title: { en: "", ar: "" }, desc: { en: "", ar: "" } },
          ])
        }
        className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-700"
      >
        + Add Card
      </button>
    </div>
  );
}

export default function HomeAdminPage() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/home")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setHome(data.data);
      });
  }, []);

  async function handleSave() {
    if (!home) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/home", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(home),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!home) {
    return <div className="flex h-64 items-center justify-center"><p className="text-slate-400">Loading...</p></div>;
  }

  const set = (patch: Partial<HomeContent>) => setHome({ ...home, ...patch });

  const tabs: { key: Tab; label: string }[] = [
    { key: "hero", label: "Hero" },
    { key: "whyErpFails", label: "Why ERP Fails" },
    { key: "whyChoose", label: "Why Choose Falcon" },
    { key: "cta", label: "CTA Banner" },
    { key: "stats", label: "Stats" },
    { key: "newsletter", label: "Newsletter" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Home Page</h1>
        <p className="mt-1 text-sm text-slate-500">Manage every section of the public home page in both languages.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {/* ── Hero ── */}
        {activeTab === "hero" && (
          <div className="space-y-5">
            <TextPair label="Eyebrow" value={home.hero.eyebrow} onChange={(v) => set({ hero: { ...home.hero, eyebrow: v } })} />
            <TextPair label="Title" value={home.hero.title} onChange={(v) => set({ hero: { ...home.hero, title: v } })} />
            <TextPair label="Subtitle" value={home.hero.subtitle} onChange={(v) => set({ hero: { ...home.hero, subtitle: v } })} multiline />

            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-500">Primary button</span>
              <TextPair label="Label" value={home.hero.cta1.label} onChange={(v) => set({ hero: { ...home.hero, cta1: { ...home.hero.cta1, label: v } } })} />
              <div>
                <label className={labelClasses}>Link URL</label>
                <input className={inputClasses} value={home.hero.cta1.url} onChange={(e) => set({ hero: { ...home.hero, cta1: { ...home.hero.cta1, url: e.target.value } } })} placeholder="/contact" />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-500">Secondary button</span>
              <TextPair label="Label" value={home.hero.cta2.label} onChange={(v) => set({ hero: { ...home.hero, cta2: { ...home.hero.cta2, label: v } } })} />
              <div>
                <label className={labelClasses}>Link URL</label>
                <input className={inputClasses} value={home.hero.cta2.url} onChange={(e) => set({ hero: { ...home.hero, cta2: { ...home.hero.cta2, url: e.target.value } } })} placeholder="/demo" />
              </div>
            </div>

            <TextPair label="Trust point 1" value={home.hero.trust1} onChange={(v) => set({ hero: { ...home.hero, trust1: v } })} />
            <TextPair label="Trust point 2" value={home.hero.trust2} onChange={(v) => set({ hero: { ...home.hero, trust2: v } })} />

            <div>
              <label className={labelClasses}>Hero image (dashboard screenshot)</label>
              <ImageUpload value={home.hero.image} onChange={(url) => set({ hero: { ...home.hero, image: url } })} />
            </div>
          </div>
        )}

        {/* ── Why ERP Fails ── */}
        {activeTab === "whyErpFails" && (
          <div className="space-y-5">
            <TextPair label="Eyebrow label" value={home.whyErpFails.label} onChange={(v) => set({ whyErpFails: { ...home.whyErpFails, label: v } })} />
            <TextPair label="Heading" value={home.whyErpFails.heading} onChange={(v) => set({ whyErpFails: { ...home.whyErpFails, heading: v } })} />
            <TextPair label="Subheading" value={home.whyErpFails.subheading} onChange={(v) => set({ whyErpFails: { ...home.whyErpFails, subheading: v } })} multiline />
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Cards</h3>
              <CardsEditor cards={home.whyErpFails.cards} onChange={(cards) => set({ whyErpFails: { ...home.whyErpFails, cards } })} />
            </div>
          </div>
        )}

        {/* ── Why Choose Falcon ── */}
        {activeTab === "whyChoose" && (
          <div className="space-y-5">
            <TextPair label="Heading" value={home.whyChoose.heading} onChange={(v) => set({ whyChoose: { ...home.whyChoose, heading: v } })} />
            <TextPair label="Subheading" value={home.whyChoose.subheading} onChange={(v) => set({ whyChoose: { ...home.whyChoose, subheading: v } })} multiline />
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Cards</h3>
              <CardsEditor cards={home.whyChoose.cards} onChange={(cards) => set({ whyChoose: { ...home.whyChoose, cards } })} />
            </div>
          </div>
        )}

        {/* ── CTA Banner ── */}
        {activeTab === "cta" && (
          <div className="space-y-5">
            <TextPair label="Headline" value={home.cta.headline} onChange={(v) => set({ cta: { ...home.cta, headline: v } })} />
            <TextPair label="Subtitle" value={home.cta.subtitle} onChange={(v) => set({ cta: { ...home.cta, subtitle: v } })} multiline />
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-500">Primary button</span>
              <TextPair label="Label" value={home.cta.cta1.label} onChange={(v) => set({ cta: { ...home.cta, cta1: { ...home.cta.cta1, label: v } } })} />
              <div>
                <label className={labelClasses}>Link URL</label>
                <input className={inputClasses} value={home.cta.cta1.url} onChange={(e) => set({ cta: { ...home.cta, cta1: { ...home.cta.cta1, url: e.target.value } } })} placeholder="/contact" />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-500">Secondary button</span>
              <TextPair label="Label" value={home.cta.cta2.label} onChange={(v) => set({ cta: { ...home.cta, cta2: { ...home.cta.cta2, label: v } } })} />
              <div>
                <label className={labelClasses}>Link URL</label>
                <input className={inputClasses} value={home.cta.cta2.url} onChange={(e) => set({ cta: { ...home.cta, cta2: { ...home.cta.cta2, url: e.target.value } } })} placeholder="/demo" />
              </div>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        {activeTab === "stats" && (
          <div className="space-y-5">
            <TextPair label="Section heading" value={home.stats.heading} onChange={(v) => set({ stats: { ...home.stats, heading: v } })} />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Stat items</h3>
              {home.stats.items.map((item, i) => {
                const upd = (patch: Partial<typeof item>) => {
                  const items = [...home.stats.items];
                  items[i] = { ...item, ...patch };
                  set({ stats: { ...home.stats, items } });
                };
                return (
                  <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">Stat #{i + 1}</span>
                      <button onClick={() => set({ stats: { ...home.stats, items: home.stats.items.filter((_, j) => j !== i) } })} className="text-xs text-red-500 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelClasses}>Value</label>
                        <input type="number" className={inputClasses} value={item.value} onChange={(e) => upd({ value: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className={labelClasses}>Suffix</label>
                        <input className={inputClasses} value={item.suffix} onChange={(e) => upd({ suffix: e.target.value })} placeholder="+" />
                      </div>
                    </div>
                    <TextPair label="Label" value={item.label} onChange={(v) => upd({ label: v })} />
                  </div>
                );
              })}
              <button
                onClick={() => set({ stats: { ...home.stats, items: [...home.stats.items, { value: 0, suffix: "+", label: { en: "", ar: "" } }] } })}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-700"
              >
                + Add Stat
              </button>
            </div>
          </div>
        )}

        {/* ── Newsletter ── */}
        {activeTab === "newsletter" && (
          <div className="space-y-5">
            <TextPair label="Heading" value={home.newsletter.heading} onChange={(v) => set({ newsletter: { ...home.newsletter, heading: v } })} />
            <TextPair label="Subtitle" value={home.newsletter.subtitle} onChange={(v) => set({ newsletter: { ...home.newsletter, subtitle: v } })} multiline />
            <p className="text-xs text-slate-400">The email field, button and success message stay localized automatically.</p>
          </div>
        )}
      </div>

      {/* Save */}
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
