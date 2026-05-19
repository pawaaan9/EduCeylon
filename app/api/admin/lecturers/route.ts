import { NextResponse, type NextRequest } from "next/server";
import { listAllLecturerProfiles } from "@/lib/server/admin-lecturers";
import { requireRole } from "@/lib/server/auth-middleware";

export const runtime = "nodejs";

/** Admin: list all lecturer onboarding profiles. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "admin");
  if (!auth.ok) return auth.response;

  try {
    const profiles = await listAllLecturerProfiles();
    return NextResponse.json({ data: profiles });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to load lecturers", detail },
      { status: 500 },
    );
  }
}
