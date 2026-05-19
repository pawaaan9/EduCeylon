import { NextResponse } from "next/server";
import { courses, lecturers } from "@/lib/server/data/store";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  const lecturer = lecturers.find((l) => l.id === course.lecturerId) ?? null;
  return NextResponse.json({ data: { ...course, lecturer } });
}
