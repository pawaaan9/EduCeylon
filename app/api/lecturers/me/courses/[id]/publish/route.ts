import { NextResponse, type NextRequest } from "next/server";
import { verifyBearerToken } from "@/lib/server/auth-middleware";
import { publishCourse } from "@/lib/server/courses";

export const runtime = "nodejs";

type Params = { id: string };

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<Params> },
) {
  const auth = await verifyBearerToken(req);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  try {
    const course = await publishCourse(auth.user.uid, id);
    return NextResponse.json({ data: course });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to publish course", detail },
      { status: 500 },
    );
  }
}
