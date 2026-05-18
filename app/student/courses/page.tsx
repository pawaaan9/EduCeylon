"use client";

import { CourseCard } from "@/components/CourseCard";
import { GradientHeader } from "@/components/GradientHeader";
import { COURSES } from "@/lib/data/mock";
import { useT } from "@/lib/i18n/I18nProvider";

export default function StudentCoursesPage() {
  const t = useT();
  const enrolled = COURSES.slice(0, 4);

  return (
    <>
      <GradientHeader
        title={t("student.nav.myCourses")}
        subtitle="Pick up where you left off and keep your streak alive."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrolled.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </>
  );
}
