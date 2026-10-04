"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Button from "@/components/v2/ui/button";
import { useSettings } from "@/components/providers/settings-provider";
import { api } from "@/lib/api-client";
import { fireAdsConversion, adsSendTo } from "@/lib/gtag";
import { makeContactFormSchema, type ContactFormData } from "@/lib/validations";
import { Field, FormError, SentNotice, privacyLink, useFormMessages } from "./parts";
import { FIELD, NOTE, TEXTAREA } from "./styles";

/** The contact form. Posts the same payload to /api/leads/contact as before. */
export default function ContactForm() {
  const t = useTranslations("contact");
  const { googleAds } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Same rules as the API, with error messages in the page language.
  const formMessages = useFormMessages();
  const schema = useMemo(() => makeContactFormSchema(formMessages), [formMessages]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: ContactFormData) {
    setServerError(null);
    const result = await api.submitContact(data);
    if (result.success) {
      setSubmitted(true);
      // Google Ads conversion (contact form): fire-and-forget, no redirect.
      fireAdsConversion(adsSendTo(googleAds?.adsId, googleAds?.contactLabel));
    } else {
      setServerError(result.error || t("error"));
    }
  }

  if (submitted) return <SentNotice title={t("successTitle")} body={t("success")} data-contact-success="" />;

  const invalid = (name: keyof ContactFormData) =>
    errors[name] ? { "aria-invalid": true as const, "aria-describedby": `${name}-error` } : {};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate aria-labelledby="contact-form-heading">
      <h2 id="contact-form-heading" className="text-[22px] font-extrabold leading-tight text-ink rtl:font-bold">
        {t("formHeading")}
      </h2>
      {serverError && <FormError message={serverError} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label={t("name")} required error={errors.name?.message}>
          <input id="name" type="text" autoComplete="name" suppressHydrationWarning className={FIELD} {...invalid("name")} {...register("name")} />
        </Field>
        <Field id="email" label={t("email")} required error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" dir="ltr" suppressHydrationWarning className={`${FIELD} rtl:text-end`} {...invalid("email")} {...register("email")} />
        </Field>
      </div>
      <Field id="phone" label={t("phone")}>
        <input id="phone" type="tel" autoComplete="tel" dir="ltr" suppressHydrationWarning className={`${FIELD} rtl:text-end`} {...register("phone")} />
      </Field>
      <Field id="subject" label={t("subject")} required error={errors.subject?.message}>
        <input id="subject" type="text" suppressHydrationWarning className={FIELD} {...invalid("subject")} {...register("subject")} />
      </Field>
      <Field id="message" label={t("message")} required error={errors.message?.message}>
        <textarea id="message" rows={5} suppressHydrationWarning className={TEXTAREA} {...invalid("message")} {...register("message")} />
      </Field>

      <p className={NOTE}>{t.rich("consent", { link: privacyLink })}</p>

      <Button
        type="submit"
        size="lg"
        className="w-full justify-between disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:self-start"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? `${t("sending")}…` : t("submit")}
      </Button>
    </form>
  );
}
