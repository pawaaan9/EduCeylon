import { NextResponse, type NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/server/auth-middleware";
import { saveLecturerProfile } from "@/lib/server/lecturer-profile";
import type { LecturerProfile } from "@/lib/server/types";

export const runtime = "nodejs";

/** Authed lecturer: merge a patch onto your onboarding profile. */
export async function PATCH(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const patch =
      body?.profile && typeof body.profile === "object"
        ? (body.profile as Partial<LecturerProfile>)
        : (body as Partial<LecturerProfile>);
    const result = await saveLecturerProfile(auth.user.uid, patch ?? {});
    return NextResponse.json({ data: result });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to save profile", detail },
      { status: 500 },
    );
  }
}
