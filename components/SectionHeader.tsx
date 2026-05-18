export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        {eyebrow && (
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 mb-2">
            {eyebrow}
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-ink-600 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
