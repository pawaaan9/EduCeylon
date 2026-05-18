export const SUPPORTED_LOCALES = ["en", "si", "ta"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, { native: string; english: string; flag: string }> = {
  en: { native: "English", english: "English", flag: "EN" },
  si: { native: "සිංහල", english: "Sinhala", flag: "සි" },
  ta: { native: "தமிழ்", english: "Tamil", flag: "த" },
};

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
