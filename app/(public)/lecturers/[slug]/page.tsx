import { notFound } from "next/navigation";
import { getPublicLecturerBySlug } from "@/lib/server/public-lecturers";
import { LecturerProfileClient } from "./LecturerProfileClient";

export const dynamic = "force-dynamic";

export default async function LecturerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lecturer = await getPublicLecturerBySlug(slug);
  if (!lecturer) return notFound();
  return <LecturerProfileClient lecturer={lecturer} courses={[]} />;
}
