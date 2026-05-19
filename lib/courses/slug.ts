/** Stable public URL slug for a course listing/detail page. */
export function coursePublicSlug(title: string, id: string): string {
  const base =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "course";
  const suffix = id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase();
  return suffix ? `${base}-${suffix}` : base;
}

export function resolveCourseSlug(
  course: { slug?: string; title: string; id: string },
): string {
  return course.slug?.trim() || coursePublicSlug(course.title, course.id);
}
