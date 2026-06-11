"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/providers/settings-provider";
import { computePrice, findOverride } from "@/lib/pricing";
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
}

export default function SectorLandingForm({ sector, base, overrides, isEgypt, isSaudi }: Props) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { company } = useSettings();

  const [form, setForm] = useState({ company: "", email: "", phone: "", users: 5 });
  const [system, setSystem] = useState<SectorSystem | "">(sector.systems[0] ?? "");
  const [currency, setCurrency] = useState<"USD" | "EGP" | "SAR">(
    isEgypt ? "EGP" : "SAR"
  );
  const [showPrice, setShowPrice] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Geo detection: server-side props cover Vercel/CF; client-side covers everything else.
  useEffect(() => {
    if (isEgypt || isSaudi) return;
    fetch("/api/geo")
      .then((r) => r.json())
      .then((d) => {
        const c = d?.data?.currency as string | undefined;
        if (c === "EGP" || c === "SAR") setCurrency(c);
      })
      .catch(() => {});
  }, [isEgypt, isSaudi]);

  const breakdown = useMemo(() => {
    const ov = findOverride(overrides, sector.id, system || null);
    return computePrice(base, form.users, ov);
  }, [base, overrides, sector.id, system, form.users]);

  const fmt = (n: number) =>
    Math.round(n).toLocaleString(isAr ? "ar-EG" : "en-US");
  const usd = (n: number) => `$${fmt(n)}`;
  const egp = (n: number) => `${fmt(n * base.usdToEgp)} ${isAr ? "ج.م" : "EGP"}`;
  const sar = (n: number) => `${fmt(n * breakdown.usdToSar)} ${isAr ? "ر.س" : "SAR"}`;
  const price = (n: number) => currency === "EGP" ? egp(n) : currency === "SAR" ? sar(n) : usd(n);

  const sectorName = isAr ? sector.name.ar : sector.name.en;
  const sectorTitle = isAr ? sector.title.ar : sector.title.en;
  const sectorDesc = isAr ? sector.description.ar : sector.description.en;
  const embedUrl = toEmbedUrl(sector.videoUrl);

  function validate(): boolean {
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
        `الشركة: ${form.company}`,
        `البريد: ${form.email}`,
        `الهاتف: ${form.phone}`,
        `النظام: ${sysLabel}`,
        `عدد المستخدمين: ${form.users}`,
        `أيام التدريب: ${breakdown.trainingDays}`,
        `السعر قبل الخصم: ${price(breakdown.regular)}`,
        `الخصم: ${breakdown.discountPercent}%`,
        `السعر بعد الخصم: ${price(breakdown.total)} / سنة`,
        "",
        "السعر يشمل الاستضافة السحابية بالكامل.",
      ]
      : [
        `Quote request — ${sectorName} sector`,
        "",
        `Company: ${form.company}`,
        `Email: ${form.email}`,
        `Phone: ${form.phone}`,
        `System: ${sysLabel}`,
        `Users: ${form.users}`,
        `Training days: ${breakdown.trainingDays}`,
        `Price before discount: ${price(breakdown.regular)}`,
        `Discount: ${breakdown.discountPercent}%`,
        `Price after discount: ${price(breakdown.total)} / year`,
        "",
        "Price includes full cloud hosting.",
      ];
    return encodeURIComponent(lines.join("\n"));
  }

  async function handleSendToAI() {
    if (!validate()) return;
    setSending(true);
    setShowPrice(true);
    try {
      await fetch("/api/leads/sector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectorId: sector.id,
          sectorName,
          system,
          company: form.company,
          email: form.email,
          phone: form.phone,
          users: Number(form.users),
          currency,
          priceRegular: breakdown.regular,
          priceTotal: breakdown.total,
          trainingDays: breakdown.trainingDays,
        }),
      });
    } catch {
      /* non-fatal */
    } finally {
      setSending(false);
    }
    const wa = (company.whatsapp || "966568406006").replace(/\D/g, "");
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

        {/* Cloud note + currency toggle */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm font-medium text-primary-800">
          <span className="flex items-center gap-2"><span className="text-xl">☁️</span>{isAr ? "السعر يشمل الاستضافة السحابية بالكامل" : "Price includes full cloud hosting"}</span>
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
              <label className={labelCls}>{isAr ? "اسم الشركة" : "Company name"} *</label>
              <input className={inputCls} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{isAr ? "البريد الإلكتروني" : "Email"} *</label>
              <input className={inputCls} type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{isAr ? "رقم الهاتف" : "Phone"} *</label>
              <input className={inputCls} type="tel" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{isAr ? "النظام" : "System"} *</label>
              <select className={inputCls} value={system} onChange={(e) => setSystem(e.target.value as SectorSystem)}>
                {sector.systems.length === 0 && <option value="">—</option>}
                {sector.systems.map((s) => (
                  <option key={s} value={s}>{isAr ? SYSTEM_LABELS[s].ar : SYSTEM_LABELS[s].en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{isAr ? "عدد المستخدمين" : "Number of users"} *</label>
              <input className={inputCls} type="number" min={1} value={form.users} onChange={(e) => setForm({ ...form, users: Number(e.target.value) || 1 })} />
            </div>
          </div>

          <Button type="button" variant="outline" size="md" onClick={() => { if (validate()) setShowPrice(true); }} className="w-full">
            🧮 {isAr ? "احسب التكلفة" : "Calculate cost"}
          </Button>

          {/* Price breakdown */}
          {showPrice && (
            <div className="rounded-xl border-2 border-cta/30 bg-cta/5 p-5">
              <p className="mb-3 text-sm font-semibold text-text-primary">{isAr ? "تفاصيل التكلفة" : "Cost breakdown"}</p>
              <div className="space-y-1.5 text-sm text-text-secondary">
                <Row label={isAr ? `${breakdown.users} مستخدم × ${price(breakdown.pricePerUser)}` : `${breakdown.users} users × ${price(breakdown.pricePerUser)}`} value={price(breakdown.users * breakdown.pricePerUser)} />
                <Row label={isAr ? "الاستضافة" : "Hosting"} value={price(breakdown.hosting)} />
                <Row label={isAr ? "تكاليف التشغيل" : "Operating costs"} value={price(breakdown.operating)} />
                <Row label={isAr ? `التدريب (${breakdown.trainingDays} يوم)` : `Training (${breakdown.trainingDays} days)`} value={price(breakdown.trainingCost)} />
              </div>
              <div className="mt-3 border-t border-cta/20 pt-3">
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <span>{isAr ? "السعر العادي" : "Regular price"}</span>
                  <span className="line-through">{price(breakdown.regular)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-emerald-600">
                  <span>{isAr ? `الخصم (${breakdown.discountPercent}%)` : `Discount (${breakdown.discountPercent}%)`}</span>
                  <span>− {price(breakdown.discount)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-bold text-text-primary">{isAr ? "السعر بعد الخصم" : "Price after discount"}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-primary-600">{price(breakdown.total)}</span>
                    <span className="text-sm font-medium text-text-secondary">{isAr ? "/ سنة" : "/ year"}</span>
                  </div>
                </div>
                <p className="mt-0.5 text-end text-xs text-text-secondary">
                  {isAr ? "يُدفع سنوياً · شامل الاستضافة السحابية" : "Billed annually · includes full cloud hosting"}
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

          {/* Send to AI assistant */}
          <Button type="button" variant="cta" size="lg" onClick={handleSendToAI} disabled={sending} className="w-full">
            🤖 {sending ? (isAr ? "جارٍ الإرسال…" : "Sending…") : isAr ? "أرسل الطلب إلى المساعد الذكي" : "Send request to AI assistant"}
          </Button>
          <p className="text-center text-xs text-text-secondary">
            {isAr ? "سيتواصل معك مساعدنا الذكي بكامل تفاصيل عرض السعر." : "Our AI assistant will reach out with your full quote details."}
          </p>
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
