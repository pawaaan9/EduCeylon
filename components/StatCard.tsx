export function StatCard({
  label,
  value,
  icon,
  trend,
  tint = "brand",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; positive?: boolean };
  tint?: "brand" | "emerald" | "amber" | "rose";
}) {
  const tints: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="card p-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wider text-ink-500">
          {label}
        </div>
        <div className="mt-2 text-2xl font-bold text-ink-900">{value}</div>
        {trend && (
          <div
            className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
              trend.positive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            <span>{trend.positive ? "↑" : "↓"}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${tints[tint]}`}
        aria-hidden
      >
        {icon}
      </div>
    </div>
  );
}
