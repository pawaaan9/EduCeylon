import type { Locale } from "@/lib/i18n/config";

const INTL_BY_LOCALE: Record<Locale, string> = {
  en: "en-LK",
  si: "si-LK",
  ta: "ta-LK",
};

export function intlLocaleFor(locale: Locale): string {
  return INTL_BY_LOCALE[locale];
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [yStr, mStr, dStr] = value.split("-");
  const y = parseInt(yStr!, 10);
  const m = parseInt(mStr!, 10);
  const d = parseInt(dStr!, 10);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

export function formatDateDisplay(
  value: string | undefined,
  locale: Locale,
): string {
  const parsed = parseIsoDate(value);
  if (!parsed) return "";
  return new Intl.DateTimeFormat(intlLocaleFor(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function formatMonthYear(year: number, month: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocaleFor(locale), {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

export function weekdayLabels(locale: Locale): string[] {
  const monday = new Date(2024, 0, 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return new Intl.DateTimeFormat(intlLocaleFor(locale), {
      weekday: "short",
    }).format(d);
  });
}

export type CalendarCell = {
  date: Date;
  iso: string;
  inMonth: boolean;
};

export function calendarCells(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      date,
      iso: toIsoDate(date),
      inMonth: date.getMonth() === month,
    };
  });
}

export function isSameIso(a: string | undefined, b: string): boolean {
  return !!a && a === b;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}
