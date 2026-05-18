"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { Avatar } from "@/components/Avatar";
import { CheckCircleIcon, StarIcon } from "@/components/icons";
import { LECTURERS } from "@/lib/data/mock";
import { useT } from "@/lib/i18n/I18nProvider";

export default function AdminLecturersPage() {
  const t = useT();
  return (
    <>
      <GradientHeader title={t("admin.nav.lecturers")} subtitle="Verify lecturers and manage their accounts." />
      <div className="card overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Lecturer</th>
              <th className="px-5 py-3 text-left font-semibold">Subjects</th>
              <th className="px-5 py-3 text-left font-semibold">Students</th>
              <th className="px-5 py-3 text-left font-semibold">Courses</th>
              <th className="px-5 py-3 text-left font-semibold">Rating</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {LECTURERS.map((l) => (
              <tr key={l.id} className="hover:bg-ink-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={l.name} size={36} />
                    <div>
                      <div className="font-medium text-ink-900">{l.name}</div>
                      <div className="text-xs text-ink-500">{l.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {l.subjects.slice(0, 2).map((s) => (
                      <span key={s} className="badge badge-slate">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink-700">{l.students.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-ink-700">{l.courses}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-ink-700">
                    <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                    {l.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${l.verified ? "badge-emerald" : "badge-amber"}`}>
                    {l.verified && <CheckCircleIcon className="h-3 w-3" />}
                    {l.verified ? "Verified" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
