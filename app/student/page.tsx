"use client";

import Link from "next/link";
import { GradientHeader } from "@/components/GradientHeader";
import { StatCard } from "@/components/StatCard";
import { CourseCard } from "@/components/CourseCard";
import {
  BookIcon,
  ChartIcon,
  CheckCircleIcon,
  BoltIcon,
  PlayCircleIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@/components/icons";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { COURSES, LIVE_SESSIONS } from "@/lib/data/mock";
import { formatLiveSessionStart } from "@/lib/format-live-session-start";

const ENROLLED = [COURSES[0], COURSES[2], COURSES[3]];
const RECOMMENDED = [COURSES[5], COURSES[4], COURSES[7]];

export default function StudentDashboardPage() {
  const { t, locale } = useI18n();

  return (
    <>
      <GradientHeader
        title={`${t("dashboard.welcome")}, Pawan 👋`}
        subtitle={t("dashboard.subtitle")}
        actions={
          <Link href="/courses" className="btn bg-white text-brand-700 hover:bg-white/90">
            Browse marketplace
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        }
      >
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
          <HeroStat value="3" label={t("student.stats.enrolled")} />
          <HeroStat value="42h" label={t("student.stats.hours")} />
          <HeroStat value="8" label={t("student.stats.completed")} />
          <HeroStat value="12" label={t("student.stats.streak")} />
        </div>
      </GradientHeader>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("student.stats.enrolled")}
          value={3}
          icon={<BookIcon className="h-5 w-5" />}
          trend={{ value: "+1 this month", positive: true }}
        />
        <StatCard
          label={t("student.stats.hours")}
          value="42"
          icon={<ChartIcon className="h-5 w-5" />}
          tint="emerald"
          trend={{ value: "+5h this week", positive: true }}
        />
        <StatCard
          label={t("student.stats.completed")}
          value={8}
          icon={<CheckCircleIcon className="h-5 w-5" />}
          tint="amber"
        />
        <StatCard
          label={t("student.stats.streak")}
          value="12 days"
          icon={<BoltIcon className="h-5 w-5" />}
          tint="rose"
          trend={{ value: "Keep it up!", positive: true }}
        />
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-ink-900 text-lg mb-4">
            {t("student.continue.title")}
          </h2>
          <div className="flex flex-col gap-3">
            {ENROLLED.map((c, i) => {
              const progress = [62, 28, 91][i] ?? 50;
              return (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="card p-4 flex gap-4 items-center hover:shadow-card hover:border-brand-200 transition-all"
                >
                  <div
                    className="h-20 w-32 rounded-lg flex-shrink-0 flex items-center justify-center text-white"
                    style={{ background: c.thumbnailGradient }}
                  >
                    <PlayCircleIcon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-ink-500">{c.lecturer.name}</div>
                    <div className="font-semibold text-ink-900 line-clamp-1">
                      {c.title[locale] ?? c.title.en}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className="h-full brand-gradient"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-ink-700">
                        {progress}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-ink-900 text-lg mb-4">
            {t("student.upcoming.title")}
          </h2>
          <div className="card p-4 flex flex-col gap-3">
            {LIVE_SESSIONS.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-ink-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-ink-900 line-clamp-1">
                      {s.courseTitle[locale] ?? s.courseTitle.en}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      {s.lecturerName} ·{" "}
                      {formatLiveSessionStart(s.startsAt, locale, {
                        weekday: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <span className="badge badge-rose live-dot">LIVE</span>
                </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink-900 text-lg">
            {t("student.recommended.title")}
          </h2>
          <Link
            href="/courses"
            className="text-sm font-semibold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1"
          >
            {t("action.viewAll")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RECOMMENDED.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>
    </>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3 border border-white/10">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[11px] text-white/80 uppercase tracking-wider mt-0.5 truncate">
        {label}
      </div>
    </div>
  );
}
