"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/providers/settings-provider";
import { computePrice, findOverride } from "@/lib/pricing";
import type { VolumeDiscountTier } from "@/types/admin";
import { toEmbedUrl } from "@/lib/video";
import type { Sector, PricingBase, SectorPricingOverride, SectorSystem } from "@/types/admin";

const SYSTEM_LABELS: Record<SectorSystem, { en: string; ar: string }> = {
  desktop: { en: "Falcon Desktop", ar: "فالكون ديسك توب" },
  cloud: { en: "Falcon Cloud", ar: "فالكون كلاود" },
  odoo: { en: "Odoo", ar: "أودو" },
};

interface Props {
  sector: Sector;
  base: PricingBase;
  overrides: SectorPricingOverride[];
  isEgypt: boolean;
  isSaudi: boolean;
  /** Preselected & locked system (when arriving from a product page). */
  presetSystem?: string;
}

export default function SectorLandingForm({ sector, base, overrides, isEgypt, isSaudi, presetSystem }: Props) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { company, landingCta } = useSettings();
  const urlMode = landingCta?.mode === "url" && !!landingCta?.url;
  const ctaLabelOverride = (isAr ? landingCta?.label?.ar : landingCta?.label?.en)?.trim() || "";
  const ctaNoteOverride = (isAr ? landingCta?.note?.ar : landingCta?.note?.en)?.trim() || "";
  // Once the admin customizes the caption/note, an empty note hides the line
  // entirely (instead of falling back to the default subtitle).
  const ctaCustomized = ctaLabelOverride !== "" || ctaNoteOverride !== "";

  const lockedSystem =
    presetSystem && sector.systems.includes(presetSystem as SectorSystem)
      ? (presetSystem as SectorSystem)
      : null;

  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", users: 5 });
  const [system, setSystem] = useState<SectorSystem | "">(lockedSystem ?? sector.systems[0] ?? "");
  const [currency, setCurrency] = useState<"USD" | "EGP" | "SAR">(
    isEgypt ? "EGP" : "SAR"
  );
  const [showPrice, setShowPrice] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [shared, setShared] = useState(false);
  // Resolved landing video — starts as the default (matches SSR), then routes
  // by country → domain after mount. Precedence: country → domain → default.
  const [resolvedVideo, setResolvedVideo] = useState(sector.videoUrl);
  // Per-sector CTA override (null → use the global Landing CTA / WhatsApp number).
  const [sectorCta, setSectorCta] = useState<{ kind: "whatsapp" | "url"; value: string } | null>(null);

  // Geo detection: server-side props cover Vercel/CF; client-side covers everything else.
  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    const matchDomain = (dom: string) => {
      const d = dom.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
      return !!d && (host === d || host.endsWith("." + d));
    };

    const domainVideo = (sector.videoDomains ?? []).find((v) => matchDomain(v.domain))?.videoUrl || "";
    const ctaDomainHit = (sector.ctaDomains ?? []).find((v) => matchDomain(v.domain)) || null;

    const resolve = (code: string) => {
      const up = code.toUpperCase();
      // Video: country → domain → default
      const cv = up ? (sector.videoCountries ?? []).find((v) => v.country.toUpperCase() === up)?.videoUrl : "";
      setResolvedVideo((cv || domainVideo || sector.videoUrl) || "");
      // CTA override: country → domain → none (none → use global)
      const ctaCountryHit = up ? (sector.ctaCountries ?? []).find((v) => v.country.toUpperCase() === up) : null;
      const hit = ctaCountryHit || ctaDomainHit;
      setSectorCta(hit ? { kind: hit.kind, value: hit.value } : null);
    };

    if (isSaudi) resolve("SA");
    else if (isEgypt) resolve("EG");
    else {
      resolve(""); // domain-only first
      fetch("/api/geo")
        .then((r) => r.json())
        .then((d) => {
          const cur = d?.data?.currency as string | undefined;
          if (cur === "EGP" || cur === "SAR") setCurrency(cur);
          resolve(String(d?.data?.country || ""));
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEgypt, isSaudi, sector.id]);

  // Effective CTA (sector override wins over the global default).
  const effectiveUrlMode = sectorCta ? sectorCta.kind === "url" : urlMode;
  const effectiveUrl = sectorCta?.kind === "url" ? sectorCta.value : (landingCta?.url || "");
  const effectiveWhatsapp = (sectorCta?.kind === "whatsapp" ? sectorCta.value : company.whatsapp) || "966568406006";

  const breakdown = useMemo(() => {
    const ov = findOverride(overrides, sector.id, system || null);
    return computePrice(base, form.users, ov, system || null);
  }, [base, overrides, sector.id, system, form.users]);

  // "Price includes full cloud hosting" note — only when the matching pricing
  // override has it enabled in /admin/pricing.
  const showCloudHosting = useMemo(
    () => !!findOverride(overrides, sector.id, system || null)?.includesCloudHosting,
    [overrides, sector.id, system]
  );

  // Free technical support months — info only (override falls back to base).
  const freeSupportMonths = useMemo(() => {
    const ov = findOverride(overrides, sector.id, system || null);
    return ov?.freeSupportMonths ?? base.freeSupportMonths ?? 0;
  }, [overrides, sector.id, system, base.freeSupportMonths]);

  // No discount → show a single price (hide the struck-through "regular" line)
  // so the customer doesn't look for a missing discount.
  const hasDiscount = breakdown.discountPercent > 0 || breakdown.volumeDiscountPercent > 0;

  // Split the total into yearly (license + hosting) and one-time (operating +
  // training). Volume discount applies to the per-user license, the general
  // discount to hosting/operating/training. yearly + oneTime === breakdown.total.
  const yearlyTotal =
    breakdown.users * breakdown.pricePerUser * (1 - breakdown.volumeDiscountPercent / 100) +
    breakdown.hosting * (1 - breakdown.discountPercent / 100);
  const oneTimeTotal =
    (breakdown.operating + breakdown.trainingCost) * (1 - breakdown.discountPercent / 100);

  // Next volume discount tier hint
  const nextTier = useMemo((): (VolumeDiscountTier & { usersNeeded: number }) | null => {
    const ov = findOverride(overrides, sector.id, system || null);
    const tiers: VolumeDiscountTier[] = ov?.volumeDiscounts ?? base.volumeDiscounts ?? [];
    const sorted = [...tiers].sort((a, b) => a.minUsers - b.minUsers);
    const next = sorted.find((t) => t.minUsers > form.users);
    if (!next) return null;
    return { ...next, usersNeeded: next.minUsers - form.users };
  }, [base.volumeDiscounts, overrides, sector.id, system, form.users]);

  const fmt = (n: number) =>
    Math.round(n).toLocaleString(isAr ? "ar-EG" : "en-US");
  const usd = (n: number) => `$${fmt(n)}`;
  const egp = (n: number) => `${fmt(n * base.usdToEgp)} ${isAr ? "ج.م" : "EGP"}`;
  const sar = (n: number) => `${fmt(n * breakdown.usdToSar)} ${isAr ? "ر.س" : "SAR"}`;
  const price = (n: number) => currency === "EGP" ? egp(n) : currency === "SAR" ? sar(n) : usd(n);

  const sectorName = isAr ? sector.name.ar : sector.name.en;
  const sectorTitle = isAr ? sector.title.ar : sector.title.en;
  const sectorDesc = isAr ? sector.description.ar : sector.description.en;
  const embedUrl = toEmbedUrl(resolvedVideo);

  function validate(): boolean {
    if (form.name.trim().length < 2) return setError(isAr ? "الاسم مطلوب" : "Name required"), false;
    if (form.company.trim().length < 2) return setError(isAr ? "اسم الشركة مطلوب" : "Company name required"), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError(isAr ? "بريد غير صحيح" : "Invalid email"), false;
    if (form.phone.trim().length < 6) return setError(isAr ? "رقم الهاتف مطلوب" : "Phone required"), false;
    if (!system) return setError(isAr ? "اختر النظام" : "Select a system"), false;
    if (form.users < 1) return setError(isAr ? "عدد المستخدمين غير صحيح" : "Invalid users"), false;
    setError("");
    return true;
  }

  function buildWhatsApp(): string {
    const sysLabel = system ? (isAr ? SYSTEM_LABELS[system].ar : SYSTEM_LABELS[system].en) : "";
    const lines = isAr
      ? [
        `طلب عرض سعر — قطاع ${sectorName}`,
        "",
        `الاسم: ${form.name}`,
        `الشركة: ${form.company}`,
        `البريد: ${form.email}`,
        `الهاتف: ${form.phone}`,
        `النظام: ${sysLabel}`,
        `عدد المستخدمين: ${form.users}`,
        `أيام التدريب: ${breakdown.trainingDays}`,
        ...(freeSupportMonths > 0 ? [`دعم فني مجاني: ${freeSupportMonths} شهر`] : []),
        ...(hasDiscount ? [`السعر قبل الخصم: ${price(breakdown.regular)}`] : []),
        `سنوياً (الترخيص + الاستضافة): ${price(yearlyTotal)} / سنة`,
        ...(oneTimeTotal > 0 ? [`التشغيل + التدريب: ${price(oneTimeTotal)} (مرة واحدة)`] : []),
        `الإجمالي (السنة الأولى): ${price(breakdown.total)}`,
        ...(showCloudHosting ? ["", "السعر يشمل الاستضافة السحابية بالكامل."] : []),
      ]
      : [
        `Quote request — ${sectorName} sector`,
        "",
        `Name: ${form.name}`,
        `Company: ${form.company}`,
        `Email: ${form.email}`,
        `Phone: ${form.phone}`,
        `System: ${sysLabel}`,
        `Users: ${form.users}`,
        `Training days: ${breakdown.trainingDays}`,
        ...(freeSupportMonths > 0 ? [`Free technical support: ${freeSupportMonths} months`] : []),
        ...(hasDiscount ? [`Price before discount: ${price(breakdown.regular)}`] : []),
        `Yearly (license + hosting): ${price(yearlyTotal)} / year`,
        ...(oneTimeTotal > 0 ? [`Operating + training: ${price(oneTimeTotal)} (one-time)`] : []),
        `Total (first year): ${price(breakdown.total)}`,
        ...(showCloudHosting ? ["", "Price includes full cloud hosting."] : []),
      ];
    return encodeURIComponent(lines.join("\n"));
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = `${sectorTitle} — Falcon`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text: sectorDesc, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* user cancelled the share sheet — ignore */
    }
  }

  async function handleSendToAI() {
    if (!validate()) return;
    setSending(true);
    setShowPrice(true);

    // computePrice returns USD; convert every amount to the selected currency
    // so the lead / Odoo / SaaS link match exactly what the user sees.
    const rate = currency === "EGP" ? base.usdToEgp : currency === "SAR" ? breakdown.usdToSar : 1;
    const conv = (n: number) => Math.round(n * rate);
    const userTotal = breakdown.users * breakdown.pricePerUser;
    const baseDiscountAmt =
      ((breakdown.hosting + breakdown.operating + breakdown.trainingCost) * breakdown.discountPercent) / 100;
    const volumeDiscountAmt = (userTotal * breakdown.volumeDiscountPercent) / 100;
    const sysLabel = system ? (isAr ? SYSTEM_LABELS[system].ar : SYSTEM_LABELS[system].en) : "";

    try {
      await fetch("/api/leads/sector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectorId: sector.id,
          sectorName,
          system,
          systemLabel: sysLabel,
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          users: Number(form.users),
          currency,
          // All amounts below are in the selected currency.
          pricePerUser: conv(breakdown.pricePerUser),
          userTotal: conv(userTotal),
          hosting: conv(breakdown.hosting),
          operating: conv(breakdown.operating),
          trainingDays: breakdown.trainingDays,
          trainingCost: conv(breakdown.trainingCost),
          priceRegular: conv(breakdown.regular),
          discountPercent: breakdown.discountPercent,
          baseDiscount: conv(baseDiscountAmt),
          volumeDiscountPercent: breakdown.volumeDiscountPercent,
          volumeDiscount: conv(volumeDiscountAmt),
          priceTotal: conv(breakdown.total),
        }),
      });
    } catch {
      /* non-fatal */
    } finally {
      setSending(false);
    }

    // CTA: external link (sector override or global SaaS checkout) with details…
    if (effectiveUrlMode && effectiveUrl) {
      try {
        const u = new URL(effectiveUrl);
        u.searchParams.set("sector", sector.id);
        u.searchParams.set("sectorName", sectorName);
        u.searchParams.set("system", system || "");
        u.searchParams.set("users", String(form.users));
        u.searchParams.set("price", String(conv(breakdown.total)));
        u.searchParams.set("priceRegular", String(conv(breakdown.regular)));
        u.searchParams.set("currency", currency);
        u.searchParams.set("trainingDays", String(breakdown.trainingDays));
        u.searchParams.set("name", form.name);
        u.searchParams.set("company", form.company);
        u.searchParams.set("email", form.email);
        u.searchParams.set("phone", form.phone);
        window.open(u.toString(), "_blank", "noopener,noreferrer");
        return;
      } catch {
        /* invalid URL → fall back to WhatsApp below */
      }
    }

    // …or send via WhatsApp (sector override number or the global default).
    const wa = effectiveWhatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/${wa}?text=${buildWhatsApp()}`, "_blank", "noopener,noreferrer");
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-text-primary transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20";
  const labelCls = "mb-1.5 block text-sm font-medium text-text-primary";

  return (
    <section className="py-12 lg:py-16">
      <Container className="max-w-3xl">
        <Link href="/#sectors" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary-500">
          <span className="rtl:rotate-180">←</span>
          {isAr ? "كل القطاعات" : "All sectors"}
        </Link>

        {/* Sector header */}
        <div className={cn("relative overflow-hidden rounded-2xl p-8 text-center text-white", sector.gradient || "bg-gradient-to-br from-dark to-primary-800")}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <span className="text-5xl">{sector.icon}</span>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{sectorTitle}</h1>
            <p className="mx-auto mt-2 max-w-xl text-white/85">{sectorDesc}</p>
          </div>
        </div>

        {/* Embedded video */}
        {embedUrl && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={embedUrl}
                title={sectorTitle}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Cloud note (only when enabled on the pricing override) + currency toggle */}
        <div className={cn("mt-4 flex flex-wrap items-center gap-3", showCloudHosting ? "justify-between rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm font-medium text-primary-800" : "justify-end")}>
          {showCloudHosting && (
            <span className="flex items-center gap-2"><span className="text-xl">☁️</span>{isAr ? "السعر يشمل الاستضافة السحابية بالكامل" : "Price includes full cloud hosting"}</span>
          )}
          <div className="flex overflow-hidden rounded-lg border border-primary-300">
            {(["USD", "EGP", "SAR"] as const).map((c) => (
              <button key={c} type="button" onClick={() => setCurrency(c)} className={cn("px-3 py-1 text-xs font-semibold", currency === c ? "bg-primary-600 text-white" : "bg-white text-primary-700")}>{c}</button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="mt-6 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{isAr ? "احصل على عرض سعر فوري" : "Get an instant quote"}</h2>
            <p className="mt-1 text-sm text-text-secondary">{isAr ? "أدخل بياناتك واحسب التكلفة في ثوانٍ." : "Enter your details and calculate the cost in seconds."}</p>
          </div>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>{isAr ? "الاسم" : "Name"} *</label>
              <input className={inputCls} suppressHydrationWarning value={form.name} placeholder={isAr ? "اسمك الكريم" : "Your name"} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{isAr ? "اسم الشركة" : "Company name"} *</label>
              <input className={inputCls} suppressHydrationWarning value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{isAr ? "البريد الإلكتروني" : "Email"} *</label>
              <input className={inputCls} type="email" suppressHydrationWarning dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{isAr ? "رقم الهاتف" : "Phone"} *</label>
              <input className={inputCls} suppressHydrationWarning type="tel" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            {lockedSystem ? (
              // Preset from a product page — show the system as a read-only field.
              <div>
                <label className={labelCls}>{isAr ? "النظام" : "System"}</label>
                <div className={cn(inputCls, "flex items-center gap-2 bg-gray-50 text-text-secondary")}>
                  <span className="text-primary-600">✓</span>
                  {isAr ? SYSTEM_LABELS[lockedSystem].ar : SYSTEM_LABELS[lockedSystem].en}
                </div>
              </div>
            ) : (
              <div>
                <label className={labelCls}>{isAr ? "النظام" : "System"} *</label>
                <select className={inputCls} suppressHydrationWarning value={system} onChange={(e) => setSystem(e.target.value as SectorSystem)}>
                  {sector.systems.length === 0 && <option value="">—</option>}
                  {sector.systems.map((s) => (
                    <option key={s} value={s}>{isAr ? SYSTEM_LABELS[s].ar : SYSTEM_LABELS[s].en}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={labelCls}>{isAr ? "عدد المستخدمين" : "Number of users"} *</label>
              <input className={inputCls} suppressHydrationWarning type="number" min={1} value={form.users} onChange={(e) => setForm({ ...form, users: Number(e.target.value) || 1 })} />
            </div>
          </div>

          <div className="flex items-stretch gap-2">
            <Button type="button" variant="outline" size="md" onClick={() => { if (validate()) setShowPrice(true); }} className="flex-1">
              🧮 {isAr ? "احسب التكلفة" : "Calculate cost"}
            </Button>
            <button
              type="button"
              onClick={handleShare}
              aria-label={isAr ? "مشاركة الصفحة" : "Share page"}
              title={isAr ? "مشاركة" : "Share"}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-button)] border border-gray-300 px-3 text-sm font-medium text-text-secondary transition-colors hover:border-primary-500 hover:text-primary-500"
            >
              {shared ? (
                <span className="text-cta">✓</span>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
              )}
              <span className="hidden sm:inline">{shared ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "مشاركة" : "Share")}</span>
            </button>
          </div>

          {/* Price breakdown */}
          {showPrice && (
            <div className="rounded-xl border-2 border-cta/30 bg-cta/5 p-5">
              <p className="mb-3 text-sm font-semibold text-text-primary">{isAr ? "تفاصيل التكلفة" : "Cost breakdown"}</p>
              <div className="space-y-1.5 text-sm text-text-secondary">
                <Row label={isAr ? `${breakdown.users} مستخدم × ${price(breakdown.pricePerUser)}` : `${breakdown.users} users × ${price(breakdown.pricePerUser)}`} value={price(breakdown.users * breakdown.pricePerUser)} />
                <Row label={isAr ? "الاستضافة" : "Hosting"} value={price(breakdown.hosting)} />
                <Row label={`${isAr ? "تكاليف التشغيل" : "Operating costs"} ${isAr ? "· مرة واحدة" : "· one-time"}`} value={price(breakdown.operating)} />
                <Row label={`${isAr ? `التدريب (${breakdown.trainingDays} يوم)` : `Training (${breakdown.trainingDays} days)`} ${isAr ? "· مرة واحدة" : "· one-time"}`} value={price(breakdown.trainingCost)} />
                {freeSupportMonths > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">🎁 {isAr ? "دعم فني مجاني" : "Free technical support"}</span>
                    <span className="font-semibold text-emerald-600">
                      {isAr ? `${freeSupportMonths} ${freeSupportMonths >= 3 && freeSupportMonths <= 10 ? "أشهر" : "شهر"} مجاناً` : `${freeSupportMonths} month${freeSupportMonths === 1 ? "" : "s"} free`}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-3 border-t border-cta/20 pt-3 space-y-1.5">
                {hasDiscount && (
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>{isAr ? "السعر العادي" : "Regular price"}</span>
                    <span className="line-through">{price(breakdown.regular)}</span>
                  </div>
                )}
                {breakdown.discountPercent > 0 && (
                  <div className="flex items-center justify-between text-sm text-emerald-600">
                    <span>{isAr ? `خصم أساسي (${breakdown.discountPercent}% عدا سعر المستخدم)` : `Base discount (${breakdown.discountPercent}%, excl. per-user)`}</span>
                    <span>− {price((breakdown.hosting + breakdown.operating + breakdown.trainingCost) * breakdown.discountPercent / 100)}</span>
                  </div>
                )}
                {breakdown.volumeDiscountPercent > 0 && (
                  <div className="flex items-center justify-between text-sm text-emerald-500">
                    <span>{isAr ? `خصم الكمية (${breakdown.volumeDiscountPercent}% على سعر المستخدم)` : `Volume discount (${breakdown.volumeDiscountPercent}% on per-user)`}</span>
                    <span>− {price(breakdown.users * breakdown.pricePerUser * breakdown.volumeDiscountPercent / 100)}</span>
                  </div>
                )}
                {nextTier && (
                  <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    {isAr
                      ? `أضف ${nextTier.usersNeeded} مستخدم${nextTier.usersNeeded === 1 ? "" : "ين"} للحصول على خصم إضافي ${nextTier.discountPercent}%`
                      : `Add ${nextTier.usersNeeded} more user${nextTier.usersNeeded === 1 ? "" : "s"} to unlock +${nextTier.discountPercent}% off`}
                  </div>
                )}
                {/* Yearly vs one-time split */}
                <div className={cn("mt-1 space-y-1.5 border-t border-cta/20 pt-3")}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{isAr ? "سنوياً (الترخيص + الاستضافة)" : "Yearly (license + hosting)"}</span>
                    <span className="font-semibold text-text-primary">
                      {price(yearlyTotal)} <span className="font-normal text-text-secondary">{isAr ? "/ سنة" : "/ year"}</span>
                    </span>
                  </div>
                  {oneTimeTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{isAr ? "التشغيل + التدريب" : "Operating + training"}</span>
                      <span className="font-semibold text-text-primary">
                        {price(oneTimeTotal)} <span className="font-normal text-amber-600">{isAr ? "· مرة واحدة" : "· one-time"}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* First-year total */}
                <div className="mt-1 flex items-center justify-between border-t border-cta/20 pt-2">
                  <span className="font-bold text-text-primary">{isAr ? "الإجمالي (السنة الأولى)" : "Total (first year)"}</span>
                  <span className="text-2xl font-extrabold text-primary-600">{price(breakdown.total)}</span>
                </div>
                <p className="text-end text-xs text-text-secondary">
                  {isAr
                    ? `الترخيص والاستضافة يتجددان سنوياً · التشغيل والتدريب مرة واحدة${showCloudHosting ? " · شامل الاستضافة السحابية" : ""}`
                    : `License & hosting renew yearly · operating & training are one-time${showCloudHosting ? " · includes full cloud hosting" : ""}`}
                </p>
              </div>
              {isEgypt && currency !== "EGP" && (
                <p className="mt-2 text-xs text-text-secondary">≈ {egp(breakdown.total)}</p>
              )}
              {isSaudi && currency !== "SAR" && (
                <p className="mt-2 text-xs text-text-secondary">≈ {sar(breakdown.total)}</p>
              )}
            </div>
          )}

          {/* CTA — WhatsApp (default) or external link / SaaS checkout */}
          <Button type="button" variant="cta" size="lg" onClick={handleSendToAI} disabled={sending} className="w-full">
            {effectiveUrlMode ? "🛒 " : "🤖 "}
            {sending
              ? isAr ? "جارٍ المتابعة…" : "Processing…"
              : ctaLabelOverride ||
                (effectiveUrlMode
                  ? isAr ? "أكمل طلبك الآن" : "Continue to your order"
                  : isAr ? "أرسل الطلب إلى المساعد الذكي" : "Send request to AI assistant")}
          </Button>
          {(ctaNoteOverride || !ctaCustomized) && (
            <p className="text-center text-xs text-text-secondary">
              {ctaNoteOverride ||
                (effectiveUrlMode
                  ? isAr ? "سيتم نقلك لإكمال طلبك واشتراكك مع تفاصيل عرض السعر." : "You'll be taken to complete your order with the quote details."
                  : isAr ? "سيتواصل معك مساعدنا الذكي بكامل تفاصيل عرض السعر." : "Our AI assistant will reach out with your full quote details.")}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}
