import { NextResponse, type NextRequest } from "next/server";
import { lecturers } from "@/lib/server/data/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");
  let list = lecturers.slice();
  if (search && search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q) ||
        l.subjects.some((s) => s.toLowerCase().includes(q)),
    );
  }
  return NextResponse.json({ data: list, total: list.length });
}
