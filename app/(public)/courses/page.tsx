"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "@/components/CourseCard";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CATEGORIES, COURSES } from "@/lib/data/mock";
import { SearchIcon } from "@/components/icons";
import type { CategoryKey, Level, CourseType } from "@/lib/data/types";

const LEVELS: Level[] = ["beginner", "intermediate", "advanced", "allLevels"];
const TYPES: CourseType[] = ["recorded", "live", "hybrid"];

export default function CoursesPage() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey | "all">("all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [type, setType] = useState<CourseType | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (level !== "all" && c.level !== level) return false;
      if (type !== "all" && c.type !== type) return false;
      if (!q) return true;
      const title = (c.title[locale] ?? c.title.en).toLowerCase();
      return (
        title.includes(q) ||
        c.lecturer.name.toLowerCase().includes(q) ||
        c.slug.includes(q)
      );
    });
  }, [query, category, level, type, locale]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl brand-gradient text-white p-8 sm:p-10 shadow-card overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-25"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.35), transparent 50%)",
          }}
        />
        <div className="relative max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("courses.title")}
          </h1>
          <p className="mt-2 text-white/80">{t("courses.subtitle")}</p>
          <div className="mt-6 flex items-center h-12 rounded-xl bg-white/95 text-ink-900 px-4 shadow-lg">
            <SearchIcon className="h-5 w-5 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("courses.search.placeholder")}
              className="flex-1 bg-transparent outline-none px-3 placeholder:text-ink-400"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-72 flex-shrink-0">
          <div className="card p-5 sticky top-20">
            <FilterGroup
              label={t("courses.filter.category")}
              value={category}
              onChange={(v) => setCategory(v as CategoryKey | "all")}
              options={[
                { value: "all", label: t("courses.filter.all") },
                ...CATEGORIES.map((c) => ({
                  value: c.key,
                  label: t(`category.${c.key}`),
                })),
              ]}
            />
            <FilterGroup
              label={t("courses.filter.level")}
              value={level}
              onChange={(v) => setLevel(v as Level | "all")}
              options={[
                { value: "all", label: t("courses.filter.all") },
                ...LEVELS.map((l) => ({ value: l, label: t(`level.${l}`) })),
              ]}
            />
            <FilterGroup
              label={t("courses.filter.type")}
              value={type}
              onChange={(v) => setType(v as CourseType | "all")}
              options={[
                { value: "all", label: t("courses.filter.all") },
                ...TYPES.map((ty) => ({ value: ty, label: t(`type.${ty}`) })),
              ]}
            />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-ink-600">
              <span className="font-semibold text-ink-900">{filtered.length}</span>{" "}
              {t("courses.results")}
            </p>
          </div>
          {filtered.length === 0 ? (
            <div className="card p-12 text-center text-ink-500">
              {t("courses.empty")}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
        {label}
      </div>
      <div className="space-y-1.5">
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                selected
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-ink-700 hover:bg-ink-100"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
