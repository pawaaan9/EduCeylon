import { NextResponse, type NextRequest } from "next/server";
import { users } from "@/lib/server/data/store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string }
    | null;
  const email = body?.email;
  if (!email) {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 },
    );
  }
  const user = users.find((u) => u.email === email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    data: { user, token: `mock-token-${user.id}` },
  });
}
