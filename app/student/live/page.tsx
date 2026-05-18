"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { CalendarIcon, PlayCircleIcon } from "@/components/icons";
import { LIVE_SESSIONS } from "@/lib/data/mock";
import { formatLiveSessionStart } from "@/lib/format-live-session-start";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function LiveClassesPage() {
  const { t, locale } = useI18n();
  return (
    <>
      <GradientHeader
        title={t("student.nav.live")}
        subtitle="Join scheduled live sessions from your enrolled courses."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LIVE_SESSIONS.map((s) => (
            <div key={s.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="badge badge-rose live-dot">LIVE</span>
                <span className="text-xs text-ink-500">
                  {formatLiveSessionStart(s.startsAt, locale, {
                    weekday: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <h3 className="font-semibold text-ink-900 line-clamp-2">
                {s.courseTitle[locale] ?? s.courseTitle.en}
              </h3>
              <div className="text-sm text-ink-600 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {s.lecturerName}
              </div>
              <button className="btn btn-primary justify-center mt-auto">
                <PlayCircleIcon className="h-4 w-4" /> {t("home.live.join")}
              </button>
            </div>
        ))}
      </div>
    </>
  );
}
