"use client";

import { CourseCard } from "@/components/CourseCard";
import { GradientHeader } from "@/components/GradientHeader";
import { COURSES } from "@/lib/data/mock";
import { useT } from "@/lib/i18n/I18nProvider";

export default function WishlistPage() {
  const t = useT();
  const items = COURSES.filter((c) => c.featured).slice(0, 3);
  return (
    <>
      <GradientHeader
        title={t("student.nav.wishlist")}
        subtitle="Courses you've saved for later."
      />
      {items.length === 0 ? (
        <div className="card p-12 text-center text-ink-500">
          Your wishlist is empty.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </>
  );
}
