import { NextResponse, type NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/server/auth-middleware";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ data: auth.user });
}
