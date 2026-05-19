import { NextResponse, type NextRequest } from "next/server";
import { listPublicCourses } from "@/lib/server/public-courses";
import type { CourseType, Level } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    let list = await listPublicCourses();

    const category = sp.get("category");
    const level = sp.get("level");
    const type = sp.get("type");
    const language = sp.get("language");
    const search = sp.get("search")?.trim().toLowerCase();

    if (category && category !== "all") {
      list = list.filter((c) => c.category === category);
    }
    if (level && level !== "all") {
      list = list.filter((c) => c.level === (level as Level));
    }
    if (type && type !== "all") {
      list = list.filter((c) => c.type === (type as CourseType));
    }
    if (language && language !== "all") {
      list = list.filter((c) => c.language === (language as Locale));
    }
    if (search) {
      list = list.filter((c) => {
        const title = c.title.en.toLowerCase();
        return (
          title.includes(search) ||
          c.slug.includes(search) ||
          c.lecturer.name.toLowerCase().includes(search)
        );
      });
    }

    return NextResponse.json({ data: list, total: list.length });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Failed to list courses", detail },
      { status: 500 },
    );
  }
}
