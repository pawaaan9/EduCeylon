import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug, getLecturerBySlug, COURSES } from "@/lib/data/mock";
import { CourseDetailClient } from "./CourseDetailClient";

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return notFound();
  const lecturer = getLecturerBySlug(course.lecturer.slug) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-ink-500 mb-6">
        <Link href="/" className="hover:text-ink-900">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/courses" className="hover:text-ink-900">
          Courses
        </Link>
      </nav>
      <CourseDetailClient course={course} lecturer={lecturer} />
    </div>
  );
}
