"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Course } from "@/lib/data/types";
import { Avatar } from "./Avatar";
import { CourseProgressBar } from "./CourseProgressBar";
import { ClockIcon, PlayCircleIcon, StarIcon, UsersIcon } from "./icons";

const LKR = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

export function CourseCard({
  course,
  href,
  variant = "marketplace",
}: {
  course: Course;
  href?: string;
  variant?: "marketplace" | "enrolled";
}) {
  const { t, locale } = useI18n();

  const title = course.title[locale] ?? course.title.en;
  const lecturerName = course.lecturer.name;
  const link = href ?? `/courses/${course.slug}`;

  const typeBadge =
    course.type === "live"
      ? "badge-rose"
      : course.type === "hybrid"
      ? "badge-amber"
      : "badge-slate";

  return (
    <Link
      href={link}
      className="group flex flex-col rounded-2xl border border-ink-200 bg-white overflow-hidden hover:shadow-card hover:-translate-y-0.5 transition-all"
    >
      <div
        className="relative aspect-[16/9] w-full overflow-hidden"
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
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover"
            unoptimized
          />
        ) : null}
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
        </div>
        <h3 className="font-semibold text-ink-900 text-base leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-ink-600">
          <Avatar
            name={lecturerName}
            src={course.lecturer.photoURL}
            size={24}
          />
          <span className="truncate">{lecturerName}</span>
        </div>
        {variant === "enrolled" && (
          <CourseProgressBar
            percent={course.progressPercent ?? 0}
            size="sm"
          />
        )}
        <div className="mt-auto flex items-end justify-between pt-3 border-t border-ink-100">
          {variant === "enrolled" ? (
            <div className="text-xs text-ink-500">
              {course.progressPercent ?? 0}% {t("student.study.complete")}
            </div>
          ) : (
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
          )}
          <div className="text-right">
            {variant === "enrolled" ? (
              <div className="text-sm font-semibold text-brand-700">
                {t("student.study.continueLearning")}
              </div>
            ) : (
              <div className="text-lg font-bold text-brand-700">
                {course.price > 0
                  ? LKR.format(course.price)
                  : t("lecturer.create.access.free")}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
