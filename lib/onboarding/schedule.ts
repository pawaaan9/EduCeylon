
export type DayKey =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type DayScheduleSlot = {
  from: string;
  to: string;
};

export type AvailableSchedule = Partial<Record<DayKey, DayScheduleSlot>>;

export const DEFAULT_DAY_SLOT: DayScheduleSlot = {
  from: "08:00",
  to: "20:00",
};

const TIME_RE = /^\d{2}:\d{2}$/;

export function isValidTime24(value: string | undefined): value is string {
  if (!value || !TIME_RE.test(value)) return false;
  const [h, m] = value.split(":").map(Number);
  return h! >= 0 && h! <= 23 && m! >= 0 && m! <= 59;
}

export function minutesFromMidnight(value: string | undefined): number | null {
  if (!isValidTime24(value)) return null;
  const parts = value.split(":").map(Number);
  return parts[0]! * 60 + parts[1]!;
}

export function isValidDaySlot(slot: DayScheduleSlot | undefined): boolean {
  if (!slot || !isValidTime24(slot.from) || !isValidTime24(slot.to)) return false;
  const from = minutesFromMidnight(slot.from);
  const to = minutesFromMidnight(slot.to);
  return from != null && to != null && to > from;
}

export type TeachingScheduleFields = {
  teachingMethods: unknown[];
  availableDays: string[];
  availableSchedule?: AvailableSchedule;
  availableFrom?: string;
  availableTo?: string;
};

export function resolveSchedule(
  days: string[],
  schedule: AvailableSchedule | undefined,
  legacy?: Pick<TeachingScheduleFields, "availableFrom" | "availableTo">,
): AvailableSchedule {
  const fallback: DayScheduleSlot = {
    from:
      legacy?.availableFrom && isValidTime24(legacy.availableFrom)
        ? legacy.availableFrom
        : DEFAULT_DAY_SLOT.from,
    to:
      legacy?.availableTo && isValidTime24(legacy.availableTo)
        ? legacy.availableTo
        : DEFAULT_DAY_SLOT.to,
  };

  const next: AvailableSchedule = {};
  for (const day of days) {
    const key = day as DayKey;
    const existing = schedule?.[key];
    next[key] =
      existing && isValidDaySlot(existing) ? existing : { ...fallback };
  }
  return next;
}

export function syncLegacyAvailability(
  schedule: AvailableSchedule,
  days: string[],
): { availableFrom?: string; availableTo?: string } {
  if (days.length === 0) return {};

  let minFrom: number | null = null;
  let maxTo: number | null = null;

  for (const day of days) {
    const slot = schedule[day as DayKey];
    if (!slot) continue;
    const from = minutesFromMidnight(slot.from);
    const to = minutesFromMidnight(slot.to);
    if (from == null || to == null) continue;
    if (minFrom == null || from < minFrom) minFrom = from;
    if (maxTo == null || to > maxTo) maxTo = to;
  }

  if (minFrom == null || maxTo == null) return {};

  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    availableFrom: `${pad(Math.floor(minFrom / 60))}:${pad(minFrom % 60)}`,
    availableTo: `${pad(Math.floor(maxTo / 60))}:${pad(maxTo % 60)}`,
  };
}

export function isTeachingScheduleComplete(profile: TeachingScheduleFields): boolean {
  return profile.teachingMethods.length > 0;
}
