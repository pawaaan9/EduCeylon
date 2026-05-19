import { NextResponse, type NextRequest } from "next/server";
import { users } from "@/lib/server/data/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");
  let list = users.slice();
  if (typeof role === "string") list = list.filter((u) => u.role === role);
  return NextResponse.json({ data: list, total: list.length });
}
