"use client";

import Image from "next/image";
import Link from "next/link";
import { Avatar } from "./Avatar";
import type { Lecturer } from "@/lib/data/types";
import { useT } from "@/lib/i18n/I18nProvider";
import { CheckCircleIcon, StarIcon } from "./icons";

const AVATAR_SIZE = 88;

export function LecturerCard({ lecturer }: { lecturer: Lecturer }) {
  const t = useT();
  const hasRating = lecturer.reviews > 0;

  return (
    <Link
      href={`/lecturers/${lecturer.slug}`}
      className="group flex flex-col rounded-2xl border border-ink-200 bg-white hover:shadow-card hover:-translate-y-0.5 transition-all"
    >
      <div className="relative h-28 w-full overflow-hidden rounded-t-2xl bg-ink-100">
        {lecturer.coverURL ? (
          <Image
            src={lecturer.coverURL}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: lecturer.coverGradient }}
          />
        )}
      </div>

      <div className="flex flex-col items-center px-4 pb-4 pt-12 text-center">
        <div className="relative z-10 -mt-[52px] mb-1 rounded-full ring-4 ring-white shadow-md">
          <Avatar
            name={lecturer.name}
            src={lecturer.photoURL}
            size={AVATAR_SIZE}
          />
        </div>

        <h3 className="mt-2 text-base font-semibold text-ink-900 flex items-center justify-center gap-1">
          {lecturer.name}
          {lecturer.verified && (
            <CheckCircleIcon className="h-4 w-4 text-brand-600 shrink-0" />
          )}
        </h3>
        <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{lecturer.title}</p>

        <div className="mt-3 grid grid-cols-3 w-full gap-1.5 text-center">
          <Stat label={t("lecturers.courses")} value={lecturer.courses.toString()} />
          <Stat
            label={t("lecturers.students")}
            value={
              lecturer.students >= 1000
                ? `${(lecturer.students / 1000).toFixed(1)}k`
                : lecturer.students.toString()
            }
          />
          <Stat
            label={t("course.rating")}
            value={hasRating ? lecturer.rating.toFixed(1) : "—"}
            icon={
              hasRating ? (
                <StarIcon className="h-3 w-3 text-amber-500" />
              ) : undefined
            }
          />
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {lecturer.subjects.slice(0, 3).map((s, i) => (
            <span key={`${s}-${i}`} className="badge badge-slate">
              {s}
            </span>
          ))}
        </div>

        <span className="mt-4 inline-flex items-center justify-center w-full btn btn-secondary group-hover:bg-brand-50 group-hover:border-brand-200 group-hover:text-brand-700 transition-colors">
          {t("lecturers.viewProfile")}
        </span>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-ink-50 px-1.5 py-1.5">
      <div className="text-sm font-bold text-ink-900 flex items-center justify-center gap-1">
        {icon}
        {value}
      </div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}
