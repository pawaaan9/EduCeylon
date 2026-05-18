"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { StarIcon } from "@/components/icons";
import { COURSES } from "@/lib/data/mock";
import { useI18n } from "@/lib/i18n/I18nProvider";

const LKR = new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });

export default function AdminCoursesPage() {
  const { t, locale } = useI18n();
  return (
    <>
      <GradientHeader title={t("admin.nav.courses")} subtitle="Approve, reject and moderate platform courses." />
      <div className="card overflow-hidden">
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
            {COURSES.map((c) => (
              <tr key={c.id} className="hover:bg-ink-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-14 rounded-md flex-shrink-0" style={{ background: c.thumbnailGradient }} />
                    <div className="font-medium text-ink-900 line-clamp-1">
                      {c.title[locale] ?? c.title.en}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink-700">{c.lecturer.name}</td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${
                    c.status === "pending" ? "badge-amber" :
                    c.status === "rejected" ? "badge-rose" :
                    c.status === "draft" ? "badge-slate" : "badge-emerald"
                  }`}>{c.status}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-ink-700">
                    <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                    {c.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-ink-900">{LKR.format(c.price)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button className="btn btn-ghost h-8 text-xs">{t("admin.action.review")}</button>
                    {c.status === "pending" && (
                      <button className="btn btn-primary h-8 text-xs">{t("admin.action.approve")}</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
