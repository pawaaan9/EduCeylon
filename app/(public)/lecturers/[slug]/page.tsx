import { notFound } from "next/navigation";
import {
  LECTURERS,
  getCoursesByLecturer,
  getLecturerBySlug,
} from "@/lib/data/mock";
import { LecturerProfileClient } from "./LecturerProfileClient";

export function generateStaticParams() {
  return LECTURERS.map((l) => ({ slug: l.slug }));
}

export default async function LecturerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lecturer = getLecturerBySlug(slug);
  if (!lecturer) return notFound();
  const courses = getCoursesByLecturer(lecturer.id);
  return <LecturerProfileClient lecturer={lecturer} courses={courses} />;
}
