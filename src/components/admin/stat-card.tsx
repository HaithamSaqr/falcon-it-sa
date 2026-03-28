interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; trend: "up" | "down" | "neutral" };
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, change, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {change && (
        <p
          className={`mt-1 text-sm font-medium ${
            change.trend === "up"
              ? "text-emerald-600"
              : change.trend === "down"
                ? "text-red-500"
                : "text-slate-500"
          }`}
        >
          {change.trend === "up" ? "+" : change.trend === "down" ? "" : ""}
          {change.value}% vs last week
        </p>
      )}
    </div>
  );
}
