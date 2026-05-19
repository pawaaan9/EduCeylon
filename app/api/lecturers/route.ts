import { NextResponse, type NextRequest } from "next/server";
import { listPublicLecturers } from "@/lib/server/public-lecturers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    let list = await listPublicLecturers();
    const search = req.nextUrl.searchParams.get("search");
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.title.toLowerCase().includes(q) ||
          l.subjects.some((s) => s.toLowerCase().includes(q)),
      );
    }
    const limit = req.nextUrl.searchParams.get("limit");
    if (limit) {
      const n = Math.max(1, parseInt(limit, 10) || list.length);
      list = list.slice(0, n);
    }
    return NextResponse.json({ data: list, total: list.length });
  } catch (e) {
    console.error("[api/lecturers]", e);
    return NextResponse.json(
      { error: "Failed to load lecturers" },
      { status: 500 },
    );
  }
}
