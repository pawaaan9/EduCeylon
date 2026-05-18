"use client";

import { Avatar } from "@/components/Avatar";
import { CourseCard } from "@/components/CourseCard";
import { CheckCircleIcon, StarIcon, UsersIcon, BookIcon } from "@/components/icons";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Course, Lecturer } from "@/lib/data/types";

export function LecturerProfileClient({
  lecturer,
  courses,
}: {
  lecturer: Lecturer;
  courses: Course[];
}) {
  const { t, locale } = useI18n();
  const bio = lecturer.bio[locale] ?? lecturer.bio.en;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl overflow-hidden shadow-card">
        <div className="h-40 w-full" style={{ background: lecturer.coverGradient }} />
        <div className="bg-white px-6 sm:px-10 pb-8 -mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <div className="ring-4 ring-white rounded-full inline-flex">
              <Avatar name={lecturer.name} size={120} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 flex items-center gap-2">
                {lecturer.name}
                {lecturer.verified && (
                  <CheckCircleIcon className="h-6 w-6 text-brand-600" />
                )}
              </h1>
              <p className="text-ink-500 mt-1">{lecturer.title}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-md w-full">
              <PillStat
                label={t("lecturers.courses")}
                value={lecturer.courses.toString()}
                icon={<BookIcon className="h-4 w-4" />}
              />
              <PillStat
                label={t("lecturers.students")}
                value={
                  lecturer.students >= 1000
                    ? `${(lecturer.students / 1000).toFixed(1)}k`
                    : lecturer.students.toString()
                }
                icon={<UsersIcon className="h-4 w-4" />}
              />
              <PillStat
                label={t("course.rating")}
                value={lecturer.rating.toFixed(1)}
                icon={<StarIcon className="h-4 w-4 text-amber-500" />}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="card p-6">
            <h2 className="font-semibold text-ink-900 text-lg">{t("lecturer.bio")}</h2>
            <p className="mt-3 text-ink-700 leading-relaxed">{bio}</p>
          </section>

          <section>
            <h2 className="font-semibold text-ink-900 text-lg mb-4">
              {t("lecturer.courses")}
            </h2>
            {courses.length === 0 ? (
              <div className="card p-8 text-center text-ink-500">
                No courses yet.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {courses.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="card p-6">
            <h3 className="font-semibold text-ink-900">{t("lecturer.qualifications")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-700">
              {lecturer.qualifications.map((q) => (
                <li key={q} className="flex items-start gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-6">
            <h3 className="font-semibold text-ink-900">{t("lecturer.experience")}</h3>
            <p className="mt-2 text-sm text-ink-700">
              <strong className="text-2xl text-ink-900 block">
                {lecturer.experienceYears}+ yrs
              </strong>
              Active teaching experience
            </p>
          </section>
          <section className="card p-6">
            <h3 className="font-semibold text-ink-900">Subjects</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {lecturer.subjects.map((s) => (
                <span key={s} className="badge badge-slate">
                  {s}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function PillStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3 text-center">
      <div className="text-lg font-bold text-ink-900 flex items-center justify-center gap-1">
        {icon}
        {value}
      </div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}
