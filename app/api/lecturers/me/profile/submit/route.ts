import { NextResponse, type NextRequest } from "next/server";
import { verifyBearerToken } from "@/lib/server/auth-middleware";
import { submitLecturerProfileForReview } from "@/lib/server/lecturer-profile";

export const runtime = "nodejs";

/** Authed lecturer: submit profile for admin review. */
export async function POST(req: NextRequest) {
  const auth = await verifyBearerToken(req);
  if (!auth.ok) return auth.response;

  try {
    const result = await submitLecturerProfileForReview(auth.user.uid);
    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    if (message.includes("not complete")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to submit profile", detail: message },
      { status: 500 },
    );
  }
}
