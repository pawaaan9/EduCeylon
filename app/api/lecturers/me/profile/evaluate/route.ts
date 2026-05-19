import { NextResponse, type NextRequest } from "next/server";
import { verifyBearerToken } from "@/lib/server/auth-middleware";
import {
  evaluateLecturerProfile,
  getLecturerProfileByUid,
} from "@/lib/server/lecturer-profile";
import type { LecturerProfile } from "@/lib/server/types";

export const runtime = "nodejs";

/** Authed lecturer: evaluate draft profile + onboarding step state (no save). */
export async function POST(req: NextRequest) {
  const auth = await verifyBearerToken(req);
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const base = await getLecturerProfileByUid(auth.user.uid);
    const patch = (body?.profile ?? body) as Partial<LecturerProfile>;
    const result = evaluateLecturerProfile(auth.user.uid, patch ?? {}, base);
    return NextResponse.json({ data: result });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to evaluate profile", detail },
      { status: 500 },
    );
  }
}
