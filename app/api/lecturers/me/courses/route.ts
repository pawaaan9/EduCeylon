import { NextResponse, type NextRequest } from "next/server";
import { verifyBearerToken } from "@/lib/server/auth-middleware";
import { createCourse, listCoursesByLecturer } from "@/lib/server/courses";
import type { LecturerCourse } from "@/lib/courses/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await verifyBearerToken(req);
  if (!auth.ok) return auth.response;

  try {
    const courses = await listCoursesByLecturer(auth.user.uid);
    return NextResponse.json({ data: courses });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to list courses", detail },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyBearerToken(req);
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const patch =
      body?.course && typeof body.course === "object"
        ? (body.course as Partial<LecturerCourse>)
        : (body as Partial<LecturerCourse>);
    const course = await createCourse(auth.user.uid, patch ?? {});
    return NextResponse.json({ data: course }, { status: 201 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to create course", detail },
      { status: 500 },
    );
  }
}
