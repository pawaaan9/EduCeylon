import { NextResponse, type NextRequest } from "next/server";
import { verifyBearerToken } from "@/lib/server/auth-middleware";
import {
  uploadLecturerAsset,
  type UploadKey,
} from "@/lib/server/lecturer-profile";

export const runtime = "nodejs";

const ALLOWED_KEYS: UploadKey[] = [
  "photo",
  "cover",
  "nicFront",
  "nicBack",
  "extraDoc",
];

/** Authed lecturer: upload onboarding asset (base64 body). */
export async function POST(req: NextRequest) {
  const auth = await verifyBearerToken(req);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const key = body?.key as UploadKey | undefined;
  const fileName =
    typeof body?.fileName === "string" ? body.fileName : "image.jpg";
  const contentType =
    typeof body?.contentType === "string" ? body.contentType : "image/jpeg";
  const dataBase64 =
    typeof body?.dataBase64 === "string" ? body.dataBase64 : "";

  if (!key || !ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: "Invalid upload key" }, { status: 400 });
  }
  if (!dataBase64) {
    return NextResponse.json(
      { error: "dataBase64 is required" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(dataBase64, "base64");
    const url = await uploadLecturerAsset(
      auth.user.uid,
      key,
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
