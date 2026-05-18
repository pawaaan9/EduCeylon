"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Course } from "@/lib/data/types";
import { Avatar } from "./Avatar";
import { ClockIcon, PlayCircleIcon, StarIcon, UsersIcon } from "./icons";

const LKR = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

export function CourseCard({ course }: { course: Course }) {
  const { t, locale } = useI18n();

  const title = course.title[locale] ?? course.title.en;
  const lecturerName = course.lecturer.name;

  const typeBadge =
    course.type === "live"
      ? "badge-rose"
      : course.type === "hybrid"
      ? "badge-amber"
      : "badge-slate";

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col rounded-2xl border border-ink-200 bg-white overflow-hidden hover:shadow-card hover:-translate-y-0.5 transition-all"
    >
      <div
        className="relative aspect-[16/9] w-full overflow-hidden"
        style={{ background: course.thumbnailGradient }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-white/90">
          <PlayCircleIcon className="h-14 w-14 drop-shadow" />
        </div>
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${typeBadge}`}>{t(`type.${course.type}`)}</span>
        </div>
        <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 text-white px-2.5 py-1 text-xs font-medium backdrop-blur">
          <ClockIcon className="h-3.5 w-3.5" />
          {course.hours}h
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span className="badge">{t(`category.${course.category}`)}</span>
          <span>·</span>
          <span>{t(`level.${course.level}`)}</span>
        </div>
        <h3 className="font-semibold text-ink-900 text-base leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-ink-600">
          <Avatar name={lecturerName} size={24} />
          <span className="truncate">{lecturerName}</span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-3 border-t border-ink-100">
          <div className="flex items-center gap-3 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1">
              <StarIcon className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-semibold text-ink-900">
                {course.rating.toFixed(1)}
              </span>
              <span>({course.reviews})</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <UsersIcon className="h-3.5 w-3.5" />
              {course.students.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-brand-700">
              {LKR.format(course.price)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
