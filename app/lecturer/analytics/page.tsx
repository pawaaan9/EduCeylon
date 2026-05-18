"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { StatCard } from "@/components/StatCard";
import { ChartIcon, ClockIcon, StarIcon, UsersIcon } from "@/components/icons";
import { useT } from "@/lib/i18n/I18nProvider";

export default function AnalyticsPage() {
  const t = useT();
  return (
    <>
      <GradientHeader title={t("lecturer.nav.analytics")} subtitle="Course engagement and student behaviour at a glance." />
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg. watch time" value="38m" icon={<ClockIcon className="h-5 w-5" />} />
        <StatCard label="Completion rate" value="72%" icon={<ChartIcon className="h-5 w-5" />} tint="emerald" />
        <StatCard label="Active learners" value="3,420" icon={<UsersIcon className="h-5 w-5" />} tint="amber" />
        <StatCard label="Rating" value="4.9" icon={<StarIcon className="h-5 w-5" />} tint="rose" />
      </section>
      <div className="card p-8 text-center text-ink-500">
        Detailed funnel analytics coming soon.
      </div>
    </>
  );
}
