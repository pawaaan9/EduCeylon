import type { Locale } from "@/lib/i18n/config";

/** Sri Lanka timezone so SSR (Node) and the browser emit identical strings for the same ISO input. */
const TIME_ZONE = "Asia/Colombo";

const TAG: Record<Locale, string> = {
  en: "en-LK",
  si: "si-LK",
  ta: "ta-LK",
};

/** Format a live-session start instant for consistent hydration (do not rely on server default TZ). */
export function formatLiveSessionStart(
  iso: string,
  locale: Locale,
  options: Pick<
    Intl.DateTimeFormatOptions,
    "weekday" | "hour" | "minute" | "day" | "month"
  >,
): string {
  return new Intl.DateTimeFormat(TAG[locale], {
    timeZone: TIME_ZONE,
    hour12: true,
    ...options,
  }).format(new Date(iso));
}
