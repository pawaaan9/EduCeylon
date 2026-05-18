"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { CalendarIcon, PlusIcon } from "@/components/icons";
import { LIVE_SESSIONS } from "@/lib/data/mock";
import { formatLiveSessionStart } from "@/lib/format-live-session-start";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function LecturerLivePage() {
  const { t, locale } = useI18n();
  return (
    <>
      <GradientHeader
        title={t("lecturer.nav.live")}
        subtitle="Schedule and manage your live sessions."
        actions={
          <button className="btn bg-white text-brand-700 hover:bg-white/90">
            <PlusIcon className="h-4 w-4" /> Schedule session
          </button>
        }
      />
      <div className="card divide-y divide-ink-100">
        {LIVE_SESSIONS.map((s) => (
            <div key={s.id} className="flex items-center gap-4 p-5">
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 line-clamp-1">
                  {s.courseTitle[locale] ?? s.courseTitle.en}
                </div>
                <div className="text-xs text-ink-500 mt-0.5">
                  {formatLiveSessionStart(s.startsAt, locale, {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {s.durationMin}min
                </div>
              </div>
              <button className="btn btn-secondary">Manage</button>
            </div>
        ))}
      </div>
    </>
  );
}
