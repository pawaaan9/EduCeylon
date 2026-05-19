import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/server/auth-middleware";
import { getAdmin } from "@/lib/server/firebase-admin";
import {
  LECTURER_PROFILES,
  mergeLecturerProfileDoc,
} from "@/lib/server/lecturer-profile";
import type { LecturerApprovalStatus } from "@/lib/server/types";

export const runtime = "nodejs";

/** Admin: list lecturer profiles by approval status (default: pending). */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "admin");
  if (!auth.ok) return auth.response;

  try {
    const status =
      (req.nextUrl.searchParams.get("status") as
        | LecturerApprovalStatus
        | null) ?? "pending";
    const { db } = getAdmin();
    const snap = await db
      .collection(LECTURER_PROFILES)
      .where("approvalStatus", "==", status)
      .get();
    const data = snap.docs.map((d) =>
      mergeLecturerProfileDoc(d.id, d.data() as Record<string, unknown>),
    );
    return NextResponse.json({ data, total: data.length });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to list profiles", detail },
      { status: 500 },
    );
  }
}
