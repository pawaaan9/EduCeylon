"use client";

import Link from "next/link";
import { GradientHeader } from "@/components/GradientHeader";
import { PlusIcon, StarIcon } from "@/components/icons";
import { COURSES, getCoursesByLecturer } from "@/lib/data/mock";
import { useI18n } from "@/lib/i18n/I18nProvider";

const LKR = new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });

export default function LecturerCoursesPage() {
  const { t, locale } = useI18n();
  const myCourses = getCoursesByLecturer("lec-1").concat(COURSES[6]!);
  return (
    <>
      <GradientHeader
        title={t("lecturer.nav.courses")}
        subtitle="Manage your published and draft courses."
        actions={
          <Link href="/lecturer/create" className="btn bg-white text-brand-700 hover:bg-white/90">
            <PlusIcon className="h-4 w-4" /> New course
          </Link>
        }
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {myCourses.map((c) => (
          <div key={c.id} className="card overflow-hidden flex flex-col">
            <div className="aspect-[16/9]" style={{ background: c.thumbnailGradient }} />
            <div className="p-5 flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <span className={`badge ${c.status === "pending" ? "badge-amber" : "badge-emerald"}`}>{c.status}</span>
                <span className="inline-flex items-center gap-1 text-xs text-ink-600">
                  <StarIcon className="h-3 w-3 text-amber-500" /> {c.rating.toFixed(1)}
                </span>
              </div>
              <h3 className="font-semibold text-ink-900 line-clamp-2">
                {c.title[locale] ?? c.title.en}
              </h3>
              <div className="text-xs text-ink-500">{c.students.toLocaleString()} students enrolled</div>
              <div className="mt-auto flex items-center justify-between pt-3 border-t border-ink-100">
                <div className="text-sm font-bold text-brand-700">{LKR.format(c.price)}</div>
                <button className="btn btn-secondary btn-sm h-9 text-xs">Manage</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
