import "server-only";
import {
  QUALIFICATION_INSTITUTE_SUGGESTIONS,
  QUALIFICATION_TITLE_SUGGESTIONS,
} from "./data/qualification-suggestions";
import type { LecturerQualification } from "./types";

export {
  QUALIFICATION_INSTITUTE_SUGGESTIONS,
  QUALIFICATION_TITLE_SUGGESTIONS,
};

function newQualificationId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function isQualificationComplete(q: LecturerQualification): boolean {
  return (
    !!q.title.trim() &&
    !!q.institute.trim() &&
    /^\d{4}$/.test(q.year.trim())
  );
}

export function hasValidQualifications(quals: LecturerQualification[]): boolean {
  return quals.some(isQualificationComplete);
}

/** Migrate legacy string tags and partial objects from Firestore. */
export function normalizeQualifications(raw: unknown): LecturerQualification[] {
  if (!Array.isArray(raw)) return [];

  const out: LecturerQualification[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (!trimmed) continue;
      const split = trimmed.match(/^(.+?)\s*[—–-]\s*(.+)$/);
      out.push({
        id: newQualificationId(),
        title: split ? split[1]!.trim() : trimmed,
        institute: split ? split[2]!.trim() : "",
        year: "",
      });
      continue;
    }

    if (isRecord(item)) {
      const title = String(
        item.title ?? item.name ?? item.qualification ?? "",
      ).trim();
      const institute = String(
        item.institute ?? item.institution ?? item.school ?? "",
      ).trim();
      const yearRaw = String(item.year ?? item.obtainedYear ?? "").trim();
      const year = /^\d{4}$/.test(yearRaw) ? yearRaw : "";

      if (!title && !institute) continue;

      out.push({
        id: String(item.id ?? newQualificationId()),
        title,
        institute,
        year,
      });
    }
  }
  return out;
}

export function formatQualification(q: LecturerQualification): string {
  const parts = [q.title.trim()];
  if (q.institute.trim()) parts.push(q.institute.trim());
  if (q.year.trim()) parts.push(q.year.trim());
  return parts.join(" · ");
}

export function filterSuggestions(
  query: string,
  options: readonly string[],
  limit = 8,
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return options.slice(0, limit);
  return options
    .filter((o) => o.toLowerCase().includes(q))
    .slice(0, limit);
}

export function getQualificationSuggestions() {
  return {
    titles: [...QUALIFICATION_TITLE_SUGGESTIONS],
    institutes: [...QUALIFICATION_INSTITUTE_SUGGESTIONS],
  };
}

/** Normalize qualification fields on a raw Firestore profile document. */
export function normalizeProfileQualifications<T extends Record<string, unknown>>(
  data: T,
): T & { qualifications: LecturerQualification[] } {
  const { qualifications: _raw, ...rest } = data;
  void _raw;
  return {
    ...rest,
    qualifications: normalizeQualifications(data.qualifications),
  } as T & { qualifications: LecturerQualification[] };
}
