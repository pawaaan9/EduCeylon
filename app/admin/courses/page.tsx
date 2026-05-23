"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { GradientHeader } from "@/components/GradientHeader";
import { StarIcon } from "@/components/icons";
import { fetchAdminCourses, type AdminCourseRow } from "@/lib/api/admin-courses";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { CourseStatus } from "@/lib/courses/types";

const LKR = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

const THUMB_GRADIENTS = [
  "linear-gradient(135deg,#1e3a8a,#2563eb)",
  "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "linear-gradient(135deg,#0d9488,#14b8a6)",
  "linear-gradient(135deg,#b45309,#f59e0b)",
  "linear-gradient(135deg,#be123c,#fb7185)",
  "linear-gradient(135deg,#0369a1,#0ea5e9)",
];

function thumbGradient(id: string): string {
  const hash = id.split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0);
  return THUMB_GRADIENTS[hash % THUMB_GRADIENTS.length]!;
}

function statusBadgeClass(status: CourseStatus): string {
  switch (status) {
    case "pending":
      return "badge-amber";
    case "archived":
      return "badge-rose";
    case "draft":
      return "badge-slate";
    default:
      return "badge-emerald";
  }
}

export default function AdminCoursesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [courses, setCourses] = useState<AdminCourseRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void (async () => {
      try {
        const token = await user.getIdToken();
        const data = await fetchAdminCourses(token);
        if (alive) setCourses(data);
      } catch (e) {
        if (alive) {
          setError(e instanceof Error ? e.message : "Could not load courses");
          setCourses([]);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  return (
    <>
      <GradientHeader
        title={t("admin.nav.courses")}
        subtitle="Approve, reject and moderate platform courses."
      />

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="card overflow-hidden mt-6">
        <table className="min-w-full text-sm">
          <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Course</th>
              <th className="px-5 py-3 text-left font-semibold">Lecturer</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3 text-left font-semibold">Rating</th>
              <th className="px-5 py-3 text-right font-semibold">Price</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {courses === null ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-ink-500">
                  Loading…
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-ink-500">
                  {t("courses.empty")}
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} className="hover:bg-ink-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {c.thumbnailURL ? (
                        <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={c.thumbnailURL}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div
                          className="h-9 w-14 shrink-0 rounded-md"
                          style={{ background: thumbGradient(c.id) }}
                        />
                      )}
                      <div className="font-medium text-ink-900 line-clamp-1">
                        {c.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-700">{c.lecturerName}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${statusBadgeClass(c.status)}`}>
                      {t(`lecturer.courses.status${capitalize(c.status)}`)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-ink-500">
                      <StarIcon className="h-3.5 w-3.5 text-amber-500" />—
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-ink-900">
                    {c.accessType === "free" || c.price === 0
                      ? t("lecturer.create.access.free")
                      : LKR.format(c.price)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button type="button" className="btn btn-ghost h-8 text-xs">
                        {t("admin.action.review")}
                      </button>
                      {c.status === "pending" && (
                        <button type="button" className="btn btn-primary h-8 text-xs">
                          {t("admin.action.approve")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
