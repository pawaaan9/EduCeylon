import { NextResponse } from "next/server";
import { courses, lecturers } from "@/lib/server/data/store";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const lecturer = lecturers.find((l) => l.slug === slug);
  if (!lecturer) {
    return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
  }
  const lecturerCourses = courses.filter((c) => c.lecturerId === lecturer.id);
  return NextResponse.json({
    data: { ...lecturer, courses: lecturerCourses },
  });
}
