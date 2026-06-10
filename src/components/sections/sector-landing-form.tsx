"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getSector,
  calculateSectorCost,
  SECTOR_WHATSAPP,
  type SectorCost,
} from "@/lib/sectors";
import { sectorLeadSchema, type SectorLeadData } from "@/lib/validations";

export default function SectorLandingForm({ slug }: { slug: string }) {
  const t = useTranslations("sectors");
  const locale = useLocale();
  const sector = getSector(slug);
  const [cost, setCost] = useState<SectorCost | null>(null);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<SectorLeadData>({
    resolver: zodResolver(sectorLeadSchema),
    defaultValues: { users: 5 },
  });

  if (!sector) return null;

  const sectorName = t(`items.${slug}.name`);
  const currency = t("currency");
  const fmt = (n: number) => n.toLocaleString(locale === "ar" ? "ar-SA" : "en-US");

  function handleCalculate() {
    const users = Number(watch("users")) || 0;
    setCost(calculateSectorCost(users));
  }

  function onSubmit(data: SectorLeadData) {
    const c = calculateSectorCost(data.users);
    setCost(c);

    const lines = [
      t("landing.whatsappHeader", { sector: sectorName }),
      "",
      `${t("landing.company")}: ${data.company}`,
      `${t("landing.email")}: ${data.email}`,
      `${t("landing.phone")}: ${data.phone}`,
      `${t("landing.users")}: ${data.users}`,
      `${t("landing.estimateTitle")}: ${fmt(c.monthly)} ${currency}/${t("landing.monthly")} — ${fmt(c.yearly)} ${currency}/${t("landing.yearly")}`,
      "",
      t("landing.planIncludesCloud"),
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(
      `https://wa.me/${SECTOR_WHATSAPP}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-text-primary transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20";
  const labelClasses = "mb-1.5 block text-sm font-medium text-text-primary";
  const errorClasses = "mt-1 text-xs text-red-500";

  return (
    <section className="py-12 lg:py-16">
      <Container className="max-w-3xl">
        {/* Back link */}
        <Link
          href="/#sectors"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary-500"
        >
          <span className="rtl:rotate-180">←</span>
          {t("landing.back")}
        </Link>

        {/* Sector header banner */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl p-8 text-center text-white",
            sector.gradient
          )}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <span className="text-5xl">{sector.icon}</span>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{sectorName}</h1>
            <p className="mx-auto mt-2 max-w-xl text-white/85">
              {t(`items.${slug}.desc`)}
            </p>
          </div>
        </div>

        {/* Cloud-included note */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm font-medium text-primary-800">
          <span className="text-xl">☁️</span>
          <span>{t("landing.planIncludesCloud")}</span>
        </div>

        {/* Lead form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8"
          noValidate
        >
          <div>
            <h2 className="text-xl font-bold text-text-primary">{t("landing.formTitle")}</h2>
            <p className="mt-1 text-sm text-text-secondary">{t("landing.formSubtitle")}</p>
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className={labelClasses}>
              {t("landing.company")} *
            </label>
            <input
              id="company"
              type="text"
              placeholder={t("landing.companyPh")}
              className={cn(inputClasses, errors.company && "border-red-500")}
              {...register("company")}
            />
            {errors.company && <p className={errorClasses}>{errors.company.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClasses}>
              {t("landing.email")} *
            </label>
            <input
              id="email"
              type="email"
              dir="ltr"
              placeholder={t("landing.emailPh")}
              className={cn(inputClasses, errors.email && "border-red-500")}
              {...register("email")}
            />
            {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className={labelClasses}>
              {t("landing.phone")} *
            </label>
            <input
              id="phone"
              type="tel"
              dir="ltr"
              placeholder={t("landing.phonePh")}
              className={cn(inputClasses, errors.phone && "border-red-500")}
              {...register("phone")}
            />
            {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
          </div>

          {/* Users + Calculate */}
          <div>
            <label htmlFor="users" className={labelClasses}>
              {t("landing.users")} *
            </label>
            <div className="flex gap-3">
              <input
                id="users"
                type="number"
                min={1}
                className={cn(inputClasses, "flex-1", errors.users && "border-red-500")}
                {...register("users", { valueAsNumber: true })}
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleCalculate}
                className="shrink-0"
              >
                🧮 {t("landing.calculate")}
              </Button>
            </div>
            {errors.users && <p className={errorClasses}>{errors.users.message}</p>}
          </div>

          {/* Cost estimate */}
          {cost && (
            <div className="rounded-xl border-2 border-cta/30 bg-cta/5 p-5">
              <p className="mb-3 text-sm font-semibold text-text-primary">
                {t("landing.estimateTitle")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                  <p className="text-2xl font-extrabold text-primary-600">
                    {fmt(cost.monthly)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {currency} / {t("landing.monthly")}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                  <p className="text-2xl font-extrabold text-primary-600">
                    {fmt(cost.yearly)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {currency} / {t("landing.yearly")}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-text-secondary">{t("landing.estimateHint")}</p>
            </div>
          )}

          {/* Complete via WhatsApp */}
          <Button
            type="submit"
            variant="cta"
            size="lg"
            className="w-full bg-[#25D366] hover:bg-[#1ebe5d]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t("landing.completeWhatsApp")}
          </Button>
        </form>
      </Container>
    </section>
  );
}
