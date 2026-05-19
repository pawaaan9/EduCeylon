import { NextResponse } from "next/server";
import { getSubCategorySuggestions } from "@/lib/server/sub-categories";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ data: getSubCategorySuggestions() });
}
