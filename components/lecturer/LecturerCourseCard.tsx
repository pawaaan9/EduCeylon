"use client";

import Image from "next/image";
import Link from "next/link";
import { EditIcon } from "@/components/icons";
import type { CourseStatus, LecturerCourse } from "@/lib/courses/types";

const LKR = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

const STATUS_BADGE: Record<CourseStatus, string> = {
  draft: "badge-slate",
  pending: "badge-amber",
  published: "badge-emerald",
  archived: "badge-slate",
};

export function LecturerCourseCard({
  course,
  t,
}: {
  course: LecturerCourse;
  t: (key: string) => string;
}) {
  const totalLessons = course.modules.reduce(
    (acc, m) => acc + (m.lessons?.length ?? 0),
    0,
  );
  const metaLabel =
    course.courseType === "live"
      ? t("lecturer.courses.liveClass")
      : `${course.modules.length} ${t("lecturer.courses.modules")} · ${totalLessons} ${t("lecturer.courses.lessons")}`;

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="aspect-[16/9] relative bg-ink-100">
        {course.thumbnailURL ? (
          <Image
            src={course.thumbnailURL}
            alt={course.title || t("lecturer.courses.untitled")}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
            }}
          />
        )}
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <span className={`badge ${STATUS_BADGE[course.status]}`}>
            {t(`lecturer.courses.status${capitalize(course.status)}`)}
          </span>
          <span className="text-xs text-ink-500">{metaLabel}</span>
        </div>
        <h3 className="font-semibold text-ink-900 line-clamp-2">
          {course.title.trim() || t("lecturer.courses.untitled")}
        </h3>
        {course.subtitle && (
          <p className="text-xs text-ink-500 line-clamp-2">{course.subtitle}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-ink-100">
          <div className="text-sm font-bold text-brand-700">
            {course.accessType === "free" || !course.price
              ? t("lecturer.create.access.free")
              : LKR.format(course.price)}
          </div>
          <Link
            href={`/lecturer/create?id=${encodeURIComponent(course.id)}`}
            className="btn btn-secondary btn-sm h-9 text-xs inline-flex items-center gap-1.5"
          >
            <EditIcon className="h-3.5 w-3.5" />
            {t("lecturer.courses.manage")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
