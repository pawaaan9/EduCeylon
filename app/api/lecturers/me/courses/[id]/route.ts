import { NextResponse, type NextRequest } from "next/server";
import { verifyBearerToken } from "@/lib/server/auth-middleware";
import {
  deleteCourse,
  getCourseById,
  updateCourse,
} from "@/lib/server/courses";
import type { LecturerCourse } from "@/lib/courses/types";

export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<Params> },
) {
  const auth = await verifyBearerToken(req);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  try {
    const course = await getCourseById(auth.user.uid, id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json({ data: course });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to load course", detail },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<Params> },
) {
  const auth = await verifyBearerToken(req);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const patch =
      body?.course && typeof body.course === "object"
        ? (body.course as Partial<LecturerCourse>)
        : (body as Partial<LecturerCourse>);
    const course = await updateCourse(auth.user.uid, id, patch ?? {});
    return NextResponse.json({ data: course });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    const status = detail === "Course not found" ? 404 : 500;
    return NextResponse.json(
      { error: "Failed to update course", detail },
      { status },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<Params> },
) {
  const auth = await verifyBearerToken(req);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  try {
    await deleteCourse(auth.user.uid, id);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to delete course", detail },
      { status: 500 },
    );
  }
}
