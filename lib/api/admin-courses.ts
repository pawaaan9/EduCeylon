import { apiGet } from "@/lib/api/client";
import type { AdminCourseRow } from "@/lib/courses/types";

export type { AdminCourseRow };

export async function fetchAdminCourses(token: string): Promise<AdminCourseRow[]> {
  return apiGet<AdminCourseRow[]>("/admin/courses", { token });
}
