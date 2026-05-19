import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/server/auth-middleware";
import { getAdmin } from "@/lib/server/firebase-admin";
import {
  LECTURER_PROFILES,
  mergeLecturerProfileDoc,
} from "@/lib/server/lecturer-profile";

export const runtime = "nodejs";

/** Admin: read a specific lecturer profile by uid. */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ uid: string }> },
) {
  const auth = await requireRole(req, "admin");
  if (!auth.ok) return auth.response;

  try {
    const { uid } = await ctx.params;
    if (!uid) {
      return NextResponse.json({ error: "uid required" }, { status: 400 });
    }
    const { db } = getAdmin();
    const snap = await db.collection(LECTURER_PROFILES).doc(uid).get();
    if (!snap.exists) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      data: mergeLecturerProfileDoc(
        snap.id,
        snap.data() as Record<string, unknown>,
      ),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to read profile", detail },
      { status: 500 },
    );
  }
}
