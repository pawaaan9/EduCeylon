import { NextResponse, type NextRequest } from "next/server";
import { nextUserId, users } from "@/lib/server/data/store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { name?: string; email?: string; role?: string }
    | null;
  const name = body?.name;
  const email = body?.email;
  const role = body?.role;

  if (!name || !email) {
    return NextResponse.json(
      { error: "name and email are required" },
      { status: 400 },
    );
  }
  if (users.some((u) => u.email === email)) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 },
    );
  }

  const user = {
    id: nextUserId(),
    name,
    email,
    role: role === "lecturer" ? "lecturer" : "student",
    createdAt: new Date().toISOString(),
  } as const;
  users.push(user);

  return NextResponse.json(
    { data: { user, token: `mock-token-${user.id}` } },
    { status: 201 },
  );
}
