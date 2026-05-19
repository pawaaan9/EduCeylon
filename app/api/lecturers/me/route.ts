import { NextResponse, type NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/server/auth-middleware";
import {
  evaluateLecturerProfile,
  getLecturerProfileByUid,
} from "@/lib/server/lecturer-profile";

export const runtime = "nodejs";

/** Authed lecturer: read your own onboarding profile. */
export async function GET(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (!auth.ok) return auth.response;

  try {
    const profile = await getLecturerProfileByUid(auth.user.uid);
    if (!profile) {
      return NextResponse.json({ data: null });
    }
    const evaluated = evaluateLecturerProfile(auth.user.uid, profile, profile);
    return NextResponse.json({
      data: {
        profile: evaluated.profile,
        onboarding: evaluated.onboarding,
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to read profile", detail },
      { status: 500 },
    );
  }
}
