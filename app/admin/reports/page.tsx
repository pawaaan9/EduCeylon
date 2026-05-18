"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { StatCard } from "@/components/StatCard";
import { ChartIcon, MoneyIcon, UsersIcon } from "@/components/icons";
import { useT } from "@/lib/i18n/I18nProvider";

export default function ReportsPage() {
  const t = useT();
  return (
    <>
      <GradientHeader title={t("admin.nav.reports")} subtitle="Platform health and key performance indicators." />
      <section className="grid sm:grid-cols-3 gap-4">
        <StatCard label="DAU" value="12,820" icon={<UsersIcon className="h-5 w-5" />} trend={{ value: "+3% WoW", positive: true }} />
        <StatCard label="Conversion" value="4.6%" icon={<ChartIcon className="h-5 w-5" />} tint="emerald" />
        <StatCard label="GMV" value="LKR 4.2M" icon={<MoneyIcon className="h-5 w-5" />} tint="amber" />
      </section>
      <div className="card p-8 text-center text-ink-500">Charts & exports coming soon.</div>
    </>
  );
}
