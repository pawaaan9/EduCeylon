"use client";

import Link from "next/link";
import { Avatar } from "./Avatar";
import type { Lecturer } from "@/lib/data/types";
import { useT } from "@/lib/i18n/I18nProvider";
import { CheckCircleIcon, StarIcon } from "./icons";

export function LecturerCard({ lecturer }: { lecturer: Lecturer }) {
  const t = useT();

  return (
    <Link
      href={`/lecturers/${lecturer.slug}`}
      className="group flex flex-col rounded-2xl border border-ink-200 bg-white overflow-hidden hover:shadow-card hover:-translate-y-0.5 transition-all"
    >
      <div
        className="h-24 w-full"
        style={{ background: lecturer.coverGradient }}
      />
      <div className="px-5 pb-5 -mt-10 flex flex-col items-center text-center">
        <div className="rounded-full ring-4 ring-white">
          <Avatar name={lecturer.name} size={72} />
        </div>
        <h3 className="mt-3 text-base font-semibold text-ink-900 flex items-center gap-1">
          {lecturer.name}
          {lecturer.verified && (
            <CheckCircleIcon className="h-4 w-4 text-brand-600" />
          )}
        </h3>
        <p className="text-xs text-ink-500 mt-0.5">{lecturer.title}</p>

        <div className="mt-4 grid grid-cols-3 w-full gap-2 text-center">
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
            value={lecturer.rating.toFixed(1)}
            icon={<StarIcon className="h-3 w-3 text-amber-500" />}
          />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {lecturer.subjects.slice(0, 3).map((s) => (
            <span key={s} className="badge badge-slate">
              {s}
            </span>
          ))}
        </div>

        <span className="mt-5 inline-flex items-center justify-center w-full btn btn-secondary group-hover:bg-brand-50 group-hover:border-brand-200 group-hover:text-brand-700 transition-colors">
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
    <div className="rounded-xl bg-ink-50 px-2 py-2">
      <div className="text-sm font-bold text-ink-900 flex items-center justify-center gap-1">
        {icon}
        {value}
      </div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}
