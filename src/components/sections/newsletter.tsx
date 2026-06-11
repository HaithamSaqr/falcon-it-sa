"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import SectionHeader from "@/components/shared/section-header";
import { newsletterSchema, type NewsletterData } from "@/lib/validations";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function Newsletter({
  heading,
  subtitle,
}: {
  heading?: string;
  subtitle?: string;
} = {}) {
  const t = useTranslations("newsletter");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterData>({
    resolver: zodResolver(newsletterSchema),
  });

  async function onSubmit(data: NewsletterData) {
    const result = await api.submitNewsletter(data);
    if (result.success) {
      setSubmitted(true);
    }
  }

  return (
    <section className="bg-surface py-20 lg:py-28">
      <Container>
        <SectionHeader title={heading || t("heading")} subtitle={subtitle || t("subtitle")} />

        <div className="mx-auto max-w-xl">
          {submitted ? (
            <p className="text-center text-lg font-medium text-cta">
              {t("success")}
            </p>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3 sm:flex-row"
              noValidate
            >
              <div className="flex-1">
                <input
                  type="email"
                  placeholder={t("placeholder")}
                  // Browser autofill extensions inject attributes (autofill-prediction…)
                  // before hydration; suppress the harmless attribute mismatch warning.
                  suppressHydrationWarning
                  {...register("email")}
                  className={cn(
                    "h-12 w-full rounded-xl border bg-white px-4 text-text-primary",
                    "transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500",
                    errors.email
                      ? "border-error"
                      : "border-gray-300"
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                variant="cta"
                size="md"
                disabled={isSubmitting}
                className="shrink-0"
              >
                {t("subscribe")}
              </Button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
