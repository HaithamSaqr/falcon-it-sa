import { useTranslations } from "next-intl";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import SectionHeader from "@/components/shared/section-header";
import { cn } from "@/lib/utils";

const COMPETITORS = ["falcon", "sap", "oracle", "dynamics"] as const;

const ROWS = [
  { key: "tco", labelKey: "tcoLabel" },
  { key: "zatca", labelKey: "zatcaLabel" },
  { key: "arabic", labelKey: "arabicLabel" },
  { key: "onPremise", labelKey: "onPremiseLabel" },
  { key: "implementation", labelKey: "implementationLabel" },
] as const;

type RowKey = (typeof ROWS)[number]["key"];

const VALUE_KEYS: Record<
  RowKey,
  Record<(typeof COMPETITORS)[number], string>
> = {
  tco: {
    falcon: "falconTco",
    sap: "sapTco",
    oracle: "oracleTco",
    dynamics: "dynamicsTco",
  },
  zatca: {
    falcon: "falconZatca",
    sap: "sapZatca",
    oracle: "oracleZatca",
    dynamics: "dynamicsZatca",
  },
  arabic: {
    falcon: "falconArabic",
    sap: "sapArabic",
    oracle: "oracleArabic",
    dynamics: "dynamicsArabic",
  },
  onPremise: {
    falcon: "falconOnPrem",
    sap: "sapOnPrem",
    oracle: "oracleOnPrem",
    dynamics: "dynamicsOnPrem",
  },
  implementation: {
    falcon: "falconImpl",
    sap: "sapImpl",
    oracle: "oracleImpl",
    dynamics: "dynamicsImpl",
  },
};

/** Falcon-favorable values that get a checkmark */
const FALCON_STRENGTHS = new Set([
  "falconTco",
  "falconZatca",
  "falconArabic",
  "falconOnPrem",
  "falconImpl",
]);

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("inline-block h-5 w-5 text-cta", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export default function TcoComparison() {
  const t = useTranslations("tco");

  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <SectionHeader title={t("heading")} subtitle={t("subtitle")} />

        {/* ── Desktop table (lg+) ── */}
        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-start">
              <thead>
                <tr className="bg-surface">
                  <th className="px-6 py-4 text-start text-sm font-semibold text-text-secondary">
                    &nbsp;
                  </th>
                  {COMPETITORS.map((comp) => (
                    <th
                      key={comp}
                      className={cn(
                        "px-6 py-4 text-center text-sm font-bold",
                        comp === "falcon"
                          ? "bg-primary-50 text-primary-500"
                          : "text-text-primary"
                      )}
                    >
                      {t(comp)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, idx) => (
                  <tr
                    key={row.key}
                    className={cn(
                      idx % 2 === 0 ? "bg-white" : "bg-surface/50"
                    )}
                  >
                    <td className="px-6 py-4 text-start text-sm font-medium text-text-primary">
                      {t(row.labelKey)}
                    </td>
                    {COMPETITORS.map((comp) => {
                      const valueKey = VALUE_KEYS[row.key][comp];
                      const isFalcon = comp === "falcon";
                      const isStrength = FALCON_STRENGTHS.has(valueKey);

                      return (
                        <td
                          key={comp}
                          className={cn(
                            "px-6 py-4 text-center text-sm",
                            isFalcon && "bg-primary-50"
                          )}
                        >
                          <span
                            className={cn(
                              isFalcon
                                ? "font-bold text-primary-500"
                                : "text-text-secondary"
                            )}
                          >
                            {isStrength && (
                              <CheckIcon className="me-1.5 -mt-0.5" />
                            )}
                            {t(valueKey)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Mobile cards (< lg) ── */}
        <div className="space-y-6 lg:hidden">
          {/* Falcon highlighted card */}
          <div className="rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
            <h3 className="mb-4 text-center text-xl font-bold text-primary-500">
              {t("falcon")}
            </h3>
            <dl className="space-y-3">
              {ROWS.map((row) => {
                const valueKey = VALUE_KEYS[row.key].falcon;
                return (
                  <div key={row.key} className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-text-primary">
                      {t(row.labelKey)}
                    </dt>
                    <dd className="flex items-center gap-1.5 text-sm font-bold text-primary-500">
                      <CheckIcon />
                      {t(valueKey)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          {/* Competitor cards */}
          {(["sap", "oracle", "dynamics"] as const).map((comp) => (
            <div
              key={comp}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <h3 className="mb-4 text-center text-lg font-semibold text-text-primary">
                {t(comp)}
              </h3>
              <dl className="space-y-3">
                {ROWS.map((row) => {
                  const valueKey = VALUE_KEYS[row.key][comp];
                  return (
                    <div
                      key={row.key}
                      className="flex items-center justify-between"
                    >
                      <dt className="text-sm font-medium text-text-secondary">
                        {t(row.labelKey)}
                      </dt>
                      <dd className="text-sm text-text-secondary">
                        {t(valueKey)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="lg" href="/products">
            {t("ctaPricing")}
          </Button>
          <Button variant="outline" size="lg" href="/contact">
            {t("ctaConsult")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
