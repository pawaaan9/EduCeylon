import type { Lecturer } from "@/lib/data/types";

export async function fetchPublicLecturers(): Promise<Lecturer[]> {
  const res = await fetch("/api/lecturers", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load lecturers");
  const json = (await res.json()) as { data: Lecturer[] };
  return json.data;
}

export async function fetchPublicLecturerBySlug(
  slug: string,
): Promise<Lecturer | null> {
  const res = await fetch(`/api/lecturers/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load lecturer");
  const json = (await res.json()) as { data: Lecturer };
  return json.data;
}
