import { NextResponse } from "next/server";
import { getPublicLecturerBySlug } from "@/lib/server/public-lecturers";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await ctx.params;
    const lecturer = await getPublicLecturerBySlug(slug);
    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }
    return NextResponse.json({ data: lecturer });
  } catch (e) {
    console.error("[api/lecturers/[slug]]", e);
    return NextResponse.json(
      { error: "Failed to load lecturer" },
      { status: 500 },
    );
  }
}
