import type { Course, Lecturer } from "@/lib/data/types";

export async function fetchPublicCourses(): Promise<Course[]> {
  const res = await fetch("/api/courses", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load courses");
  const json = (await res.json()) as { data: Course[] };
  return json.data;
}

export async function fetchPublicCourseBySlug(
  slug: string,
): Promise<{ course: Course; lecturer: Lecturer | null } | null> {
  const res = await fetch(`/api/courses/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load course");
  const json = (await res.json()) as { data: { course: Course; lecturer: Lecturer | null } };
  return json.data;
}
