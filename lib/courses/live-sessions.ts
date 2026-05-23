import type { LecturerCourse, WeeklyDay, WeeklyScheduleSlot } from "@/lib/courses/types";

const DAY_ORDER: Record<WeeklyDay, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

export type LecturerLiveSessionRow = {
  courseId: string;
  courseTitle: string;
  courseStatus: LecturerCourse["status"];
  slot: WeeklyScheduleSlot | null;
};

export function listLecturerLiveSessionRows(
  courses: LecturerCourse[],
): LecturerLiveSessionRow[] {
  const rows: LecturerLiveSessionRow[] = [];

  for (const course of courses) {
    if (course.courseType !== "live") continue;
    const title = course.title.trim() || "Untitled course";
    const slots = course.weeklySchedule ?? [];

    if (slots.length === 0) {
      rows.push({
        courseId: course.id,
        courseTitle: title,
        courseStatus: course.status,
        slot: null,
      });
      continue;
    }

    for (const slot of slots) {
      rows.push({
        courseId: course.id,
        courseTitle: title,
        courseStatus: course.status,
        slot,
      });
    }
  }

  return rows.sort((a, b) => {
    if (!a.slot && !b.slot) return a.courseTitle.localeCompare(b.courseTitle);
    if (!a.slot) return 1;
    if (!b.slot) return -1;
    const dayDiff = DAY_ORDER[a.slot.day] - DAY_ORDER[b.slot.day];
    if (dayDiff !== 0) return dayDiff;
    return a.slot.startTime.localeCompare(b.slot.startTime);
  });
}
