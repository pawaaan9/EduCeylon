"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { useT } from "@/lib/i18n/I18nProvider";

const ANN = [
  { title: "Platform maintenance — Sat 11 PM to 12 AM", date: "May 17, 2026", audience: "All users" },
  { title: "New language: Tamil typography enabled across all pages", date: "May 10, 2026", audience: "All users" },
  { title: "Lecturer onboarding handbook v2 released", date: "Apr 22, 2026", audience: "Lecturers" },
];

export default function AdminAnnouncementsPage() {
  const t = useT();
  return (
    <>
      <GradientHeader
        title={t("admin.nav.announcements")}
        subtitle="Send platform-wide announcements to students and lecturers."
        actions={<button className="btn bg-white text-brand-700 hover:bg-white/90">New announcement</button>}
      />
      <div className="card divide-y divide-ink-100">
        {ANN.map((a) => (
          <div key={a.title} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink-900">{a.title}</h3>
              <span className="text-xs text-ink-500">{a.date}</span>
            </div>
            <div className="mt-1.5">
              <span className="badge">{a.audience}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
