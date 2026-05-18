"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { useT } from "@/lib/i18n/I18nProvider";

const ANN = [
  { title: "New paper class added for week 12", date: "May 14, 2026", body: "I've uploaded the latest paper class covering algebraic manipulations and SHM problems. Please attempt the MCQs before the next live session." },
  { title: "Live session rescheduled", date: "May 09, 2026", body: "Saturday's live session moved to Sunday 7:00 PM due to the public holiday." },
  { title: "Welcome batch 2026!", date: "Apr 21, 2026", body: "Welcome to all new students. Please join the WhatsApp channel for daily reminders." },
];

export default function AnnouncementsPage() {
  const t = useT();
  return (
    <>
      <GradientHeader
        title={t("lecturer.nav.announcements")}
        subtitle="Keep your students in the loop with regular updates."
        actions={<button className="btn bg-white text-brand-700 hover:bg-white/90">New announcement</button>}
      />
      <div className="flex flex-col gap-4">
        {ANN.map((a) => (
          <div key={a.title} className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink-900">{a.title}</h3>
              <span className="text-xs text-ink-500">{a.date}</span>
            </div>
            <p className="text-sm text-ink-700 leading-relaxed mt-2">{a.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
