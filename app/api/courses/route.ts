import { NextResponse, type NextRequest } from "next/server";
import { courses, lecturers } from "@/lib/server/data/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  let list = courses.slice();

  const category = sp.get("category");
  const level = sp.get("level");
  const type = sp.get("type");
  const language = sp.get("language");
  const status = sp.get("status");
  const featured = sp.get("featured");
  const trending = sp.get("trending");
  const search = sp.get("search");

  if (category) list = list.filter((c) => c.category === category);
  if (level) list = list.filter((c) => c.level === level);
  if (type) list = list.filter((c) => c.type === type);
  if (language) list = list.filter((c) => c.language === language);
  if (status) list = list.filter((c) => c.status === status);
  if (featured === "true") list = list.filter((c) => c.featured);
  if (trending === "true") list = list.filter((c) => c.trending);
  if (search && search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (c) =>
        c.title.en.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q),
    );
  }

  const withLecturer = list.map((c) => ({
    ...c,
    lecturer: lecturers.find((l) => l.id === c.lecturerId) ?? null,
  }));

  return NextResponse.json({ data: withLecturer, total: withLecturer.length });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  const title = body?.title as { en?: string } | undefined;
  const lecturerId = body?.lecturerId as string | undefined;

  if (!title?.en || !lecturerId) {
    return NextResponse.json(
      { error: "title.en and lecturerId are required" },
      { status: 400 },
    );
  }
  const id = `c-${Date.now().toString(36)}`;
  const slug =
    typeof body?.slug === "string"
      ? body.slug
      : String(title.en)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

  const course = {
    id,
    slug,
    title: title as { en: string; si?: string; ta?: string },
    description: (body?.description as { en?: string }) ?? { en: "" },
    category: (body?.category as string) ?? "skills",
    level: (body?.level as string) ?? "allLevels",
    type: (body?.type as string) ?? "recorded",
    language: (body?.language as string) ?? "en",
    price: Number(body?.price ?? 0),
    rating: 0,
    reviews: 0,
    students: 0,
    lessons: Number(body?.lessons ?? 0),
    hours: Number(body?.hours ?? 0),
    status: "pending" as const,
    featured: false,
    trending: false,
    lecturerId,
  };
  // Cast back to Course shape after build.
  courses.push(course as (typeof courses)[number]);
  return NextResponse.json({ data: course }, { status: 201 });
}
