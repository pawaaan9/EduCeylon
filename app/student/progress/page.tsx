"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { StatCard } from "@/components/StatCard";
import { BoltIcon, ChartIcon, ClockIcon, CheckCircleIcon } from "@/components/icons";
import { COURSES } from "@/lib/data/mock";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ProgressPage() {
  const { t, locale } = useI18n();
  const tracked = COURSES.slice(0, 4);
  return (
    <>
      <GradientHeader title={t("student.nav.progress")} subtitle="Track your learning journey across courses." />
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Hours this week" value="7.5" icon={<ClockIcon className="h-5 w-5" />} />
        <StatCard label="Lessons completed" value="42" icon={<CheckCircleIcon className="h-5 w-5" />} tint="emerald" />
        <StatCard label="Streak" value="12d" icon={<BoltIcon className="h-5 w-5" />} tint="amber" />
        <StatCard label="Avg. quiz score" value="84%" icon={<ChartIcon className="h-5 w-5" />} tint="rose" />
      </section>
      <section className="card divide-y divide-ink-100">
        {tracked.map((c, i) => {
          const progress = [62, 28, 91, 14][i] ?? 50;
          return (
            <div key={c.id} className="flex items-center gap-4 p-4">
              <div
                className="h-14 w-24 rounded-lg flex-shrink-0"
                style={{ background: c.thumbnailGradient }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 line-clamp-1">
                  {c.title[locale] ?? c.title.en}
                </div>
                <div className="text-xs text-ink-500">{c.lecturer.name}</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full brand-gradient" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-ink-700 w-10 text-right">{progress}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
