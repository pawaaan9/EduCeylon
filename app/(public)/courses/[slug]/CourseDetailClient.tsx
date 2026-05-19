"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Avatar } from "@/components/Avatar";
import {
  CheckCircleIcon,
  ClockIcon,
  HeartIcon,
  PlayCircleIcon,
  StarIcon,
  UsersIcon,
} from "@/components/icons";
import type { Course, Lecturer } from "@/lib/data/types";

const LKR = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

type Tab = "about" | "curriculum" | "reviews";

export function CourseDetailClient({
  course,
}: {
  course: Course;
  lecturer: Lecturer | null;
}) {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<Tab>("about");

  const title = course.title[locale] ?? course.title.en;
  const longDesc = course.longDescription[locale] ?? course.longDescription.en;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
        <div
          className="aspect-[16/9] w-full rounded-2xl shadow-card relative overflow-hidden"
          style={
            course.thumbnailURL
              ? undefined
              : { background: course.thumbnailGradient }
          }
        >
          {course.thumbnailURL ? (
            <Image
              src={course.thumbnailURL}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 768px"
              className="object-cover"
              unoptimized
              priority
            />
          ) : null}
          <button className="absolute inset-0 flex items-center justify-center text-white hover:scale-105 transition-transform">
            <PlayCircleIcon className="h-20 w-20 drop-shadow-2xl" />
          </button>
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="badge bg-white/95 text-brand-700">
              {t(`category.${course.category}`)}
            </span>
            <span
              className={`badge ${
                course.type === "live"
                  ? "badge-rose"
                  : course.type === "hybrid"
                  ? "badge-amber"
                  : "badge-slate"
              }`}
            >
              {t(`type.${course.type}`)}
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-900">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-5 text-sm text-ink-600">
          <span className="inline-flex items-center gap-1.5">
            <StarIcon className="h-4 w-4 text-amber-500" />
            <strong className="text-ink-900">{course.rating.toFixed(1)}</strong>
            ({course.reviews} {t("course.reviews").toLowerCase()})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="h-4 w-4" />
            {course.students.toLocaleString()} {t("course.students")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PlayCircleIcon className="h-4 w-4" /> {course.lessons} {t("course.lessons")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4" /> {course.hours} {t("course.hours")}
          </span>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl border border-ink-200 bg-white">
          <Avatar name={course.lecturer.name} size={48} />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-ink-500">{t("course.lecturer")}</div>
            <Link
              href={`/lecturers/${course.lecturer.slug}`}
              className="font-semibold text-ink-900 hover:text-brand-700"
            >
              {course.lecturer.name}
            </Link>
            <div className="text-xs text-ink-500">{course.lecturer.title}</div>
          </div>
          <Link
            href={`/lecturers/${course.lecturer.slug}`}
            className="btn btn-secondary hidden sm:inline-flex"
          >
            {t("lecturers.viewProfile")}
          </Link>
        </div>

        <div className="flex items-center gap-2 border-b border-ink-200">
          {(["about", "curriculum", "reviews"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === id
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-ink-600 hover:text-ink-900"
              }`}
            >
              {t(`course.${id}`)}
            </button>
          ))}
        </div>

        <div>
          {tab === "about" && (
            <div className="prose max-w-none text-ink-700 leading-relaxed">
              <p>{longDesc}</p>
            </div>
          )}
          {tab === "curriculum" && (
            <div className="flex flex-col gap-4">
              {course.modules.map((m, idx) => (
                <details
                  key={m.id}
                  className="card p-4 group"
                  open={idx === 0}
                >
                  <summary className="cursor-pointer flex items-center justify-between font-semibold text-ink-900">
                    <span>
                      {idx + 1}. {m.title[locale] ?? m.title.en}
                    </span>
                    <span className="text-xs text-ink-500 font-normal">
                      {m.lessons.length} {t("course.lessons")}
                    </span>
                  </summary>
                  <ul className="mt-3 divide-y divide-ink-100">
                    {m.lessons.map((l) => (
                      <li
                        key={l.id}
                        className="flex items-center gap-3 py-2.5 text-sm text-ink-700"
                      >
                        <PlayCircleIcon className="h-4 w-4 text-ink-400" />
                        <span className="flex-1">{l.title[locale] ?? l.title.en}</span>
                        {l.preview && (
                          <span className="badge badge-emerald">{t("course.preview")}</span>
                        )}
                        <span className="text-xs text-ink-500">{l.durationMin} min</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          )}
          {tab === "reviews" && (
            <div className="card p-8 text-center text-ink-500">
              Student reviews coming soon — be among the first to review this course!
            </div>
          )}
        </div>
      </div>

      <aside className="lg:col-span-1">
        <div className="card p-6 sticky top-20 flex flex-col gap-4">
          <div>
            <div className="text-3xl font-bold text-brand-700">
              {LKR.format(course.price)}
            </div>
            <div className="text-xs text-ink-500 mt-1">
              One-time purchase · lifetime access
            </div>
          </div>
          <button className="btn btn-primary justify-center w-full">
            {t("course.enroll")}
          </button>
          <button className="btn btn-secondary justify-center w-full">
            <HeartIcon className="h-4 w-4" /> {t("student.nav.wishlist")}
          </button>
          <div className="mt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
              {t("course.includes")}
            </div>
            <ul className="text-sm text-ink-700 space-y-2">
              {[
                "course.includes.videos",
                "course.includes.pdfs",
                "course.includes.quizzes",
                "course.includes.live",
                "course.includes.certificate",
              ].map((k) => (
                <li key={k} className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-brand-600 flex-shrink-0" />
                  <span>{t(k)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
