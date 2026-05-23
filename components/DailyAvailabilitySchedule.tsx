"use client";

import { useT } from "@/lib/i18n/I18nProvider";
import {
  DEFAULT_DAY_SLOT,
  type AvailableSchedule,
  type DayKey,
  type DayScheduleSlot,
  isValidDaySlot,
} from "@/lib/onboarding/schedule";
import { TimeChipPicker } from "@/components/TimeChipPicker";

export function DailyAvailabilitySchedule({
  days,
  schedule,
  onChange,
}: {
  days: string[];
  schedule: AvailableSchedule;
  onChange: (schedule: AvailableSchedule) => void;
}) {
  const t = useT();

  if (days.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-500">
        {t("onboard.teaching.scheduleSelectDays")}
      </p>
    );
  }

  const firstDay = days[0] as DayKey;

  function updateDay(day: DayKey, patch: Partial<DayScheduleSlot>) {
    const current = schedule[day] ?? { ...DEFAULT_DAY_SLOT };
    onChange({
      ...schedule,
      [day]: { ...current, ...patch },
    });
  }

  function applyToAll() {
    const template = schedule[firstDay] ?? DEFAULT_DAY_SLOT;
    const next: AvailableSchedule = { ...schedule };
    for (const day of days) {
      next[day as DayKey] = { ...template };
    }
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink-900">
            {t("onboard.teaching.scheduleTitle")}
          </p>
          <p className="text-xs text-ink-500">{t("onboard.teaching.scheduleHint")}</p>
        </div>
        {days.length > 1 && (
          <button
            type="button"
            onClick={applyToAll}
            className="text-xs font-semibold text-brand-700 hover:text-brand-800 underline-offset-2 hover:underline"
          >
            {t("onboard.teaching.applyToAll")}
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {days.map((day) => {
          const key = day as DayKey;
          const slot = schedule[key] ?? DEFAULT_DAY_SLOT;
          const invalid = !isValidDaySlot(slot);
          return (
            <li
              key={day}
              className={`flex flex-col gap-2 rounded-xl border bg-white p-3 shadow-sm transition-colors sm:flex-row sm:items-center sm:gap-3 ${
                invalid
                  ? "border-rose-200 ring-1 ring-rose-100"
                  : "border-ink-100 hover:border-brand-200"
              }`}
            >
              <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg brand-gradient text-xs font-bold uppercase text-white shadow-sm">
                {t(`onboard.days.${day}`)}
              </span>
              <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3">
                <TimeChipPicker
                  label={t("onboard.teaching.from")}
                  value={slot.from}
                  onChange={(from) => updateDay(key, { from })}
                />
                <span className="text-ink-300" aria-hidden>
                  →
                </span>
                <TimeChipPicker
                  label={t("onboard.teaching.to")}
                  value={slot.to}
                  onChange={(to) => updateDay(key, { to })}
                />
              </div>
              {invalid && (
                <p className="text-xs text-rose-600 sm:ml-auto">
                  {t("onboard.teaching.dayInvalid")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
