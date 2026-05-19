import { NextResponse, type NextRequest } from "next/server";
import { listPendingLecturerProfiles } from "@/lib/server/admin-lecturers";
import { requireRole } from "@/lib/server/auth-middleware";

export const runtime = "nodejs";

/** Admin: list lecturer profiles awaiting approval. */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "admin");
  if (!auth.ok) return auth.response;

  try {
    const profiles = await listPendingLecturerProfiles();
    return NextResponse.json({ data: profiles });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to load pending profiles", detail },
      { status: 500 },
    );
  }
}
