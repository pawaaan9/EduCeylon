"use client";

import Image from "next/image";
import { Avatar } from "@/components/Avatar";
import { CourseCard } from "@/components/CourseCard";
import { CheckCircleIcon, StarIcon, UsersIcon, BookIcon } from "@/components/icons";
import {
  findDistrict,
  localizedLabel,
} from "@/lib/data/sri-lanka-locations";
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
  const hasRating = lecturer.reviews > 0;
  const district = findDistrict(lecturer.district);
  const districtLabel = district
    ? localizedLabel(district.name, locale)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl overflow-hidden shadow-card bg-white">
        <div className="relative z-0 h-40 sm:h-48 md:h-52 w-full overflow-hidden bg-ink-200">
          {lecturer.coverURL ? (
            <>
              <Image
                src={lecturer.coverURL}
                alt=""
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority
                unoptimized
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"
                aria-hidden
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: lecturer.coverGradient }}
            />
          )}
        </div>
        <div className="relative z-10 bg-white px-6 sm:px-10 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between -mt-12">
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
              <div className="shrink-0 rounded-full ring-4 ring-white shadow-lg z-20">
                <Avatar name={lecturer.name} src={lecturer.photoURL} size={96} />
              </div>
              <div className="min-w-0 pt-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-900 flex flex-wrap items-center gap-2">
                  {lecturer.name}
                  {lecturer.verified && (
                    <CheckCircleIcon className="h-5 w-5 text-brand-600 shrink-0" />
                  )}
                </h1>
                <p className="text-sm text-ink-500 mt-0.5">{lecturer.title}</p>
                {districtLabel && (
                  <p className="text-sm text-ink-500 mt-0.5">{districtLabel}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full sm:max-w-xs sm:shrink-0 sm:ml-auto">
              <PillStat compact
                label={t("lecturers.courses")}
                value={lecturer.courses.toString()}
                icon={<BookIcon className="h-4 w-4" />}
              />
              <PillStat compact
                label={t("lecturers.students")}
                value={
                  lecturer.students >= 1000
                    ? `${(lecturer.students / 1000).toFixed(1)}k`
                    : lecturer.students.toString()
                }
                icon={<UsersIcon className="h-4 w-4" />}
              />
              <PillStat compact
                label={t("course.rating")}
                value={hasRating ? lecturer.rating.toFixed(1) : "—"}
                icon={
                  hasRating ? (
                    <StarIcon className="h-4 w-4 text-amber-500" />
                  ) : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="card p-6">
            <h2 className="font-semibold text-ink-900 text-lg">{t("lecturer.bio")}</h2>
            <p className="mt-3 text-ink-700 leading-relaxed whitespace-pre-wrap">
              {bio || t("home.lecturers.bioEmpty")}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-ink-900 text-lg mb-4">
              {t("lecturer.courses")}
            </h2>
            {courses.length === 0 ? (
              <div className="card p-8 text-center text-ink-500">
                {t("lecturer.courses.empty")}
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
          {lecturer.qualifications.length > 0 && (
            <section className="card p-6">
              <h3 className="font-semibold text-ink-900">{t("lecturer.qualifications")}</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink-700">
                {lecturer.qualifications.map((q, i) => (
                  <li key={`${i}-${q}`} className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {lecturer.experienceYears > 0 && (
            <section className="card p-6">
              <h3 className="font-semibold text-ink-900">{t("lecturer.experience")}</h3>
              <p className="mt-2 text-sm text-ink-700">
                <strong className="text-2xl text-ink-900 block">
                  {lecturer.experienceYears}+ yrs
                </strong>
                {t("lecturer.experienceHint")}
              </p>
            </section>
          )}
          <section className="card p-6">
            <h3 className="font-semibold text-ink-900">{t("lecturer.subjects")}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {lecturer.subjects.map((s, i) => (
                <span key={`${s}-${i}`} className="badge badge-slate">
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
  compact,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-ink-200 bg-ink-50 text-center ${
        compact ? "px-2 py-1.5" : "p-3"
      }`}
    >
      <div
        className={`font-bold text-ink-900 flex items-center justify-center gap-1 ${
          compact ? "text-sm" : "text-lg"
        }`}
      >
        {icon}
        {value}
      </div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}
