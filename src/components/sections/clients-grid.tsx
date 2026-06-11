"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/admin";

export default function ClientsGrid({ clients }: { clients: Client[] }) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [active, setActive] = useState<string>("all");

  const tags = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [clients]);

  const filtered = active === "all" ? clients : clients.filter((c) => c.tags.includes(active));

  return (
    <div>
      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <FilterChip label={isAr ? "الكل" : "All"} active={active === "all"} onClick={() => setActive("all")} />
          {tags.map((t) => (
            <FilterChip key={t} label={t} active={active === t} onClick={() => setActive(t)} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="flex aspect-[3/2] items-center justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            title={isAr ? c.name.ar : c.name.en}
          >
            {c.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.logo} alt={isAr ? c.name.ar : c.name.en} className="max-h-14 max-w-full object-contain" />
            ) : (
              <span className="text-sm font-semibold text-text-secondary">{isAr ? c.name.ar : c.name.en}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary-500 bg-primary-500 text-white" : "border-gray-200 text-text-secondary hover:border-primary-300"
      )}
    >
      {label}
    </button>
  );
}
