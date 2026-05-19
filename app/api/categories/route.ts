import { NextResponse } from "next/server";
import { categories } from "@/lib/server/data/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ data: categories });
}
