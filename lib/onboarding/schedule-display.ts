import type { LecturerProfile } from "@/lib/api/types";
import { formatTime12 } from "@/lib/time/format";
import { resolveSchedule, type DayKey } from "@/lib/onboarding/schedule";

export type TeachingScheduleRow = {
  day: string;
  dayLabel: string;
  from: string;
  to: string;
};

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function getTeachingScheduleRows(
  profile: LecturerProfile,
  dayLabel: (day: string) => string,
): TeachingScheduleRow[] {
  const schedule = resolveSchedule(
    profile.availableDays,
    profile.availableSchedule,
    profile,
  );

  return profile.availableDays
    .map((day) => {
      const slot = schedule[day as DayKey];
      if (!slot) return null;
      return {
        day,
        dayLabel: dayLabel(day),
        from: formatTime12(slot.from),
        to: formatTime12(slot.to),
      };
    })
    .filter((row): row is TeachingScheduleRow => row != null)
    .sort(
      (a, b) =>
        DAY_ORDER.indexOf(a.day as (typeof DAY_ORDER)[number]) -
        DAY_ORDER.indexOf(b.day as (typeof DAY_ORDER)[number]),
    );
}

export function formatTeachingScheduleSummary(
  profile: LecturerProfile,
  dayLabel: (day: string) => string,
): string {
  return getTeachingScheduleRows(profile, dayLabel)
    .map((row) => `${row.dayLabel} ${row.from}–${row.to}`)
    .join("; ");
}
