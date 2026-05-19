import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireRole } from "@/lib/server/auth-middleware";
import { getAdmin } from "@/lib/server/firebase-admin";
import { LECTURER_PROFILES } from "@/lib/server/lecturer-profile";
import type { LecturerApprovalStatus } from "@/lib/server/types";

export const runtime = "nodejs";

/**
 * Admin: approve or reject a lecturer profile.
 * Body: { status: "approved" | "rejected", reason?: string }
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ uid: string }> },
) {
  const auth = await requireRole(req, "admin");
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const status = body?.status as LecturerApprovalStatus | undefined;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json(
      { error: "status must be 'approved' or 'rejected'" },
      { status: 400 },
    );
  }

  const { uid } = await ctx.params;
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }

  try {
    const { db } = getAdmin();
    const ref = db.collection(LECTURER_PROFILES).doc(uid);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 },
      );
    }

    const update: Record<string, unknown> = {
      approvalStatus: status,
    };

    if (status === "approved") {
      update.approvedAt = FieldValue.serverTimestamp();
      update.rejectedAt = FieldValue.delete();
      update.rejectionReason = FieldValue.delete();
    } else {
      update.rejectedAt = FieldValue.serverTimestamp();
      update.approvedAt = FieldValue.delete();
      update.rejectionReason = reason || FieldValue.delete();
    }

    await ref.set(update, { merge: true });

    // Mirror on the lecturer record so simple checks don't need a join.
    await db
      .collection("lecturers")
      .doc(uid)
      .set({ lecturerApprovalStatus: status }, { merge: true });

    return NextResponse.json({ data: { uid, approvalStatus: status } });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to update profile", detail },
      { status: 500 },
    );
  }
}
