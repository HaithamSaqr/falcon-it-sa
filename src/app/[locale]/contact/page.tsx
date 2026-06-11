"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/providers/settings-provider";
import { api } from "@/lib/api-client";
import { contactFormSchema, type ContactFormData } from "@/lib/validations";

export default function ContactPage() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { company } = useSettings();
  const isAr = locale === "ar";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  async function onSubmit(data: ContactFormData) {
    setServerError(null);
    const result = await api.submitContact(data);
    if (result.success) {
      setSubmitted(true);
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
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="mb-3 text-3xl font-extrabold text-text-primary sm:text-4xl lg:text-5xl">
            {t("heading")}
          </h1>
          <p className="text-lg text-text-secondary">{t("subtitle")}</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Form Side */}
          <div>
            {submitted ? (
              <div className="rounded-xl border-2 border-cta bg-cta/5 p-8 text-center">
                <span className="mb-4 inline-block text-5xl">✅</span>
                <p className="text-xl font-bold text-text-primary">
                  {t("success")}
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
              >
                {serverError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {serverError}
                  </div>
                )}
                {/* Name */}
                <div>
                  <label htmlFor="name" className={labelClasses}>
                    {t("name")} *
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={cn(inputClasses, errors.name && "border-red-500")}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className={errorClasses}>{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelClasses}>
                    {t("email")} *
                  </label>
                  <input
                    id="email"
                    type="email"
                    suppressHydrationWarning
                    className={cn(inputClasses, errors.email && "border-red-500")}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className={errorClasses}>{errors.email.message}</p>
                  )}
                </div>

                {/* Phone (optional) */}
                <div>
                  <label htmlFor="phone" className={labelClasses}>
                    {t("phone")}
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={inputClasses}
                    {...register("phone")}
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className={labelClasses}>
                    {t("subject")} *
                  </label>
                  <input
                    id="subject"
                    type="text"
                    className={cn(inputClasses, errors.subject && "border-red-500")}
                    {...register("subject")}
                  />
                  {errors.subject && (
                    <p className={errorClasses}>{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className={labelClasses}>
                    {t("message")} *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className={cn(
                      inputClasses,
                      "resize-none",
                      errors.message && "border-red-500"
                    )}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className={errorClasses}>{errors.message.message}</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="cta"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "..." : t("submit")}
                </Button>
              </form>
            )}
          </div>

          {/* Office Info Side */}
          <div className="space-y-6">
            {/* Branches — dynamic list managed from the admin panel */}
            {(company.branches ?? []).map((branch) => (
              <Card key={branch.id} className="text-start">
                <h3 className="mb-4 text-xl font-bold text-text-primary">
                  {isAr ? branch.name.ar : branch.name.en}
                </h3>
                <div className="space-y-3 text-sm text-text-secondary">
                  <p className="flex items-start gap-3">
                    <span className="text-lg">📍</span>
                    {isAr ? branch.address.ar : branch.address.en}
                  </p>
                  {branch.phone && (
                    <p className="flex items-start gap-3">
                      <span className="text-lg">📞</span>
                      <a
                        href={`tel:${branch.phone}`}
                        className="transition-colors hover:text-primary-500"
                        dir="ltr"
                      >
                        {branch.phone}
                      </a>
                    </p>
                  )}
                  <p className="flex items-start gap-3">
                    <span className="text-lg">✉️</span>
                    <a
                      href={`mailto:${company.email}`}
                      className="transition-colors hover:text-primary-500"
                    >
                      {company.email}
                    </a>
                  </p>
                </div>
              </Card>
            ))}

            {/* WhatsApp CTA */}
            <Card className="bg-cta/5 text-start">
              <h3 className="mb-2 text-lg font-bold text-text-primary">
                Prefer WhatsApp?
              </h3>
              <p className="mb-4 text-sm text-text-secondary">
                Chat with our team instantly for quick questions.
              </p>
              <Button
                variant="cta"
                size="sm"
                href={`https://wa.me/${company.whatsapp}`}
              >
                Chat on WhatsApp
              </Button>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
