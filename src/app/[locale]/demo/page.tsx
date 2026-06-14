"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useSettings } from "@/components/providers/settings-provider";
import { fireAdsConversion, adsSendTo } from "@/lib/gtag";
import { demoFormSchema, type DemoFormData } from "@/lib/validations";
import CalendarPicker from "@/components/forms/calendar-picker";
import { useLocale } from "next-intl";

const JOB_TITLE_KEYS = [
  "jobCeo", "jobCfo", "jobCto", "jobCoo", "jobAccountant", "jobItManager", "jobOther",
] as const;

const COUNTRY_KEYS = [
  "countrySaudi", "countryUae", "countryEgypt", "countryQatar",
  "countryBahrain", "countryKuwait", "countryOman", "countryJordan", "countryOther",
] as const;

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

const INDUSTRY_KEYS = [
  "indRetail", "indManufacturing", "indConstruction", "indRealEstate",
  "indHospitality", "indHealthcare", "indEducation", "indLogistics", "indTrading", "indOther",
] as const;

const BENEFIT_KEYS = ["benefit1", "benefit2", "benefit3"] as const;
const BENEFIT_ICONS = ["🎯", "💡", "📋"] as const;

export default function DemoPage() {
  const t = useTranslations("demo");
  const locale = useLocale();
  const { googleAds } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [preferredDateTime, setPreferredDateTime] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: { newsletter: false },
  });

  async function onSubmit(data: DemoFormData) {
    setServerError(null);
    const payload = preferredDateTime
      ? { ...data, preferredDateTime }
      : data;
    const result = await api.submitDemo(payload);
    if (result.success) {
      setSubmitted(true);
      // Google Ads conversion (demo booked) — fire-and-forget, no redirect.
      fireAdsConversion(adsSendTo(googleAds?.adsId, googleAds?.demoLabel));
    } else {
      setServerError(result.error || "Something went wrong. Please try again.");
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-text-primary transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20";
  const labelClasses = "mb-1.5 block text-sm font-medium text-text-primary";
  const errorClasses = "mt-1 text-xs text-red-500";

  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Form Side */}
          <div>
            <h1 className="mb-3 text-3xl font-extrabold text-text-primary sm:text-4xl">
              {t("heading")}
            </h1>
            <p className="mb-8 text-lg text-text-secondary">{t("subtitle")}</p>

            {submitted ? (
              <div className="rounded-xl border-2 border-cta bg-cta/5 p-8 text-center">
                <span className="mb-4 inline-block text-5xl">✅</span>
                <p className="text-xl font-bold text-text-primary">
                  {t("success")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {serverError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {serverError}
                  </div>
                )}
                <div>
                  <label htmlFor="fullName" className={labelClasses}>{t("fullName")} *</label>
                  <input id="fullName" suppressHydrationWarning type="text" className={cn(inputClasses, errors.fullName && "border-red-500")} {...register("fullName")} />
                  {errors.fullName && <p className={errorClasses}>{errors.fullName.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className={labelClasses}>{t("email")} *</label>
                  <input id="email" type="email" suppressHydrationWarning className={cn(inputClasses, errors.email && "border-red-500")} {...register("email")} />
                  {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className={labelClasses}>{t("phone")} *</label>
                  <input id="phone" suppressHydrationWarning type="tel" className={cn(inputClasses, errors.phone && "border-red-500")} {...register("phone")} />
                  {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
                </div>

                <div>
                  <label htmlFor="company" className={labelClasses}>{t("company")} *</label>
                  <input id="company" suppressHydrationWarning type="text" className={cn(inputClasses, errors.company && "border-red-500")} {...register("company")} />
                  {errors.company && <p className={errorClasses}>{errors.company.message}</p>}
                </div>

                <div>
                  <label htmlFor="jobTitle" className={labelClasses}>{t("jobTitle")} *</label>
                  <select id="jobTitle" suppressHydrationWarning className={cn(inputClasses, errors.jobTitle && "border-red-500")} {...register("jobTitle")}>
                    <option value="">{t("jobTitle")}</option>
                    {JOB_TITLE_KEYS.map((key) => (
                      <option key={key} value={key}>{t(key)}</option>
                    ))}
                  </select>
                  {errors.jobTitle && <p className={errorClasses}>{errors.jobTitle.message}</p>}
                </div>

                <div>
                  <label htmlFor="country" className={labelClasses}>{t("country")} *</label>
                  <select id="country" suppressHydrationWarning className={cn(inputClasses, errors.country && "border-red-500")} {...register("country")}>
                    <option value="">{t("country")}</option>
                    {COUNTRY_KEYS.map((key) => (
                      <option key={key} value={key}>{t(key)}</option>
                    ))}
                  </select>
                  {errors.country && <p className={errorClasses}>{errors.country.message}</p>}
                </div>

                <div>
                  <label className={labelClasses}>{t("companySize")} *</label>
                  <div className="flex flex-wrap gap-3">
                    {COMPANY_SIZES.map((size) => (
                      <label key={size} className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-500/5">
                        <input type="radio" value={size} className="accent-primary-500" {...register("companySize")} />
                        {size}
                      </label>
                    ))}
                  </div>
                  {errors.companySize && <p className={errorClasses}>{errors.companySize.message}</p>}
                </div>

                <div>
                  <label htmlFor="industry" className={labelClasses}>{t("industry")} *</label>
                  <select id="industry" suppressHydrationWarning className={cn(inputClasses, errors.industry && "border-red-500")} {...register("industry")}>
                    <option value="">{t("industry")}</option>
                    {INDUSTRY_KEYS.map((key) => (
                      <option key={key} value={key}>{t(key)}</option>
                    ))}
                  </select>
                  {errors.industry && <p className={errorClasses}>{errors.industry.message}</p>}
                </div>

                <div>
                  <label htmlFor="currentERP" className={labelClasses}>{t("currentERP")}</label>
                  <input id="currentERP" suppressHydrationWarning type="text" className={inputClasses} {...register("currentERP")} />
                </div>

                <div>
                  <label htmlFor="message" className={labelClasses}>{t("message")}</label>
                  <textarea id="message" suppressHydrationWarning rows={3} className={cn(inputClasses, "resize-none")} {...register("message")} />
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" className="mt-0.5 accent-primary-500" {...register("consent")} />
                    <span className="text-text-secondary">{t("consent")} *</span>
                  </label>
                  {errors.consent && <p className={errorClasses}>{errors.consent.message}</p>}
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" className="mt-0.5 accent-primary-500" {...register("newsletter")} />
                    <span className="text-text-secondary">{t("newsletterOpt")}</span>
                  </label>
                </div>

                {/* Calendar Slot Picker */}
                <CalendarPicker onSelect={setPreferredDateTime} locale={locale} />

                <Button type="submit" variant="cta" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "..." : t("submit")}
                </Button>
              </form>
            )}
          </div>

          {/* Benefits Side */}
          <div className="flex flex-col justify-center">
            <div className="rounded-2xl bg-gray-50 p-8 lg:p-10">
              <h2 className="mb-2 text-2xl font-bold text-text-primary">
                {t("sidebarTitle")}
              </h2>
              <p className="mb-8 text-text-secondary">
                {t("sidebarSubtitle")}
              </p>
              <div className="space-y-6">
                {BENEFIT_KEYS.map((key, i) => (
                  <div key={key} className="flex gap-4">
                    <span className="text-2xl">{BENEFIT_ICONS[i]}</span>
                    <div>
                      <h3 className="font-bold text-text-primary">{t(`${key}Title`)}</h3>
                      <p className="text-sm text-text-secondary">{t(`${key}Desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-xl bg-primary-500/5 p-6">
                <p className="text-sm font-medium text-text-primary">{t("trustLine1")}</p>
                <p className="mt-1 text-xs text-text-secondary">{t("trustLine2")}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
