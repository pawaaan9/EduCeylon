import { NextResponse, type NextRequest } from "next/server";
import { verifyBearerToken } from "@/lib/server/auth-middleware";
import {
  getCourseById,
  isCourseAssetKind,
  uploadCourseAsset,
} from "@/lib/server/courses";

export const runtime = "nodejs";

type Params = { id: string };

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<Params> },
) {
  const auth = await verifyBearerToken(req);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;

  const course = await getCourseById(auth.user.uid, id);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = body?.kind;
  const fileName =
    typeof body?.fileName === "string" ? body.fileName : "asset.bin";
  const contentType =
    typeof body?.contentType === "string"
      ? body.contentType
      : "application/octet-stream";
  const dataBase64 =
    typeof body?.dataBase64 === "string" ? body.dataBase64 : "";

  if (!isCourseAssetKind(kind)) {
    return NextResponse.json({ error: "Invalid asset kind" }, { status: 400 });
  }
  if (!dataBase64) {
    return NextResponse.json(
      { error: "dataBase64 is required" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(dataBase64, "base64");
    const url = await uploadCourseAsset(
      auth.user.uid,
      id,
      kind,
      fileName,
      contentType,
      buffer,
    );
    return NextResponse.json({ data: { url } });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: "Failed to upload asset", detail },
      { status: 500 },
    );
  }
}
