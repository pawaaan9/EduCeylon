import { NextResponse } from "next/server";
import { getQualificationSuggestions } from "@/lib/server/qualifications";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ data: getQualificationSuggestions() });
}
