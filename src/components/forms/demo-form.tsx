"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/v2/ui/button";
import CalendarPicker from "@/components/forms/calendar-picker";
import { useSettings } from "@/components/providers/settings-provider";
import { api } from "@/lib/api-client";
import { pickBi } from "@/lib/blocks/bi";
import { fireAdsConversion, adsSendTo } from "@/lib/gtag";
import { DEMO_SECTOR_OPTIONS, industryForSector, type LeadAttribution } from "@/lib/lead-attribution";
import { makeDemoFormSchema, type DemoFormData } from "@/lib/validations";
import { Field, FormError, SelectShell, SentNotice, privacyLink, useFormMessages } from "./parts";
import { CHECK, CHIP, FIELD, NOTE, SELECT, TEXTAREA } from "./styles";

const JOB_TITLE_KEYS = ["jobCeo", "jobCfo", "jobCto", "jobCoo", "jobAccountant", "jobItManager", "jobOther"] as const;

const COUNTRY_KEYS = [
  "countrySaudi",
  "countryUae",
  "countryEgypt",
  "countryQatar",
  "countryBahrain",
  "countryKuwait",
  "countryOman",
  "countryJordan",
  "countryOther",
] as const;

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

type Props = {
  /** `?sector=` and `?role=` from the page URL, already validated on the server. */
  attribution: LeadAttribution;
  /** Button label from the demo_form block. */
  submitLabel?: string;
};

/**
 * The demo booking form. Fields, calendar slot and the POST to
 * /api/leads/demo are unchanged; the sector field starts on the sector the
 * visitor came from, and `sector` and `role` ride along with the booking.
 */
export default function DemoForm({ attribution, submitLabel }: Props) {
  const t = useTranslations("demo");
  const locale = useLocale();
  const lang = locale === "ar" ? "ar" : "en";
  const { googleAds } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [preferredDateTime, setPreferredDateTime] = useState<string | null>(null);

  // Same rules as the API, with error messages in the page language.
  const formMessages = useFormMessages();
  const schema = useMemo(() => makeDemoFormSchema(formMessages), [formMessages]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormData>({
    resolver: zodResolver(schema),
    defaultValues: { newsletter: false, industry: industryForSector(attribution.sector) },
  });

  async function onSubmit(data: DemoFormData) {
    setServerError(null);
    const payload = {
      ...data,
      ...(preferredDateTime ? { preferredDateTime } : {}),
      ...attribution,
    };
    const result = await api.submitDemo(payload);
    if (result.success) {
      setSubmitted(true);
      // Google Ads conversion (demo booked): fire-and-forget, no redirect.
      fireAdsConversion(adsSendTo(googleAds?.adsId, googleAds?.demoLabel));
    } else {
      setServerError(result.error || t("error"));
    }
  }

  if (submitted) return <SentNotice title={t("successTitle")} body={t("success")} data-demo-success="" />;

  const invalid = (name: keyof DemoFormData) =>
    errors[name] ? { "aria-invalid": true as const, "aria-describedby": `${name}-error` } : {};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {serverError && <FormError message={serverError} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="fullName" label={t("fullName")} required error={errors.fullName?.message}>
          <input id="fullName" type="text" autoComplete="name" suppressHydrationWarning className={FIELD} {...invalid("fullName")} {...register("fullName")} />
        </Field>
        <Field id="email" label={t("email")} required error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" dir="ltr" suppressHydrationWarning className={`${FIELD} rtl:text-end`} {...invalid("email")} {...register("email")} />
        </Field>
        <Field id="phone" label={t("phone")} required error={errors.phone?.message}>
          <input id="phone" type="tel" autoComplete="tel" dir="ltr" suppressHydrationWarning className={`${FIELD} rtl:text-end`} {...invalid("phone")} {...register("phone")} />
        </Field>
        <Field id="company" label={t("company")} required error={errors.company?.message}>
          <input id="company" type="text" autoComplete="organization" suppressHydrationWarning className={FIELD} {...invalid("company")} {...register("company")} />
        </Field>
        <Field id="jobTitle" label={t("jobTitle")} required error={errors.jobTitle?.message}>
          <SelectShell>
            <select id="jobTitle" suppressHydrationWarning className={SELECT} {...invalid("jobTitle")} {...register("jobTitle")}>
              <option value="">{t("jobTitlePlaceholder")}</option>
              {JOB_TITLE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(key)}
                </option>
              ))}
            </select>
          </SelectShell>
        </Field>
        <Field id="country" label={t("country")} required error={errors.country?.message}>
          <SelectShell>
            <select id="country" suppressHydrationWarning className={SELECT} {...invalid("country")} {...register("country")}>
              <option value="">{t("countryPlaceholder")}</option>
              {COUNTRY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(key)}
                </option>
              ))}
            </select>
          </SelectShell>
        </Field>
      </div>

      <Field id="industry" label={t("industry")} required error={errors.industry?.message}>
        <SelectShell>
          <select id="industry" suppressHydrationWarning className={SELECT} {...invalid("industry")} {...register("industry")}>
            <option value="">{t("industryPlaceholder")}</option>
            {DEMO_SECTOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {pickBi(o.label, lang)}
              </option>
            ))}
          </select>
        </SelectShell>
      </Field>

      <fieldset className="min-w-0" aria-describedby={errors.companySize ? "companySize-error" : undefined}>
        <legend className="mb-2 block text-sm font-semibold text-ink">
          {t("companySize")}
          <span aria-hidden="true" className="ms-0.5 text-brand">
            *
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {COMPANY_SIZES.map((size) => (
            <label key={size} className={CHIP}>
              <input type="radio" value={size} className="sr-only" {...register("companySize")} />
              <span dir="ltr">{size}</span>
            </label>
          ))}
        </div>
        {errors.companySize && (
          <p id="companySize-error" className="mt-1.5 text-[13px] text-[#B42318]">
            {errors.companySize.message}
          </p>
        )}
      </fieldset>

      <Field id="currentERP" label={t("currentERP")}>
        <input id="currentERP" type="text" suppressHydrationWarning className={FIELD} {...register("currentERP")} />
      </Field>

      <Field id="message" label={t("message")}>
        <textarea id="message" rows={3} suppressHydrationWarning className={TEXTAREA} {...register("message")} />
      </Field>

      <CalendarPicker onSelect={setPreferredDateTime} locale={locale} />

      <div className="flex flex-col gap-3">
        <label className={`flex items-start gap-3 ${NOTE}`}>
          <input type="checkbox" className={CHECK} {...register("consent")} aria-describedby={errors.consent ? "consent-error" : undefined} />
          <span>
            {t.rich("consent", { link: privacyLink })}
            <span aria-hidden="true" className="ms-0.5 text-brand">
              *
            </span>
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" className="-mt-1 text-[13px] text-[#B42318]">
            {errors.consent.message}
          </p>
        )}
        <label className={`flex items-start gap-3 ${NOTE}`}>
          <input type="checkbox" className={CHECK} {...register("newsletter")} />
          <span>{t("newsletterOpt")}</span>
        </label>
      </div>

      <Button type="submit" size="lg" className="w-full justify-between disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:self-start" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? `${t("sending")}…` : submitLabel?.trim() || t("submit")}
      </Button>
    </form>
  );
}
