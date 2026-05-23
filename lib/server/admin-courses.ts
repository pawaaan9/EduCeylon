import "server-only";

import type { AdminCourseRow } from "@/lib/courses/types";
import { listAllLecturerProfiles } from "./admin-lecturers";
import { listAllCourses } from "./courses";

export async function listAdminCourses(): Promise<AdminCourseRow[]> {
  const [courses, profiles] = await Promise.all([
    listAllCourses(),
    listAllLecturerProfiles(),
  ]);

  const lecturerNameById = new Map(
    profiles.map((p) => [
      p.uid,
      p.displayName?.trim() || p.email?.split("@")[0] || p.uid,
    ]),
  );

  return courses.map((course) => ({
    id: course.id,
    title: course.title.trim() || "Untitled course",
    lecturerId: course.lecturerId,
    lecturerName: lecturerNameById.get(course.lecturerId) ?? "Unknown lecturer",
    status: course.status,
    accessType: course.accessType,
    price: course.accessType === "free" ? 0 : Math.max(0, course.price ?? 0),
    thumbnailURL: course.thumbnailURL,
    updatedAt: course.updatedAt,
  }));
}
