/** Full display names; Sinhala/Tamil use native script. */
export const LANGUAGE_DISPLAY_LABELS: Record<string, string> = {
  si: "සිංහල",
  ta: "தமிழ்",
  en: "English",
};

export function formatLanguagesList(codes: string[]): string {
  return codes
    .map((code) => LANGUAGE_DISPLAY_LABELS[code] ?? code)
    .join(", ");
}
