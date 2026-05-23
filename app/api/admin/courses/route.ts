import { NextResponse, type NextRequest } from "next/server";
import { listAdminCourses } from "@/lib/server/admin-courses";
import { requireRole } from "@/lib/server/auth-middleware";

export const runtime = "nodejs";

/** Admin: list all platform courses. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "admin");
  if (!auth.ok) return auth.response;

  try {
    const courses = await listAdminCourses();
    return NextResponse.json({ data: courses });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to load courses", detail },
      { status: 500 },
    );
  }
}
