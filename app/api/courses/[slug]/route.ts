import { NextResponse } from "next/server";
import { getPublicCourseBySlug } from "@/lib/server/public-courses";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await ctx.params;
    const result = await getPublicCourseBySlug(slug);
    if (!result) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json({ data: result });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Failed to load course", detail },
      { status: 500 },
    );
  }
}
